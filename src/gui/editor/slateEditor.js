//*****************************************************************************
//*****************************************************************************
//
// Nested editing with SlateJS
//
//*****************************************************************************
//*****************************************************************************

import React, { useMemo, useCallback } from 'react';
import { useSlate, Editable, withReact, ReactEditor } from 'slate-react'
import {
  Editor,
  Node, Text,
  Transforms,
  Range, Point,
  createEditor,
  Element,
  Path,
} from 'slate'

import { withHistory } from "slate-history"
import { addClass, IsKey, ListItemText, Separator } from '../common/factory';
import { wcElem, wcCompare, elemHeading, elemHeadParse, elemHeadAttrs} from '../../document/util';

import {
  nodeTypes,
  paragraphTypes, MARKUP,
  nodeIsContainer,
  nodeIsBreak,
  nodeBreaks,
  nodeShortcuts,
  markShortcuts,
} from '../../document/elements';

import {
  text2Regexp, searchOffsets, searchPattern,
  isAstChange,
  searchFirst, searchForward, searchBackward,
  focusByPath,
  elemIsBlock,
  toggleFold, foldAll, doFold,
} from "./slateHelpers"

import {
  MakeToggleGroup, Button, Icon, ToggleButton, IconButton,
  Menu, MenuItem, ListItemIcon, Typography,
} from '../common/factory';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { text2lines } from '../import/util';

export {
  text2Regexp,
  isAstChange,
  searchFirst, searchForward, searchBackward,
  focusByPath,
}

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
// Slate Editable
//
//*****************************************************************************

export function SlateEditable({className, highlight, ...props}) {
  //console.log("Search:", search)

  const editor = useSlate()

  const re = useMemo(() => searchPattern(highlight), [highlight])

  const highlighter = useCallback(
    re
    ?
    ([node, path]) => {
      if (!Text.isText(node)) return []

      const offsets = searchOffsets(Node.string(node), re)
      const ranges = offsets.map(offset => ({
        anchor: {path, offset},
        focus: {path, offset: offset + highlight.length},
        highlight: true,
      }))
      //if(ranges.length) console.log(ranges)

      return ranges
    }
    :
    undefined,
    [re]
  )

  return <Editable
    className={className}
    spellCheck={false} // Keep false until you find out how to change language
    renderElement={renderElement}
    renderLeaf={renderLeaf}
    decorate={highlighter}
    onKeyDown={useCallback(e => onKeyDown(editor, e), [editor])}
    //onPaste={useCallback(e => onPaste(editor, e), [editor])}
    {...props}
  />
}

//*****************************************************************************
//
// Buffer rendering
//
//*****************************************************************************

// Turn some debug features on/off - off by default

const debug = {
  //blocks: "withBorders",  // Borders around chapter & scene div's to make them visible
}

function renderElement({element, attributes, ...props}) {

  const {type, folded, numbered, content} = element

  const foldClass = folded ? "folded" : ""
  const numClass = numbered ? "Numbered" : ""

  switch (type) {
    //-------------------------------------------------------------------------
    // Containers
    //-------------------------------------------------------------------------

    case "act":
      return <div className={addClass("act", foldClass, debug?.blocks)} {...attributes} {...props}/>
    case "chapter":
      return <div className={addClass("chapter", foldClass, debug?.blocks)} {...attributes} {...props}/>
    case "scene": {
      return <div className={addClass(content, foldClass, debug?.blocks)} {...attributes} {...props}/>
    }

    //-------------------------------------------------------------------------
    // Container breaks
    //-------------------------------------------------------------------------

    case "hact": return <h4 {...attributes} {...props}/>
    case "hchapter": return <h5 className={numClass} {...attributes} {...props}/>
    case "hsynopsis":
    case "hnotes":
    case "hscene": return <h6 {...attributes} {...props}/>

    //-------------------------------------------------------------------------
    // Paragraphs
    //-------------------------------------------------------------------------

    case "bookmark":
    case "comment":
    case "missing":
    case "tags":
    case "fill":
      return <p className={addClass(element.type, foldClass)} {...attributes} {...props}/>

    case "br":
      return <div className="emptyline" {...attributes} {...props}/>

    case "p":
    default: break;
  }

  return <p {...attributes} {...props}/>
}

function renderLeaf({ leaf, attributes, children}) {
  if(leaf.bold) {
    children = <strong>{children}</strong>
  }
  if(leaf.italic) {
    children = <em>{children}</em>
  }

  const className = [
    leaf.highlight ? "highlight" : undefined,
    leaf.target ? "target" : undefined,
  ].filter(e => e).join(" ")

  return <span className={className} {...attributes}>{children}</span>
}

//*****************************************************************************
//
// Custom paste
//
//*****************************************************************************

function onPaste(editor, event) {
  console.log("Paste:", event)
}

