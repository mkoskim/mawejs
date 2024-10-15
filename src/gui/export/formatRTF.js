// ****************************************************************************
//
// RTF formatting table
//
// ****************************************************************************

import {elemAsText, elemName} from "../../document"
import {getHeader} from "../../document/head"

//-----------------------------------------------------------------------------

const fonts = `{\\fonttbl
\\f0\\froman\\fcharset0 Times New Roman;
}`

const colors = `{\\colortbl;
\\red0\\green0\\blue0;
\\red180\\green20\\blue20;
}`

//-----------------------------------------------------------------------------

const paperwidth = 11905
const paperheight = 16837
const textwidth  = paperwidth - 2*1701
const gutter = 500

const paperA4 = `\\paperh${paperheight}\\paperw${paperwidth}
\\margt851\\margb1701`

const singleA4 = `${paperA4}
\\margl${(paperwidth-textwidth)/2}
\\margr${(paperwidth-textwidth)/2}
\\gutter0`

const doubleA4 = `\\margmirror
${paperA4}
\\margl${(paperwidth-textwidth)/2 + gutter}
\\margr${(paperwidth-textwidth)/2 - gutter}`

//-----------------------------------------------------------------------------

export const formatRTF = {
  // Info
  suffix: ".rtf",

  // File
  file: (head, content, options) => {
    const pgbreak = options.pgbreak ? "\\page" : ""

    const {author, title, subtitle} = head
    const headinfo = getHeader(head)
    const langcode = 1035

    const pgnum = `{\\field{\\*\\fldinst PAGE}}`
    const pgtot = `{\\field{\\*\\fldinst NUMPAGES}}`

    return `{\\rtf1\\ansi\\deff0
${fonts}
${colors}
{\\info
{\\title ${escape(title)}}
${author ? `{\\author ${escape(author)}}` : ""}
}
\\deflang${langcode}
${singleA4}
\\sectd\\margtsxn1701
\\sbknone\\ltrsect\\stextflow0

{\\header\\lang${langcode}\\tqr\\tx8496
${escape(headinfo)}\\tab ${pgnum} / ${pgtot}
\\par}

\\lang${langcode}
\\sl440

${author ? `{\\sa220\\qc ${escape(author)}\\par}` : ""}
{\\sa440\\qc\\b\\fs34 ${escape(title)}\\par}
${subtitle ? "{\\sa440\\qc\\b\\fs28" + escape(subtitle) + "\\par}" : ""}

${content}
}\n`
  },

  //\\headery851\\f0\\fs24\\fi0\\li0\\ri0\\rin0\\lin0

  //---------------------------------------------------------------------------
  // Joining elements

  body: (chapters, options) => {
    return chapters.join(getSeparator(options.separator))
  },

  chapter: (head, scenes, options) => {
    const {separator} = options
    return head + scenes.join(getSeparator(separator))
  },

  scene: (head, splits) => {
    return head + splits.join("\n")
  },

  split: (paragraphs) => "{\\sb480" + paragraphs.join("{\\fi567"),

  //---------------------------------------------------------------------------
  // Headings
  //---------------------------------------------------------------------------

  hact: (id, number, name, options) => {
    if(options.skip) return ""

    const pgbreak = options.pgbreak ? "\\pagebb" : ""
    const numbering = options.number ? [escape(`${options.prefix ?? ""}${number}`)] : []
    const title = options.name ? [escape(name)] : []
    const head = [ ...numbering, ...title].join(". ")

    if(!head) return ""

    return `{${pgbreak}\\sb1000\\qc\\b\\fs32 ${head}\\par}\n`
  },

  hchapter: (id, number, name, options) => {
    if(options.skip) return ""

    const pgbreak = options.pgbreak ? "\\pagebb" : "\\sb480"
    const numbering = options.number ? [escape(`${options.prefix ?? ""}${number}`)] : []
    const title = options.name ? [escape(name)] : []
    const head = [ ...numbering, ...title].join(". ")

    if(!head) return ""

    return `{${pgbreak}\\b\\fs28 ${head}\\par}\n`
  },

  hscene: undefined,

  //---------------------------------------------------------------------------

  // Paragraph styles
  "missing": (p, text) => `\\cf2 ${text}\\par}\n`,
  "p": (p, text) => ` ${text}\\par}\n`,
  //"synopsis": (p) => undefined,
  //"comment": (p) => undefined,

  "b": (text) => `{\\b ${text}}`,
  "i": (text) => `{\\i ${text}}`,
  "text": (text) => escape(text),

  //---------------------------------------------------------------------------
}

//-----------------------------------------------------------------------------

function getSeparator(separator, pgbreak) {
  if(separator) {
    //if(pgbreak) return "\\page"
    return `{\\sb480\\qc ${separator}\\par}\n`
  }
  return ""
}

function escape(text) {
  return (text && text
    .replaceAll('\\', "\\\\")
    .replaceAll('{', "\\{")
    .replaceAll('}', "\\}")

    .replaceAll('~', "\\~")
    .replaceAll('"', "\\'94")

    .replaceAll("å", "\\'e5")
    .replaceAll("Å", "\\'c5")
    .replaceAll("ä", "\\'e4")
    .replaceAll("Ä", "\\'c4")
    .replaceAll("ö", "\\'f6")
    .replaceAll("Ö", "\\'d6")

    // If you have copy-pasted text, you may have these
    .replaceAll('“', "\\'94")
    .replaceAll('”', "\\'94")
    .replaceAll('…', "...")
    .replaceAll("–", "-")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
  )
}
