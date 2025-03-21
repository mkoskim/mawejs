//*****************************************************************************
//*****************************************************************************
//
// Nested editing with SlateJS
//
//*****************************************************************************
//*****************************************************************************

import {
  Editor,
  Node, Text,
  Transforms,
  Range, Point,
  createEditor,
  Element,
} from 'slate'
import { withHistory } from "slate-history"
import { withReact } from 'slate-react'

import { wcElem, wcCompare, elemHeading, elemHeadParse, elemHeadAttrs} from '../../document/util';

import {
  nodeTypes,
  paragraphTypes, MARKUP,
  nodeIsContainer,
  nodeIsBreak,
  nodeBreaks,
} from '../../document/elements';

import {foldNode} from "./slateFolding"

import {
  elemIsBlock,
} from "./slateHelpers"

import {text2lines} from '../import/util';

//-----------------------------------------------------------------------------
//
// Short description of buffer format:
//
//  children = [
//    act: [
//      hact (act hader/name)
//      chapter: [
//        hchapter (chapter header/name)
//        scene: [
//          hscene / hsynopsis / hnotes
//          paragraph
//          paragraph
//          ...
//        ]
//        scene
//        scene
//      ]
//      chapter
//      chapter
//    ]
//    act
//    act
//  ]
//
//-----------------------------------------------------------------------------

//*****************************************************************************
//
// Editor customizations
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Core editor for programmatic doc modifications
//-----------------------------------------------------------------------------

export function getCoreEditor() {
  return [
    createEditor,
    // Base editor
    withHistory,
    withWordCount,    // Autogenerate word counts
    withBR,           // empty <p> -> <br>
    withFixNesting,   // Keep correct nesting: chapter -> scene -> paragraph
    withNoEmptySect,  // Prevent totally empty sections
  ].reduce((editor, func) => func(editor), undefined)
}

//-----------------------------------------------------------------------------
// Editor for UI use
//-----------------------------------------------------------------------------

export function getUIEditor() {

  return [
    getCoreEditor,

    withReact,
    withMarkup,           // Markups (##, **, //, etc)
    withTextPaste,        // Improved text paste
    withProtectFolds,     // Prevents messing with folded blocks
  ].reduce((editor, func) => func(editor), undefined)
}

//*****************************************************************************
//
// Pasting text to editor
//
//*****************************************************************************

function withTextPaste(editor) {

  //---------------------------------------------------------------------------
  // Slate default behaviour: Pasted elements come to insertData(data)
  // method. It tries to insertFragmentData(data), which checks if the data
  // in clipboard is copied/cutted SlateJS object. If not, it falls back
  // to insertTextData(data).
  //---------------------------------------------------------------------------

  const { insertTextData } = editor

  editor.insertTextData = data => {
    //console.log("insertTextData:", data)
    // return insertTextData(data)

    const text = data.getData('text/plain')
    if(!text) return false;

    //console.log(text)

    const [first, ...lines] = text2lines(text);

    //*
    Editor.withoutNormalizing(editor, () => {
      editor.insertText(first)
      editor.insertNodes(lines.map(line => ({
        type: line ? "p" : "br",
        children: [{text: line}]
      })))
    })
    /**/
    return true
  }

  //---------------------------------------------------------------------------

  /*
  // Overridden for testing purposes:
  const { insertFragmentData } = editor

  editor.insertFragmentData = data => {
    //console.log("insertFragmentData:", data)
    //return insertFragmentData(data)
    return false
  }
  /**/

  /*
  //---------------------------------------------------------------------------

  const { insertData } = editor

  editor.insertData = data => {
    console.log("insertData:", data)
    return insertData(data)
  }
  /**/

  return editor;
}

//*****************************************************************************
//
// With Markups
//
//*****************************************************************************

