//*****************************************************************************
//*****************************************************************************
//
// Helper functions for SlateJS
//
//*****************************************************************************
//*****************************************************************************

import {
  Editor,
  Transforms,
  Element,
} from 'slate'
import { ReactEditor } from 'slate-react'
import { nodeIsVisible, topmostFoldedNode } from './slateFolding';

//*****************************************************************************
//
// Helper functions
//
//*****************************************************************************

//-----------------------------------------------------------------------------

// Return true, if editor operations change content
// Return false, if operations only change selection

export function isAstChange(editor) {
  return editor.operations.some(op => 'set_selection' !== op.type)
}

//-----------------------------------------------------------------------------

export function nodeIsBlock(editor, node) {
  return node && !Editor.isEditor(node) && Element.isElement(node);
}

function nodeIsType(editor, node, type) {
  return nodeIsBlock(editor, node) && node.type === type
}

//-----------------------------------------------------------------------------

export function nodesByTypes(editor, types, anchor, focus) {
  if(!anchor) anchor = Editor.start(editor, [])
  if(!focus) focus = Editor.end(editor, [])

  return Array.from(
    Editor.nodes(editor, {
      at: {anchor, focus},
      match: (node, path) => types.includes(node.type),
    })
  )
}

export function nodesByRange(editor, anchor, focus) {
  return Array.from(
    Editor.nodes(editor, {
      at: {anchor, focus},
      match: (node, path) => path.length == 1 && Editor.isBlock(editor, node),
    })
  ).map(([n, p]) => n)
}

//-----------------------------------------------------------------------------
// Focusing nodes

export async function focusByPath(editor, path, collapse = true) {
  //console.log("FocusByPath", path)

  if(!editor) return

  try {
    if(path) {
      Transforms.select(editor, path);
    }
    selectNearestVisible()
    if(collapse) {
      Transforms.collapse(editor);
    }

    if(!ReactEditor.isFocused(editor)) {
      ReactEditor.focus(editor)
      //await sleep(20);
    }

    const {focus} = editor.selection || {}
    if(focus) {
      //console.log("Scroll to:", focus)
      scrollToPoint(editor, focus)
    }
  } catch(e) {
    console.log("Focus: invalid path ignored.")
  }

  function selectNearestVisible() {
    const {focus} = editor.selection || {}
    if(!focus) return
    if(nodeIsVisible(editor, focus.path)) return
    const folded = topmostFoldedNode(editor, focus.path)
    if(!folded) return
    const [, path] = folded
    Transforms.select(editor, Editor.start(editor, path))
  }
}

async function scrollToPoint(editor, point) {
  const [dom] = ReactEditor.toDOMPoint(editor, point)
  //console.log("Parent:", dom.parentElement)
  /*
  dom.parentElement.scrollIntoView({
    //behaviour: "smooth",
    block: "start",
  })
  /*/
  dom.parentElement.scrollIntoViewIfNeeded()
  /**/
}

export async function scrollToRange(editor, range, focus) {
  if(focus) {
    await focusByPath(editor, range, false)
  }

  scrollToPoint(editor, range.focus)
}
