//*****************************************************************************
//
// Styles
//
//*****************************************************************************

import {IsKey} from "../gui/common/hotkeys"

//-----------------------------------------------------------------------------
// Node types
//-----------------------------------------------------------------------------

export const nodeTypes = {
  //---------------------------------------------------------------------------
  // Containers
  //---------------------------------------------------------------------------

  "act":       {parent: undefined, level: 1, foldable: true, header: "hact", },
  "chapter":   {parent: "act",     level: 2, foldable: true, header: "hchapter", },
  "scene":     {parent: "chapter", level: 3, foldable: true, header: "hscene"},

  //---------------------------------------------------------------------------
  // Container breaks
  //---------------------------------------------------------------------------

  "hact":      {parent: "act",     breaks: true, },
  "hchapter":  {parent: "chapter", breaks: true, },
  "hscene":    {parent: "scene",   breaks: true, ctrl: {content: "scene"}},
  "hsynopsis": {parent: "scene",   breaks: true, ctrl: {content: "synopsis"}},
  "hnotes":    {parent: "scene",   breaks: true, ctrl: {content: "notes"}},

  //---------------------------------------------------------------------------
  // Paragraphs
  //---------------------------------------------------------------------------

  "bookmark":  {parent: "scene", },
  "comment":   {parent: "scene", },
  "missing":   {parent: "scene", },
  "fill":      {parent: "scene", },
  "tags":      {parent: "scene", },
  "p":         {parent: "scene", },
  "quote":     {parent: "scene", },
  "br":        {parent: "scene", },
}

//-----------------------------------------------------------------------------
// Container types
//-----------------------------------------------------------------------------

export function nodeIsContainer(node) {
  if(!node || !(node.type in nodeTypes)) return

  const {level} = nodeTypes[node.type]
  return level
}

export function nodeIsBreak(node) {
  if(!node || !(node.type in nodeTypes)) return

  const {breaks} = nodeTypes[node.type]
  return breaks
}

export function nodeIsNotBreak(node) {
  return !nodeIsBreak(node)
}

export function nodeBreaks(node) {
  if(!node || !(node.type in nodeTypes)) return

  const {breaks, parent} = nodeTypes[node.type]
  return breaks ? parent : undefined
}

//-----------------------------------------------------------------------------
// Paragraph types
//
//    eol     Pressing ENTER at end-of-line continues this style
//    bk      BACKSPACE at the start of line resets the style to paragraph
//    reset   Pressing ENTER on empty line resets the style to paragraph
//
//-----------------------------------------------------------------------------

export const paragraphTypes = {
  "hact":      {name: "Act",      markup: "**", shortcut: "Ctrl-Alt-1", eol: "p", bk: "p",},
  "hchapter":  {name: "Chapter",  markup: "#",  shortcut: "Ctrl-Alt-2", eol: "p", bk: "p",},
  "hscene":    {name: "Scene",    markup: "##", shortcut: "Ctrl-Alt-3", eol: "p", bk: "p",},
  "hsynopsis": {name: "Synopsis", markup: ">>", shortcut: "Ctrl-Alt-S", eol: "p", bk: "p",},
  "hnotes":    {name: "Notes",    markup: "%%", shortcut: "Ctrl-Alt-N", eol: "p", bk: "p",},

  "comment":   {name: "Comment",  markup: "//", shortcut: "Ctrl-Alt-C",           bk: "p", reset: "p" },
  "missing":   {name: "Missing",  markup: "!!", shortcut: "Ctrl-Alt-M",           bk: "p", reset: "p" },
  "bookmark":  {name: "Bookmark", markup: "=>", shortcut: "Ctrl-Alt-B", eol: "p", bk: "p", reset: "p" },
  "tags":      {name: "Tags",     markup: "@@",                         eol: "p", bk: "p", reset: "p" },
  "fill":      {name: "Fill",     markup: "++",                         eol: "p", bk: "p", reset: "p" },
  "quote":     {name: "Quote",                  shortcut: "Ctrl-Alt-Q",           bk: "p", reset: "p" },
  "p":         {name: "Text",                   shortcut: "Ctrl-Alt-0"},
}

//-----------------------------------------------------------------------------
// Paragraph shortcuts & markups
//-----------------------------------------------------------------------------

export const nodeShortcuts = [
  {shortcut: IsKey.CtrlAlt0, node: {type: "p"}},
  {shortcut: IsKey.CtrlAlt1, node: {type: "hact"}},
  {shortcut: IsKey.CtrlAlt2, node: {type: "hchapter"}},
  {shortcut: IsKey.CtrlAlt3, node: {type: "hscene"}},
  {shortcut: IsKey.CtrlAltS, node: {type: "hsynopsis"}},
  {shortcut: IsKey.CtrlAltN, node: {type: "hnotes"}},
  {shortcut: IsKey.CtrlAltB, node: {type: "bookmark"}},
  {shortcut: IsKey.CtrlAltC, node: {type: "comment"}},
  {shortcut: IsKey.CtrlAltM, node: {type: "missing"}},
  {shortcut: IsKey.CtrlAltQ, node: {type: "quote"}},
]

export const markShortcuts = [
  {shortcut: IsKey.CtrlB, mark: "bold"},
  {shortcut: IsKey.CtrlI, mark: "italic"},
]

export const MARKUP = {
  "** ": {type: "hact"},
  "# " : {type: "hchapter"},
  "## ": {type: "hscene"},
  '>> ': {type: "hsynopsis"},
  '%% ': {type: 'hnotes'},
  '=> ': {type: "bookmark"},
  '!! ': {type: 'missing'},
  '// ': {type: 'comment'},
  '@@ ': {type: 'tags'},
  '++ ': {type: 'fill'},
  //'-- ':
  //'<<':
  //'((':
  //'))':
  //'==':
  //'??':
  //'::':
}
