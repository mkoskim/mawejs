//*****************************************************************************
//*****************************************************************************
//
// Helper functions for SlateJS
//
//*****************************************************************************
//*****************************************************************************

import {
  Editor,
  Node, Text,
  Transforms,
  Range, Point, Path,
  Element,
} from 'slate'
import { ReactEditor } from 'slate-react'

import { nanoid } from 'nanoid';
import { appBeep } from '../../system/host';
import {elemHeading, elemTags} from '../../document/util';

//-----------------------------------------------------------------------------
// Search pattern
//-----------------------------------------------------------------------------

export function searchOffsets(text, re) {
  return Array.from(text.matchAll(re)).map(match => match["index"])
}

export function text2Regexp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

export function searchPattern(text, opts = "gi") {
  if(!text) return undefined
  return new RegExp(text2Regexp(text), opts)
}

//*****************************************************************************
//
// Helper functions
//
//*****************************************************************************

//-----------------------------------------------------------------------------

export function elemIsBlock(editor, elem) {
  return elem && !Editor.isEditor(elem) && Element.isElement(elem);
}

function elemIsType(editor, elem, type) {
  return elemIsBlock(editor, elem) && elem.type === type
}

//-----------------------------------------------------------------------------
// Check, if element is inside folded block

function elemIsFolded(editor, path) {
  for(const np of Node.levels(editor, path)) {
    const [node, path] = np
    //console.log("Node:", node);
    if(node.folded) return true;
  }
  return false;
}

//-----------------------------------------------------------------------------

// Return true, if editor operations change content
// Return false, if operations only change selection

export function isAstChange(editor) {
  return editor.operations.some(op => 'set_selection' !== op.type)
}

//-----------------------------------------------------------------------------

export function elemByID(editor, id, anchor, focus) {
  if(!id) return undefined

  const match = Editor.nodes(editor, {
    at: {
      anchor: anchor ?? Editor.start(editor, []),
      focus: focus ?? Editor.end(editor, [])
    },
    match: (n, p) => Editor.isBlock(editor, n) && n.id === id
  }).next()

  if(match.done) return undefined
  return match.value
}

export function hasElem(editor, id) {
  return !!elemByID(editor, id)
}

export function elemByTypes(editor, types, anchor, focus) {
  if(!anchor) anchor = Editor.start(editor, [])
  if(!focus) focus = Editor.end(editor, [])

  return Array.from(
    Editor.nodes(editor, {
      at: {anchor, focus},
      match: (node, path) => types.includes(node.type),
    })
  )
}

export function elemsByRange(editor, anchor, focus) {
  return Array.from(
    Editor.nodes(editor, {
      at: {anchor, focus},
      match: (node, path) => path.length == 1 && Editor.isBlock(editor, node),
    })
  ).map(([n, p]) => n)
}

//-----------------------------------------------------------------------------
// Drag'n'drop po and push

export function dndElemPop(editor, id) {

  const match = elemByID(editor, id)
  if(!match) return

  const [node, path] = match

  //console.log("Pop:", path, node)

  Transforms.removeNodes(editor, {at: path, hanging: true})

  const htype = (node.type === "chapter") ? "hchapter" : "hscene"

  // Has the pop'd element a header? If not, make one
  if(!node.children.length || node.children[0].type !== htype) return {
    ...node,
    children: [
      {type: htype, id: nanoid(), children: [{text: ""}]},
      ...node.children
    ]
  }
  return node
}

