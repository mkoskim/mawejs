// ****************************************************************************
//
// RTF formatting table
//
// ****************************************************************************

import {elemAsText} from "../../document"

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
  "suffix": ".rtf",

  // File
  "file": (head, content, options) => {
    const pgbreak = options.pgbreak ? "\\page" : ""

    const author = head.nickname || head.author
    const title = head.title ?? ""
    const headinfo = author ? `${author}: ${title}` : title
    const langcode = 1035

    const pgnum = `{\\field{\\*\\fldinst PAGE}}`
    const pgtot = `{\\field{\\*\\fldinst NUMPAGES}}`

    return `{\\rtf1\\ansi\\deff0
${fonts}
${colors}
{\\info
{\\title ${escape(head.title)}}
{\\author ${escape(head.author)}}
}
\\deflang${langcode}
${singleA4}
\\sectd\\margtsxn1701
\\sbknone\\ltrsect\\stextflow0
{\\lang${langcode}\\sl-440

{\\header\\tqr\\tx8496 ${escape(headinfo)}\\tab ${pgnum} / ${pgtot}\\par}

{\\qc\\sa480\\b\\fs34 ${escape(head.title)}\\par}

${content}
}}\n`
  },

  //\\headery851\\f0\\fs24\\fi0\\li0\\ri0\\rin0\\lin0

  //---------------------------------------------------------------------------
  // Joining elements

  "body": (parts, options) => {
    const {separator, pgbreak} = options
    return parts.join(getSeparator(separator, pgbreak))
  },

  "part": (part, scenes, options) => {
    const {type, separator, pgbreak, chnum} = options
    return getHeading(part, type, pgbreak, chnum) + scenes.join(getSeparator(separator, pgbreak))
  },

  "scene": (scene, splits, options) => {
    const {type, separator, pgbreak, chnum} = options
    return getHeading(scene, type, pgbreak, chnum) + splits.join(getSeparator(separator, pgbreak))
  },

  "split": (paragraphs) => "{\\sb480" + paragraphs.join("{\\fi567"),

  //---------------------------------------------------------------------------

  // Paragraph styles
  "missing": (p) => `\\cf2 ${escape(elemAsText(p))}\\par}\n`,
  "p": (p) => ` ${escape(elemAsText(p))}\\par}\n`,
  "synopsis": (p) => undefined,
  "comment": (p) => undefined,

  //---------------------------------------------------------------------------
}

//-----------------------------------------------------------------------------

function getHeading(elem, type, pgbreak, chnum) {
  const brk = pgbreak ? "\\pagebb" : "\\sb480"
  switch(type) {
    case "numbered": return `{${brk}\\b\\fs28 ${chnum}.\\par}\n`
    case "named": return `{${brk}\\b\\fs28 ${chnum}. ${escape(elem.name)}\\par}\n`
    default: break;
  }
  return ""
}

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
  )
}
