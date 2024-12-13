// ****************************************************************************
//
// HTML formatting table
//
// ****************************************************************************

import {getHeader} from "../../document/head"

// ****************************************************************************

export const formatHTML = {
  // Info
  suffix: ".html",

  //---------------------------------------------------------------------------
  // Head & footer
  //---------------------------------------------------------------------------

  head: (head, options) => {
    const {author, title, subtitle} = head
    const headinfo = getHeader(head)
    return `\
<div style="margin-bottom: 1cm">${headinfo}</div>\n
<center>${escape(author ?? "")}</center>
<div style="margin-bottom: 0.5in">
  <h1>${escape(title ?? "<New Story>")}</h1>
  ${subtitle ? "<h2>" + escape(subtitle) + "</h2>" : ""}
</div>
`
  },

  footer: () => {
    return ""
  },

  //---------------------------------------------------------------------------
  // Headings
  //---------------------------------------------------------------------------

  hact: (p, options) => {
    const {title, number} = p
    const pgbreak = options.pgbreak ? "<hr/>\n" : ""
    const numbering = number ? [`${number}`] : []
    const text = title ? [title] : []
    const head = [ ...numbering, ...text].join(". ")

    return `${pgbreak}<h1>${escape(head)}</h1>`
  },

  hchapter: (p, options) => {
    const {title, number} = p
    const pgbreak = options.pgbreak ? "<hr/>\n" : ""
    const numbering = number ? [`${number}`] : []
    const text = title ? [title] : []
    const head = [ ...numbering, ...text].join(". ")

    return `${pgbreak}<h2>${head}</h2>`
  },

  hscene: (p, options) => {
    const {title, number} = p
    const pgbreak = options.pgbreak ? "<hr/>\n" : ""
    const numbering = number ? [`${number}`] : []
    const text = title ? [title] : []
    const head = [ ...numbering, ...text].join(". ")

    return `${pgbreak}<h3>${head}</h3>`
  },

  //---------------------------------------------------------------------------
  // Breaks
  //---------------------------------------------------------------------------

  separator: () => `<br/><center>${escape("* * *")}</center><br/>\n`,
  br: () => "<br/>",

  //---------------------------------------------------------------------------
  // Paragraphs
  //---------------------------------------------------------------------------

  // "bookmark": (p) => null,
  // "comment": (p) => null,
  "missing": (p, text) => `<p style="color: rgb(180, 20, 20);">${text}</p>`,
  "p": (p, text) => `<p>${text}</p>`,

  //---------------------------------------------------------------------------
  // Text styles
  //---------------------------------------------------------------------------

  "b": (text) => `<strong>${text}</strong>`,
  "i": (text) => `<em>${text}</em>`,
  "text": (text) => escape(text),

  //---------------------------------------------------------------------------
}

// ****************************************************************************

function escape(text) {
  return (text && text
    .replaceAll('&', "&amp;")
    .replaceAll('<', "&lt;")
    .replaceAll('>', "&gt;")
  )
}