export function dndElemPushTo(editor, block, id, index) {
  //console.log("Push", block, id, index)

  if(!block) return

  function getContainer() {
    if(!id) return [editor, []]
    return elemByID(editor, id)
  }

  const [container, pcontainer] = getContainer()

  //console.log("Container:", container)

  //---------------------------------------------------------------------------
  // Check if container has head element. If so, add +1 to index
  //---------------------------------------------------------------------------

  function getChildIndex(container) {
    if(elemHeading(container)) return index+1
    return index
  }

  const childindex = getChildIndex(container)
  const childpath = [...pcontainer, childindex]

  //---------------------------------------------------------------------------
  // Check that elem at drop point has header (prevent merge)
  //---------------------------------------------------------------------------

  const blockTypes = {
    "act":     {header: "hact",     level: 1,                  contains: "chapter", },
    "chapter": {header: "hchapter", level: 2, wrap: "act" ,    contains: "scene"},
    "scene":   {header: "hscene",   level: 3, wrap: "chapter", },
  }

  if(container.children.length > childindex) {
    const node = container.children[childindex]
    const htype = blockTypes[node.type].header

    if(!node.children.length || node.children[0].type !== htype) {
      Transforms.insertNodes(editor,
        {
          type: htype,
          id: nanoid(),
          numbered: true,
          children: [{text: ""}]
        },
        {at: [...childpath, 0]}
      )
    }
  }

  //console.log("Index at:", [...ppath, index])
  //console.log("Insert at:", childpath)
  Transforms.insertNodes(editor, block, {at: childpath})

}

//-----------------------------------------------------------------------------
// Focusing elements

export function focusByID(editor, id) {
  const match = elemByID(editor, id)

  if(!match) {
    focusByPath(editor, undefined);
  } else {
    const [node, path] = match
    //focusByPath(editor, Editor.start(editor, path))
    focusByPath(editor, path)
  }
}

export async function focusByPath(editor, path, collapse = true) {
  //console.log("FocusByPath", path)
  if(!ReactEditor.isFocused(editor)) {
    ReactEditor.focus(editor)
    //await sleep(20);
  }
  if(path) {
    Transforms.select(editor, path);
    if(collapse) Transforms.collapse(editor);
    scrollToPoint(editor, {path, offset: 0})
  }
}

async function scrollToPoint(editor, point) {
  const [dom] = ReactEditor.toDOMPoint(editor, point)
  //*
  dom.parentElement.scrollIntoView({
    behaviour: "smooth",
    block: "center",
  })
  /*/
  dom.parentElement.scrollIntoViewIfNeeded(true)
  /**/
}

export async function scrollToRange(editor, range, focus) {
  if(focus) {
    await focusByPath(editor, range, false)
  }

  scrollToPoint(editor, range.focus)
}

//*****************************************************************************
//
// Folding
//
//*****************************************************************************

export function foldAll(editor, folded) {

  function getChapters() {
    return Editor.nodes(editor, {
      at: [],
      match: n => Element.isElement(n) && n.type === "chapter"
    })
  }

  function getFolded() {
    return Editor.nodes(editor, {
      at: [],
      match: n => Element.isElement(n) && n.folded
    })
  }

  const matches = folded ? getChapters() : getFolded()

  Editor.withoutNormalizing(editor, () => {
    for(const [node, path] of matches) {
      doFold(editor, node, path, folded)
    }
  })

  if(folded) {
    Transforms.select(editor, [0])
    Transforms.collapse(editor)
  }
}

export function toggleFold(editor) {
  const { selection } = editor

  if(!selection) return
  if(!Range.isCollapsed(selection)) return

  const { anchor } = selection
  //const [node, path] = Editor.node(editor, anchor)
  //console.log("Toggle fold", path, node)

  //const foldable = ["chapter", "scene", "synopsis", "comment", "missing"]
  const foldable = ["act", "chapter", "scene"]

  const [node, path] = Editor.above(editor, {
    at: anchor,
    match: n => Element.isElement(n) && (foldable.includes(n.type)),
  })

  const folded = !node.folded
  doFold(editor, node, path, folded)

  Transforms.select(editor, path)
  Transforms.collapse(editor)
}

//-----------------------------------------------------------------------------

export function doFold(editor, node, path, folded) {

  if((node.folded ?? false) === folded) return;

  Transforms.setNodes(editor, {folded}, {at: path})
}

//-----------------------------------------------------------------------------

