
import {
  Editor,
  Text, Path,
} from 'slate'

import {
  elemIsFolded,
} from "./slateFolding"

import {
  scrollToRange,
} from "./slateHelpers"

import { appBeep } from '../../system/host';
import {Range} from 'slate/dist';

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

function getStartPoint(editor, forward = true) {
  const start = Editor.start(editor, [])
  const range = editor.selection ?? {anchor: start, focus: start}
  return forward ? Range.end(range) : Range.start(range)
}

export function searchFirst(editor, text, doFocus=false) {
  const {path, offset} = getStartPoint(editor, false)

  return searchWithScroll(editor, text, path, offset, true, doFocus)
}

export function searchForward(editor, text, doFocus=false) {
  const {path, offset} = getStartPoint(editor, true)

  return searchWithScroll(editor, text, path, offset, true, doFocus)
}

export function searchBackward(editor, text, doFocus=false) {
  const {path, offset} = getStartPoint(editor, false)

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
        anchor: { path, offset },
        focus: { path, offset: offset + text.length }
      },
      doFocus
    )
  } else {
    appBeep();
  }
}
