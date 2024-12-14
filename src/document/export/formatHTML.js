// ****************************************************************************
//
// HTML formatting table
//
// ****************************************************************************

import {getHeader} from "../head"

// ****************************************************************************

export const formatHTML = {
  // Info
  suffix: ".html",

  //---------------------------------------------------------------------------
  // Wrapping content to file with head elements
  //---------------------------------------------------------------------------

  file: formatFile,

  //---------------------------------------------------------------------------
  // Headings
  //---------------------------------------------------------------------------

  hact: (p) => formatHeading(p, "h4"),
  hchapter: (p) => formatHeading(p, "h5"),
  hscene: (p) => formatHeading(p, "h6"),
  hsynopsis: (p) => formatHeading(p, "h6"),
  hnotes: (p) => formatHeading(p, "h6"),

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
  "missing": (p, text) => `<p class="missing">${text}</p>`,
  "p": (p, text) => `<p>${text}</p>`,

  //---------------------------------------------------------------------------
  // Text styles
  //---------------------------------------------------------------------------

  "b": (text) => `<b>${text}</b>`,
  "i": (text) => `<i>${text}</i>`,
  "text": (text) => escape(text),
}

// ****************************************************************************

function formatFile(head, content, options) {
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
}

function formatHeading(p, tag) {
  const {title, number} = p
  if(!title && !number) return

  const numbering = number ? [`${number}`] : []
  const text = title ? [title] : []
  const head = [ ...numbering, ...text].join(". ")
  const pgbreak = p.pgbreak ? "<hr/>\n" : ""

  return `${pgbreak}<${tag}>${escape(head)}</${tag}>`
}

// ****************************************************************************

function escape(text) {
  return (text && text
    .replaceAll('&', "&amp;")
    .replaceAll('<', "&lt;")
    .replaceAll('>', "&gt;")
  )
}