export function foldByTags(editor, tags) {
  console.log("FoldByTags:", tags)

  const tagset = new Set(tags)
  var folders = []

  // Go through acts, chapters and scenes
  for(const act of Node.children(editor, [])) {
    const [node, path] = act

    var acttags = new Set()

    for(const chapter of Node.children(editor, path))
    {
      const [node, path] = chapter

      if(node.type !== "chapter") continue

      var chaptertags = new Set()

      // Go through scenes
      for(const scene of Node.children(editor, path)) {
        const [node, path] = scene
        if(node.type !== "scene") continue

        const scenetags = new Set()

        // Go through blocks and get tags
        for(const elem of Node.children(editor, path)) {
          const [node, path] = elem

          for(const key of elemTags(node)) {
            scenetags.add(key)
          }
        }

        const hastags = tagset.intersection(scenetags).size > 0
        folders.push({node, path, folded: !hastags})
        //console.log("Scene:", path, node.type, hastags, scenetags);

        chaptertags = chaptertags.union(scenetags)
      }

      const hastags = tagset.intersection(chaptertags).size > 0
      folders.push({node, path, folded: !hastags})

      acttags = acttags.union(chaptertags)

      //console.log("Chapter:", path, node.type, hastags, chaptertags);
    }

    const hastags = tagset.intersection(acttags).size > 0
    folders.push({node, path, folded: !hastags})
  }

  Editor.withoutNormalizing(editor, () => {
    for(const {node, path, folded} of folders) {
      doFold(editor, node, path, folded)
    }
  })
}

//*****************************************************************************
//
// Searching
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Search text within a node

function searchMatchNext(re, leaf, path, offset = 0) {
  const matches = searchOffsets(leaf.text, re)
    .filter(match => match >= offset)

  return matches.length
    ? {path, offset: matches[0]}
    : undefined
}

function searchMatchPrev(re, leaf, path, offset) {
  const matches = searchOffsets(leaf.text, re)
    .filter(match => match < offset)

  return matches.length
    ? {path, offset: matches[matches.length - 1]}
    : undefined
}

//-----------------------------------------------------------------------------
// Search text from another node

function searchTextForward(editor, text, path, offset) {
  const re = searchPattern(text)
  const [leaf] = Editor.leaf(editor, path)
  const match = searchMatchNext(re, leaf, path, offset)
  if(match) return match

  const next = Editor.next(editor, {
    match: (n, p) => !Path.equals(path, p) && !elemIsFolded(editor, p) && Text.isText(n) && searchOffsets(n.text, re).length
  })
  if(!next) return undefined

  //console.log(next)
  return searchMatchNext(re, next[0], next[1])
}

function searchTextBackward(editor, text, path, offset) {
  const re = searchPattern(text)

  const [leaf] = Editor.leaf(editor, path)
  const match = searchMatchPrev(re, leaf, path, offset)
  if(match) return match

  const prev = Editor.previous(editor, {
    match: (n, p) => !Path.equals(path, p) && !elemIsFolded(editor, p) && Text.isText(n) && searchOffsets(n.text, re).length
  })
  if(!prev) return undefined
  //console.log(next)
  return searchMatchPrev(re, prev[0], prev[1], prev[0].text.length)
}

//-----------------------------------------------------------------------------
// Search with scrolling and optional focusing

export function searchFirst(editor, text, doFocus=false) {
  const {path, offset} = editor.selection?.focus ?? Editor.start(editor, [])

  return searchWithScroll(editor, text, path, offset, true, doFocus)
}

export function searchForward(editor, text, doFocus=false) {
  const {path, offset} = editor.selection?.focus ?? Editor.start(editor, [])

  return searchWithScroll(editor, text, path, offset+1, true, doFocus)
}

export function searchBackward(editor, text, doFocus=false) {
  const {path, offset} = editor.selection?.focus ?? Editor.start(editor, [])

  return searchWithScroll(editor, text, path, offset, false, doFocus)
}

function searchWithScroll(editor, text, path, offset, forward=true, doFocus=false) {
  if(!text) return

  const match = (forward ? searchTextForward : searchTextBackward)(editor, text, path, offset)

  if(match) {
    const {path, offset} = match

    scrollToRange(
      editor,
      {
        focus: { path, offset },
        anchor: { path, offset: offset + text.length }
      },
      doFocus
    )
  } else {
    appBeep();
  }
}
