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
  "file": (settings, head, content) => {
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
{\\title ${formatRTF.escape(head.title)}}
{\\author ${formatRTF.escape(head.author)}}
}
\\deflang${langcode}
${singleA4}
\\sectd\\margtsxn1701
\\sbknone\\ltrsect\\stextflow0
{\\lang${langcode}\\sl-440
{\\header\\tqr\\tx8496 ${formatRTF.escape(headinfo)}\\tab ${pgnum} / ${pgtot}\\par}
${content}
}}\n`
  },

  //\\headery851\\f0\\fs24\\fi0\\li0\\ri0\\rin0\\lin0

  //---------------------------------------------------------------------------
  // Body
  "body": (settings, head, parts) => {
    const {separator} = settings.part
    //const sep = separator ? `{\\sb480\\qc\\fs34 ${separator}\\par}\n` : "\n"
    const sep = separator ? `{\\sb480\\qc ${separator}\\par}\n` : "\n"
    return head + parts.join(sep)
  },

  "title": (settings, title) => `{\\qc\\sa480\\b\\fs34 ${formatRTF.escape(title)}\\par}\n`,

  //---------------------------------------------------------------------------

  // Part
  "part": (settings, part, scenes) => {
    const {separator} = settings.scene
    //const sep = separator ? `{\\sb480\\qc\\fs34 ${separator}\\par}\n` : "\n"
    const sep = separator ? `{\\sb480\\qc ${separator}\\par}\n` : "\n"

    return scenes.filter(s => s.length).join(sep)
  },

  // Scene & breaks
  "scene": (settings, scene, splits) => splits.join(""),
  "split": (settings, split) => "{\\sb480" + split.join("{\\fi567"),

  // Paragraph styles
  "missing": (settings, p) => `\\cf2 ${formatRTF.escape(elemAsText(p))}\\par}\n`,
  "p": (settings, p) => ` ${formatRTF.escape(elemAsText(p))}\\par}\n`,
  "synopsis": (settings, p) => undefined,
  "comment": (settings, p) => undefined,

  //---------------------------------------------------------------------------

  escape: text => {
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
  },
}
