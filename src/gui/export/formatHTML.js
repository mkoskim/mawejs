// ****************************************************************************
//
// HTML formatting table
//
// ****************************************************************************

import {elemAsText, elemName} from "../../document"
import {getHeader} from "../../document/head"

// ****************************************************************************

export const formatHTML = {
  // Info
  "suffix": ".html",

  // File
  "file": (head, content, options) => {
    const {author, title, subtitle} = head
    const headinfo = getHeader(head)
    return `\
<div style="margin-bottom: 1cm">${headinfo}</div>\n
<center>${escape(author ?? "")}</center>
<div style="margin-bottom: 0.5in">
  <h1>${escape(title ?? "<New Story>")}</h1>
  ${subtitle ? "<h2>" + escape(subtitle) + "</h2>" : ""}
</div>
${content}
`
  },

  //---------------------------------------------------------------------------
  // Body

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

  "split": (paragraphs) => paragraphs.join("\n"),

  //---------------------------------------------------------------------------
  // Paragraph splits

  // "synopsis": (p) => null,
  // "comment": (p) => null,
  "missing": (p, text) => `<p id="${p.id}" style="color: rgb(180, 20, 20);">${text}</p>`,
  "p": (p, text) => `<p id="${p.id}">${text}</p>`,

  "b": (text) => `<strong>${text}</strong>`,
  "i": (text) => `<em>${text}</em>`,
  "text": (text) => escape(text),

  //---------------------------------------------------------------------------
}

// ****************************************************************************

function getHeading(elem, type, pgbreak, chnum) {
  const brk = pgbreak ? "<hr/>" : ""
  switch(type) {
    case "numbered": return `${brk}<h3 id="${elem.id}">${chnum}.</h3>`
    case "named": return `${brk}<h3 id="${elem.id}">${chnum}. ${elemName(elem)}</h3>`
    default: break;
  }
  return `<a id="${elem.id}"/>`
}

function getSeparator(separator, pgbreak) {
  if(separator) {
    //if(pgbreak) return "<hr/>"
    return `<br/><center>${separator}</center><br/>\n`
  }
  return"<br/>\n"
}

function escape(text) {
  return (text && text
    .replaceAll('&', "&amp;")
    .replaceAll('<', "&lt;")
    .replaceAll('>', "&gt;")
    .replaceAll('"', "&quot;")

    // If you have copy-pasted text, you may have these
    .replaceAll('“', "&quot;")
    .replaceAll('”', "&quot;")
    .replaceAll('…', "...")
  )
}
