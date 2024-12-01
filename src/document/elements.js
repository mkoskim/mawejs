//*****************************************************************************
//
// Styles
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Planning: containers, container breaks/headers, paragraphs, marks
//-----------------------------------------------------------------------------

export const nodeTypes = {
  //---------------------------------------------------------------------------
  // Containers
  //---------------------------------------------------------------------------

  "act":       {parent: undefined, level: 1, header: "hact", },
  "chapter":   {parent: "act",     level: 2, header: "hchapter", },
  "scene":     {parent: "chapter", level: 3, header: "hscene"},

  //---------------------------------------------------------------------------
  // Container breaks
  //---------------------------------------------------------------------------

  "hact":      {parent: "act", breaks: true, },
  "hchapter":  {parent: "chapter", breaks: true, },
  "hscene":    {parent: "scene", breaks: true, ctrl: {synopsis: undefined}},
  "hsynopsis": {parent: "scene", breaks: true, ctrl: {synopsis: true}},

  //---------------------------------------------------------------------------
  // Paragraphs
  //---------------------------------------------------------------------------

  "bookmark":  {parent: "scene", },
  "comment":   {parent: "scene", },
  "missing":   {parent: "scene", },
  "fill":      {parent: "scene", },
  "tags":      {parent: "scene", },
  "p":         {parent: "scene", },
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

export function nodeBreaks(node) {
  if(!node || !(node.type in nodeTypes)) return

  const {breaks, parent} = nodeTypes[node.type]
  return breaks ? parent : undefined
}

//-----------------------------------------------------------------------------
// Paragraph types
//-----------------------------------------------------------------------------

export const paragraphTypes = {
  "p":         {name: "Text",     markup: "",   shortcut: "Ctrl-Alt-0"},
  "hact":      {name: "Act",      markup: "**", shortcut: "Ctrl-Alt-1"},
  "hchapter":  {name: "Chapter",  markup: "#",  shortcut: "Ctrl-Alt-2"},
  "hscene":    {name: "Scene",    markup: "##", shortcut: "Ctrl-Alt-3"},
  "hsynopsis": {name: "Synopsis", markup: ">>", shortcut: "Ctrl-Alt-S"},
  "comment":   {name: "Comment",  markup: "//", shortcut: "Ctrl-Alt-C"},
  "missing":   {name: "Missing",  markup: "!!", shortcut: "Ctrl-Alt-M"},
  "fill":      {name: "Filler",   markup: "++", shortcut: "Ctrl-Alt-F"},
  "tags":      {name: "Tags",     markup: "@",  shortcut: ""},
  "bookmark":  {name: "Bookmark" },
}

//-----------------------------------------------------------------------------
// Markup shortcuts
//
// Style table:
//
//    next    Next style (empty: keep style)
//    reset   Pressing ENTER on empty line resets the style to paragraph
//    bk      BACKSPACE at the start of line resets the style to paragraph
//
//-----------------------------------------------------------------------------

export const blockstyles = {

  "hact":      { eol: "p", bk: "p", },
  "hchapter":  { eol: "p", bk: "p", },
  "hscene":    { eol: "p", bk: "p", },
  "hsynopsis": { eol: "p", bk: "hscene", },

  'comment':   {           bk: "p", reset: "p" },
  'missing':   {           bk: "p", reset: "p" },
  'fill':      { eol: "p", bk: "p", reset: "p" },
  'tags':      { eol: "p", bk: "p", reset: "p" },
  'bookmark':  { eol: "p", bk: "p", reset: "p" },
}

// TODO: Generate this table

export const MARKUP = {
  "** ": {type: "hact", numbered: undefined},
  "# " : {type: "hchapter", numbered: true},
  "#! ": {type: "hchapter", numbered: undefined},
  "## ": {type: "hscene"},
  '>> ': {type: "hsynopsis"},
  '// ': {type: 'comment'},
  '!! ': {type: 'missing'},
  '++ ': {type: 'fill'},
  '@ ' : {type: 'tags'},
  //'-- ':
  //'<<':
  //'((':
  //'))':
  //'==':
  //'??':
  //'%%':
  //'/*':
  //'::':
}