/*
onPaste={useCallback(
  (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (
      !readOnly &&
      ReactEditor.hasEditableTarget(editor, event.target) &&
      !isEventHandled(event, attributes.onPaste)
    ) {
      // COMPAT: Certain browsers don't support the `beforeinput` event, so we
      // fall back to React's `onPaste` here instead.
      // COMPAT: Firefox, Chrome and Safari don't emit `beforeinput` events
      // when "paste without formatting" is used, so fallback. (2020/02/20)
      // COMPAT: Safari InputEvents generated by pasting won't include
      // application/x-slate-fragment items, so use the
      // ClipboardEvent here. (2023/03/15)
      if (
        !HAS_BEFORE_INPUT_SUPPORT ||
        isPlainTextOnlyPaste(event.nativeEvent) ||
        IS_WEBKIT
      ) {
        event.preventDefault()
        ReactEditor.insertData(editor, event.clipboardData)
      }
    }
  },
  [readOnly, editor, attributes.onPaste]
)}
*/

//*****************************************************************************
//
// Marks
//
//*****************************************************************************

function isMarkActive(editor, format) {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

function setMark(editor, format, active) {
  if (active) {
    Editor.addMark(editor, format, true)
  } else {
    Editor.removeMark(editor, format)
  }
}

function toggleMark(editor, format) {
  setMark(editor, format, !isMarkActive(editor, format))
}

//*****************************************************************************
//
// Tool buttons
//
//*****************************************************************************

//-----------------------------------------------------------------------------

class CharStyleButtons extends React.PureComponent {

  static buttons = {
    "bold": {
      tooltip: "Bold (Ctrl-B)",
      icon: <Icon.Style.Bold />
    },
    "italic": {
      tooltip: "Italic (Ctrl-I)",
      icon: <Icon.Style.Italic />,
    },
  }

  static choices = ["bold", "italic"]

  render() {
    const {bold, italic, setSelected} = this.props

    const active = [
      bold ? "bold" : "",
      italic ? "italic" : ""
    ].filter(s => s)
    //const active = Object.entries(marks).filter(([k, v]) => v).map(([k, v]) => k)

    return <MakeToggleGroup
      buttons={this.constructor.buttons}
      choices={this.constructor.choices}
      selected={active}
      setSelected={setSelected}
      exclusive={false}
    />
  }
}

//-----------------------------------------------------------------------------

class ParagraphStyleSelect extends React.PureComponent {

  static order = ["p", "hact", "hchapter", "hscene", "hsynopsis", "hnotes", "bookmark", "comment", "missing", "fill", "tags"]

  render() {
    const {type, setSelected} = this.props;
    //const type = node?.type ?? undefined

    //console.log("Block type:", type)

    const choices = paragraphTypes
    const order   = this.constructor.order
    const name = type in choices ? choices[type].name : "Text"

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button tooltip="Paragraph style" style={{width: 100, justifyContent: "flex-start"}} {...bindTrigger(popupState)}>{name}</Button>
        <Menu {...bindMenu(popupState)}>
          {order.map(k => [k, choices[k]]).map(([k, v]) => (
            <MenuItem key={k} value={k} onClick={e => {setSelected(k); popupState.close(e)}}>
              <ListItemIcon>{v.markup}</ListItemIcon>
              <ListItemText sx={{width: 100}}>{v.name}</ListItemText>
              <Typography sx={{ color: 'text.secondary' }}>{v.shortcut}</Typography>
              </MenuItem>
            )
          )}
        </Menu>
      </React.Fragment>
      }
    </PopupState>
  }
}

//-----------------------------------------------------------------------------

export class FoldButtons extends React.PureComponent {
  render() {
    const {editor, folded} = this.props

    function onFoldToggle(e) { toggleFold(editor); ReactEditor.focus(editor); }
    function onFoldAll(e) { foldAll(editor, true); ReactEditor.focus(editor);}
    function onUnfoldAll(e) { foldAll(editor, false); ReactEditor.focus(editor); }

    return <>
      <IconButton selected={folded} tooltip="Toggle fold (Alt-F)" onClick={onFoldToggle}><Icon.Style.Folded/></IconButton>
      <IconButton tooltip="Fold all (Alt-A)" onClick={onFoldAll}><Icon.Style.FoldAll/></IconButton>
      <IconButton tooltip="Unfold all (Alt-S)" onClick={onUnfoldAll}><Icon.Style.UnfoldAll/></IconButton>
      </>
  }
}

//-----------------------------------------------------------------------------

export function EditButtons({editor, track}) {
  //console.log("Track:", track)

  const type = track?.node?.type
  const bold = track?.marks?.bold
  const italic = track?.marks?.italic

  const applyStyle = useCallback(type => {
    Transforms.setNodes(editor, {type})
    ReactEditor.focus(editor)
  }, [editor])

  const applyMarks = useCallback(marks => {
    const current = Object.keys(Editor.marks(editor))
    for(const key of current) {
      if(!marks.includes(key)) setMark(editor, key, false)
    }
    for(const key of marks) {
      if(!current.includes(key)) setMark(editor, key, true)
    }
    ReactEditor.focus(editor)
  }, [editor])

  return <>
    <ParagraphStyleSelect type={type} setSelected={applyStyle}/>
    <Separator/>
    <CharStyleButtons bold={bold} italic={italic} setSelected={applyMarks}/>
  </>
}