function withMarkup(editor) {

  const { insertText } = editor

  editor.insertText = text => {
    const { selection } = editor

    if(!selection) return insertText(text)
    if(!Range.isCollapsed(selection)) return insertText(text)

    const [node, path] = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    })

    const start = Editor.start(editor, path)
    const range = { anchor: selection.anchor, focus: start }
    const key = Editor.string(editor, range) + text

    if(key in MARKUP) {
      Transforms.select(editor, range)
      Transforms.delete(editor)
      Transforms.setNodes(editor, MARKUP[key])
      return
    }

    insertText(text)
  }

  //---------------------------------------------------------------------------
  // Pressing ENTER at EOL

  const { insertBreak } = editor

  editor.insertBreak = () => {
    const { selection } = editor

    if(!selection) return insertBreak()
    if(!Range.isCollapsed(selection)) return insertBreak()

    const [node, path] = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    })

    if(node && node.type in paragraphTypes) {
      const end = Editor.end(editor, path)
      const {focus} = selection
      const {reset, eol} = paragraphTypes[node.type]

      // If we hit enter at empty line, and block type is RESETEMPTY, reset type
      if(reset && Node.string(node) == "") {
        Transforms.setNodes(editor, {type: reset});
        return
      }

      if(eol && Point.equals(focus, end)) {
        // If we hit enter at line, which has STYLEAFTER, split line and apply style
        Editor.withoutNormalizing(editor, () => {
          Transforms.splitNodes(editor, {always: true})
          Transforms.setNodes(editor, {type: eol})
        })
        return
      }
    }

    return insertBreak()
  }

  //---------------------------------------------------------------------------
  // Backspace at the start of line resets formatting

  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if(!selection) return deleteBackward(...args)
    if(!Range.isCollapsed(selection)) return deleteBackward(...args)

    // Which block we are:
    const match = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    })
    if(!match) return deleteBackward(...args)

    const [node, path] = match

    if(!elemIsBlock(editor, node)) return deleteBackward(...args)

    if(node.type in paragraphTypes) {
      // Beginning of line?
      if(!Point.equals(selection.anchor, Editor.start(editor, path))) return deleteBackward(...args)

      const {bk} = paragraphTypes[node.type]
      if(bk) {
        // Remove formatting
        Transforms.setNodes(editor, {type: bk})
        return
      }
    }

    return deleteBackward(...args)
  }

  return editor
}

//*****************************************************************************
//
// With Word Count
//
//*****************************************************************************

function withWordCount(editor) {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry)=> {
    const [node, path] = entry

    if(Editor.isEditor(node)) return normalizeNode(entry)
    if(!Editor.isBlock(editor, node)) return normalizeNode(entry)

    const words = wcElem(node)
    if(!wcCompare(words, node.words)) {
      Transforms.setNodes(editor, {words}, {at: path})
      return;
    }

    return normalizeNode(entry);
  }

  return editor;
}

//*****************************************************************************
//
// Prevent totally empty sections
//
//*****************************************************************************

function withNoEmptySect(editor) {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry)=> {
    const [node] = entry

    if(Editor.isEditor(node) && !node.children.length) {
      Transforms.insertNodes(editor, {type: "br", children: [{text: ""}]})
      return
      //console.log("Editor:", node.children)
      //return normalizeNode(entry)
    }

    return normalizeNode(entry);
  }

  return editor;
}

//*****************************************************************************
//
// With Breaks (br elements)
//
//*****************************************************************************

function withBR(editor) {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry)=> {
    const [node, path] = entry

    if(node.type === "p") {
      if(Node.string(node) === "") {
        Transforms.setNodes(editor, {type: "br"}, {at: path})
        return
      }
    }
    if(node.type === "br") {
      if(Node.string(node) !== "") {
        Transforms.setNodes(editor, {type: "p"}, {at: path})
        return
      }
    }

    return normalizeNode(entry);
  }

  return editor;
}

//-----------------------------------------------------------------------------
// Folded block protection: The main principle is to protect the hidden block
// from changes. If it can't be prevented, the block is unfolded.
//-----------------------------------------------------------------------------

function withProtectFolds(editor) {
  const {
    deleteBackward, deleteForward,
    insertText, insertBreak,
    apply,
  } = editor

  function unfoldSelection() {
    const match = Editor.above(editor, {
      match: n => Element.isElement(n) && n.folded,
    })
    if(!match) return false
    const [node, path] = match
    foldNode(editor, node, path, false)
    return true
  }

  editor.insertBreak = () => {
    if(!unfoldSelection()) insertBreak()
  }

  editor.deleteBackward = (options) => {
    unfoldSelection()
    return deleteBackward(options)
  }

  editor.deleteForward = (options) => {
    unfoldSelection()
    return deleteForward(options)
  }

  editor.insertText = (text, options) => {
    unfoldSelection()
    //console.log("insertText", text, options)
    return insertText(text, options)
  }

  return editor
}

//*****************************************************************************
//
// Maintain nested buffer integrity
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// This is bit complex, mainly because it needs to be done in the order
// the normalize() feeds elements.
//
// normalize() feeds elements in bottom-up order. That means, that if you
// press "A" to insert a letter A to text block, the blocks are coming to
// normalizer() in following order:
//
//    1. Text node where the letter was inserted
//    2. Paragraph block containing the text node
//    3. Scene block containing the paragraph
//    4. Chapter block containing the scene
//    5. Editor containing the chapter
//
// What we strive for, is that:
//
//    1. Every chapter starts with chapter header
//    2. Every scene starts with scene header
//
// How we do that? As headers are the elements explicitly placed by user,
// we try to make the nesting match to the placement of headers.
//
// AS WITH FLAT EDITOR, headers are in fact *breaks*.
//
// So,
//
//    1. If you remove header, merge the block to previous one
//    2. If you place header in middle of scene, split the group from
//       that point (either to new scene or new chapter)
//
// There are two places where header is forced: (1) first chapter, and (2) first
// scene in the chapter. I try to get rid of that restriction, it would help
// greatly!
//
//-----------------------------------------------------------------------------


