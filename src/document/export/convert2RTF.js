//*****************************************************************************
//
// RTF formatting table
//
//*****************************************************************************

import { getHeader } from "../head";
import { getLangRTF } from "../lang";

export function getRTFConverter(options = {}) {
  return {suffix: ".rtf", ...file(options), ...formatter};
}

// TODO: \sbkodd (and sections) for double paged exports

//*****************************************************************************
//
// RTF formatter
//
//*****************************************************************************

const formatter = {

  //---------------------------------------------------------------------------
  // Header styles
  //---------------------------------------------------------------------------

  act(node) { return makeHeader(node); },
  chapter(node) { return makeHeader(node); },
  scene(node) { return makeHeader(node); },
  br(node) { return makeHeader(node); },

  //---------------------------------------------------------------------------
  // Paragraph styles
  //---------------------------------------------------------------------------

  p({first, text}) { return `{${first ? "" : "\\fi567 "}${text}\\par}`; },
  missing({first, text}) { return `{${first ? "" : "\\fi567"}\\cf2 ${text}\\par}`; },
  quote({first, text}) { return `{\\li1134\\ri1134 ${text}\\par}`},

  bookmark() { return; },
  comment() { return; },
  tags() { return; },

  //---------------------------------------------------------------------------
  // Character styles
  //---------------------------------------------------------------------------

  text({text, bold, italic}) {
    text = escape(text)
    if(bold) text = this.bold(text)
    if(italic) text = this.italic(text)
    return text
  },
  bold(text) { return `{\\b ${text}}`; },
  italic(text) { return `{\\i ${text}}`; },
}

//-----------------------------------------------------------------------------

function makeHeader({type, header = "none", prefix, first, number, pgbr, text}) {
  let tag

  switch(type) {
    case "act": {
      tag = (pgbr ? "\\pagebb\\sb1000" : "\\sb480") + "\\sa480\\qc\\b\\fs32";
      break
    }
    case "chapter": {
      tag = (pgbr ? "\\pagebb" : "\\sb480") + "\\sa480\\b\\fs28"
      break;
    }
    case "scene": {
      tag = "\\sb480\\b"
      break;
    }
  }

  switch(header) {
    case "none": return;
    case "break": return first ? undefined : '{\\fi567\\par}'
    case "separated": return first ? undefined : `{\\sb480\\sa480\\qc ${escape("* * *")}\\par}`;
    default: break;
  }

  if(number) {
    const numbering = `${prefix ? (escape(prefix) + " ") : ""}${number}`

    switch(header) {
      case "numbered": return `{${tag} ${numbering}\\par}`
      case "numbered&named": return `{${tag} ${numbering}. ${text}\\par}`
      default: break;
    }
  }
  return `{${tag} ${text}\\par}`;
}

//-----------------------------------------------------------------------------

function escape(text) {
  if(!text) return text

  return text.split("").map(charEscape).join("")

  function charEscape(c) {
    const code = c.charCodeAt(0)
    // RTF uses signed UTF-16 code units, including surrogate pairs.
    // The '?' fallback assumes \uc1 (also the RTF default).
    if(code > 127) return `\\u${code > 32767 ? code - 65536 : code}?`
    switch(c) {
      case '\\': return "\\\\"
      case '{': return "\\{"
      case '}': return "\\}"
      //case '~': return "\\~"
    }
    return c
  }
}

//*****************************************************************************
//
// RTF file header w/ paper size
//
//*****************************************************************************

function file(options = {}) {
  const {sides = "single"} = options
  return {
    header(head) {
      const dimensions = getDimensions(options)
      return [
        "{\\rtf1\\ansi\\uc1",
        rtfLang(head),
        docInfo(head),
        fontTable(),
        colorTable(),
        paper(dimensions, options),
        pageHeader(dimensions, sides, head),
        "\\f0\\sl440",
        docTitle(head),
      ].join("\n");
    },
    footer() { return "}"; },
  }
}

//-----------------------------------------------------------------------------