//*****************************************************************************
//
// Custom hotkeys
//
//*****************************************************************************

function onKeyDown(editor, event) {

  //---------------------------------------------------------------------------
  // Node & character styles
  //---------------------------------------------------------------------------

  for(const {shortcut, node} of nodeShortcuts) {
    if(shortcut(event)) {
      event.preventDefault();
      Transforms.setNodes(editor, node)
      return
    }
  }

  for(const {shortcut, mark} of markShortcuts) {
    if(shortcut(event)) {
      event.preventDefault();
      toggleMark(editor, mark)
      return
    }
  }

  //---------------------------------------------------------------------------
  // Folding
  //---------------------------------------------------------------------------

  if (IsKey.AltF(event)) {
    event.preventDefault()
    toggleFold(editor)
    return
  }
  if (IsKey.AltA(event)) {
    event.preventDefault()
    foldAll(editor, true)
    return
  }
  if (IsKey.AltS(event)) {
    event.preventDefault()
    foldAll(editor, false)
    return
  }

  //---------------------------------------------------------------------------
  // Moving
  //---------------------------------------------------------------------------

  if(IsKey.AltUp(event)) {
    event.preventDefault()

    const current = Editor.above(editor, {
      match: n => Element.isElement(n) && n.type === "scene"
    })
    if(!current) return

    const match = Editor.previous(editor, {
      at: current[1],
      match: n => Element.isElement(n) && n.type === "scene"
    })
    if(match) {
      const [,path] = match
      Transforms.select(editor, path)
      Transforms.collapse(editor)
    }
    return
  }

  if(IsKey.AltDown(event)) {
    event.preventDefault()

    const current = Editor.above(editor, {
      match: n => Element.isElement(n) && n.type === "scene"
    })
    if(!current) return

    const match = Editor.next(editor, {
      at: current[1],
      match: n => Element.isElement(n) && n.type === "scene"
    })
    if(match) {
      const [,path] = match
      Transforms.select(editor, path)
      Transforms.collapse(editor)
    }
    return
  }

  //---------------------------------------------------------------------------
  // Misc
  //---------------------------------------------------------------------------

  if(IsKey.AltL(event)) {
    event.preventDefault()
    Transforms.insertText(editor,
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sagittis " +
      "faucibus odio, sed fringilla lacus tempor eu. Curabitur lacinia ante quis " +
      "urna placerat, vitae ullamcorper dolor accumsan. Nam ex velit, dictum eget " +
      "porttitor vitae, aliquet at tortor. Vivamus dictum mauris ut dolor mattis, " +
      "ut pulvinar ligula scelerisque. Vivamus luctus neque nec urna sodales " +
      "fringilla. Ut gravida nibh risus, ac tempus mauris scelerisque nec. Vivamus " +
      "semper erat eget placerat imperdiet. Fusce non lorem eu diam vulputate porta " +
      "non eu nibh. Mauris egestas est tellus, id placerat libero tempus et. " +
      "Integer eget ultrices ante. Vestibulum est arcu, elementum a ornare convallis, " +
      "fringilla."
    )
    Transforms.insertNodes(editor, {type: "p", children: [{text: ""}]})
    return
  }
}

//*****************************************************************************
//
// Editor customizations
//
//*****************************************************************************

export function getEditor() {

  return [
    createEditor,
    // Base editor
    withHistory,
    withWordCount,        // Autogenerate word counts
    withBR,           // empty <p> -> <br>
    withFixNesting,       // Keep correct nesting: chapter -> scene -> paragraph
    withMarkup,           // Markups (##, **, //, etc)

    withReact,

    // ReactEditor overrides
    withTextPaste,        // Improved text paste

    withProtectFolds,     // Hooks changes. Prevents messing with folded blocks
  ].reduce((editor, func) => func(editor), undefined)
}

//-----------------------------------------------------------------------------
// Pasting text to editor
//-----------------------------------------------------------------------------

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
    doFold(editor, node, path, false)
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

  /*
  const {isVoid} = editor
  editor.isVoid = elem => {
    if(elem.type === "fold") return true
    return isVoid(elem)
  }
  */

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

      if(path.length < nodeType.level) {
        Transforms.wrapNodes(editor, {type: nodeType.parent}, {at: path})
        return;
      }

      if(!mergeHeadlessChilds(node, path)) return;
      updateBlockAttributes(node, path)
      return normalizeNode(entry)
    }

    if(!checkParent(node, path, nodeType.parent)) return

    // Block headers
    if(nodeIsBreak(node)) {
      if(!checkIsFirst(node, path, nodeType.parent)) return
      updateHeadAttributes(node, path)
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

    //console.log("FixNesting: Wrapping", path, node, type)
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
        doFold(editor, prev[0], prev[1], false)
        doFold(editor, block, path, false)
        Transforms.mergeNodes(editor, {at: path})

        return false
      }
    }

    // Otherwise the block is fine as it is
    return true
  }
}
