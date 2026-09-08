//*****************************************************************************
//
// Styles
//
//*****************************************************************************

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
  "hscene":    {parent: "scene",   breaks: true, ctrl: {content: undefined}},
  "hsynopsis": {parent: "scene",   breaks: true, ctrl: {content: "synopsis"}},
  "hnotes":    {parent: "scene",   breaks: true, ctrl: {content: "notes"}},

  //---------------------------------------------------------------------------
  // Paragraphs
  //---------------------------------------------------------------------------

  "bookmark":  {parent: "scene", },
  "comment":   {parent: "scene", },
  "missing":   {parent: "scene", },
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
// Control nodes create slate-editable node to edit values in containers.
//-----------------------------------------------------------------------------

export function nodeIsCtrl(node) {
  return nodeIsBreak(node)
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
  "hact":      {name: "Act",      markup: "**", shortcut: "Ctrl+Alt+1", eol: "p", bk: "p",},
  "hchapter":  {name: "Chapter",  markup: "#",  shortcut: "Ctrl+Alt+2", eol: "p", bk: "p",},
  "hscene":    {name: "Scene",    markup: "##", shortcut: "Ctrl+Alt+3", eol: "p", bk: "p",},
  "hsynopsis": {name: "Synopsis", markup: ">>", shortcut: "Ctrl+Alt+S", eol: "p", bk: "p",},
  "hnotes":    {name: "Notes",    markup: "%%", shortcut: "Ctrl+Alt+N", eol: "p", bk: "p",},

  "comment":   {name: "Comment",  markup: "//", shortcut: "Ctrl+Alt+C",           bk: "p", reset: "p" },
  "missing":   {name: "Missing",  markup: "!!", shortcut: "Ctrl+Alt+M",           bk: "p", reset: "p" },
  "bookmark":  {name: "Bookmark", markup: "=>", shortcut: "Ctrl+Alt+B", eol: "p", bk: "p", reset: "p" },
  "tags":      {name: "Tags",     markup: "@@",                         eol: "p", bk: "p", reset: "p" },
  "quote":     {name: "Quote",                  shortcut: "Ctrl+Alt+Q",           bk: "p", reset: "p" },
  "p":         {name: "Text",                   shortcut: "Ctrl+Alt+0"},

  // Unused markups
  //'++ ':
  //'-- ':
  //'<<':
  //'((':
  //'))':
  //'==':
  //'??':
  //'::':
}

export const textTypes = {
  "bold":   {name: "Bold",   shortcut: "Ctrl+B"},
  "italic": {name: "Italic", shortcut: "Ctrl+I"},
}