function withFixNesting(editor) {

  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry

    //console.log("Fix:", path, node)

    if(Text.isText(node)) return normalizeNode(entry)
    if(Editor.isEditor(node)) {
      if(!mergeHeadlessChilds(node, path)) return
      return normalizeNode(entry)
    }

    //console.log("Fix nesting:", node, path)

    const nodeType = nodeTypes[node.type]

    // Container types

    if(nodeIsContainer(node)) {
      //console.log("Fix nesting: Block:", node.type)

      if(!node.children.length) {
        Transforms.removeNodes(editor, {at: path})
        return;
      }

      if(path.length > nodeType.level) {
        Transforms.liftNodes(editor, {at: path})
        return;
      }

      if(nodeType.parent && !checkParent(node, path, nodeType.parent)) return

      if(!mergeHeadlessChilds(node, path)) return;
      updateBlockAttributes(node, path)
      return normalizeNode(entry)
    }
    else {
      // Check parent

      if(!checkParent(node, path, nodeType.parent)) return

      // Block headers
      if(nodeIsBreak(node)) {
        if(!checkIsFirst(node, path, nodeType.parent)) return
        updateHeadAttributes(node, path)
      }
    }
    return normalizeNode(entry)
  }

  return editor

  //---------------------------------------------------------------------------
  // Check, that paragraphs are parented to scenes, and scenes are parented to
  // chapters: if not, put it into a scene wrapping and let further processing
  // merge it.
  //---------------------------------------------------------------------------

  function checkParent(node, path, type) {
    //console.log("FixNesting: Check parent", node, path, type)
    const [parent, ppath] = Editor.parent(editor, path)

    if(parent.type === type) return true

    //console.log("FixNesting: Parent:", path, node, type)
    Transforms.wrapNodes(editor, {type}, {at: path})
    //console.log("Node:", node.type, "Parent:", parent.type, "->", type)
    return false
  }

  //---------------------------------------------------------------------------
  // Check, if header is at the beginning of block - if not, make it one.
  //---------------------------------------------------------------------------

  function checkIsFirst(node, path, type) {
    const index = path[path.length-1]

    //console.log("hscene", parent)

    if(!index) return true

    //console.log("FixNesting: Splitting", path, hscene, "scene")
    Editor.withoutNormalizing(editor, () => {
      Transforms.wrapNodes(editor, {type}, {at: path})
      Transforms.liftNodes(editor, {at: path})
    })
    return false
  }

  //---------------------------------------------------------------------------
  // Node attribute modifying
  //---------------------------------------------------------------------------

  function modifyAttributes(node, path, attr) {
    var modify = {}

    for(const [key, value] of Object.entries(attr)) {
      if(node[key] !== value) modify[key] = value
    }

    //console.log("Attrs:", node, modify)

    if(Object.keys(modify).length) {
      Transforms.setNodes(editor, modify, {at: path})
      return false
    }

    return true
  }

  //---------------------------------------------------------------------------
  // Update head attributes
  //---------------------------------------------------------------------------

  function updateHeadAttributes(node, path) {
    const {name, numbered, target} = elemHeadParse(node)

    modifyAttributes(node, path, {name, numbered, target})
  }

  //---------------------------------------------------------------------------
  // Update block attributes from head element
  //---------------------------------------------------------------------------

  function updateBlockAttributes(node, path) {
    const attrs = elemHeadAttrs(node)
    //console.log("Copy attrs:", node.type, "Attrs:", attrs)
    return modifyAttributes(node, path, attrs)
  }

  //---------------------------------------------------------------------------
  // Merge childs without header
  //---------------------------------------------------------------------------

  function mergeHeadlessChilds(block, path) {

    for(const child of Node.children(editor, path)) {
      const [node, path] = child

      if(!nodeIsContainer(node)) continue
      if(nodeBreaks(elemHeading(node)) === node.type) continue

      const prev = Editor.previous(editor, {at: path})

      //console.log("Headless:", block, "Previous:", prev)

      // Can we merge headingless block?
      if(prev && prev[0].type === node.type) {
        //console.log("Merging")
        foldNode(editor, prev[0], prev[1], false)
        foldNode(editor, block, path, false)
        Transforms.mergeNodes(editor, {at: path})

        return false
      }
    }

    // Otherwise the block is fine as it is
    return true
  }
}