function rtfLang({lang}) {
  const langcode = getLangRTF(lang) ?? 255
  // Unknown language:
  // "\\lang255" (works w/ LibreOffice)
  // "\\lang1024" // Does not work in LibreOffice
  // "\\noproof"; // Does not work in LibreOffice
  // "\\lang1024\\noproof"; // Does not work in LibreOffice
  return `\\lang${langcode}`
}

//-----------------------------------------------------------------------------

function docInfo(head) {
  const {author, title} = head

  return [
    "{\\info",
    `{\\title ${escape(title)}}`,
    author ? `{\\author ${escape(author)}}` : "",
    "}"
  ].join("\n")
}

function docTitle(head) {
  const {author, title, subtitle} = head

  return [
    author ? `{\\sa220\\qc ${escape(author)}\\par}` : "",
    `{\\sa440\\qc\\b\\fs34 ${escape(title)}\\par}`,
    subtitle ? `{\\sa440\\qc\\b\\fs28 ${escape(subtitle)}\\par}` : "",
  ].join("\n")
}

function pageHeader(dimensions, sides, head) {
  const headinfo = getHeader(head)
  const pgnum = "{\\field{\\*\\fldinst PAGE}}"
  const pgtot = "{\\field{\\*\\fldinst NUMPAGES}}"
  const lang = rtfLang(head)

  const header = `${escape(headinfo)}\\tab ${pgnum} / ${pgtot}`
  //const tabs = "\\f0\\tqr\\tx8496"
  const tabs = `\\f0\\tqr\\tx${dimensions.text.width}`

  switch(sides) {
    case "single": return `{\\header${lang}${tabs} ${header}\\par}`;
    case "double": return [
    `{\\headerl${lang}${tabs} ${header}\\par}`,
    `{\\headerr${lang}${tabs} ${header}\\par}`,
    ].join("\n")
  }
}

//-----------------------------------------------------------------------------

function fontTable() {
  return [
    "{\\fonttbl",
    "    \\f0\\froman\\fcharset0 Times New Roman;",
    //"    \\f0\\froman\\fcharset0 Arial;",
    "}",
  ].join("\n")
}

function colorTable() {
  return [
    "{\\colortbl;",
    "    \\red0\\green0\\blue0;",
    "    \\red180\\green20\\blue20;",
    "}",
  ].join("\n")
}

//-----------------------------------------------------------------------------
// Paper size & margins
//-----------------------------------------------------------------------------

function getDimensions({size = "A4"} = {}) {
  const inch = 1440

  switch(size) {
    default:
    case "A4": return {
      paper:  {width: 8.27*inch, height: 11.69*inch},
      text:   {width: 6*inch},
      margin: {top: inch, bottom: inch},
      gutter: inch/2,
    }
    case "Letter": return {
      paper: {width: 8.5*inch, height: 11*inch},
      text: {width: 6*inch},
      margin: {top: inch, bottom: inch},
      gutter: inch/2,
    }
    case "A5": return {
      paper: {width: 5.8*inch, height: 8.27*inch},
      text: {width: 6406},
      margin: {top: inch/2, bottom: inch/2},
      gutter: inch/4,
    }
  }
}

function paper(dimensions, {sides = "single"} = {}) {

  let {paper, text, margin, gutter} = dimensions

  switch(sides) {
    case "double": {
      margin.left = (paper.width-text.width)/2 + gutter
      margin.right = (paper.width-text.width)/2 - gutter
      break;
    }
    case "single":
    default: {
      margin.left = (paper.width - text.width) / 2;
      margin.right = (paper.width - text.width) / 2;
      break;
    }
  }

  return [
    `\\paperw${Math.round(paper.width)}\\paperh${Math.round(paper.height)}`,
    `\\margt${Math.round(margin.top)}\\margb${Math.round(margin.bottom)}`,
    `\\margl${Math.round(margin.left)}\\margr${Math.round(margin.right)}`,
    sides == "double" ? "\\facingp\\margmirror" : "",
    "\\gutter0",
  ].join("\n")
}
