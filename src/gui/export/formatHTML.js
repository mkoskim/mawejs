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

  // File
  file: (head, content, options) => {
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
  // Blocks
  //---------------------------------------------------------------------------

  body: (chapters, options) => {
    return chapters.join(getSeparator(options.separator))
  },

  chapter: (head, scenes, options) => {
    return head + scenes.join(getSeparator(options.separator))
  },

  scene: (head, splits) => {
    return head + splits.join("<br/>\n")
  },

  split: (paragraphs) => paragraphs.join("\n"),

  //---------------------------------------------------------------------------
  // Headings
  //---------------------------------------------------------------------------

  hact: (id, number, name, options) => {
    if(options.skip) return `<div id=${id}></div>`

    const pgbreak = options.pgbreak ? "<hr/>\n" : ""
    const numbering = options.number ? [escape(`${options.prefix ?? ""}${number}`)] : []
    const title = options.name ? [escape(name)] : []
    const head = [ ...numbering, ...title].join(". ")

    if(!head) return ""

    return `${pgbreak}<h1 id="${id}">${head}</h1>`
  },

  hchapter: (id, number, name, options) => {
    if(options.skip) return `<div id=${id}></div>`

    const pgbreak = options.pgbreak ? "<hr/>\n" : ""
    const numbering = options.number ? [escape(`${options.prefix ?? ""}${number}`)] : []
    const title = options.name ? [escape(name)] : []
    const head = [ ...numbering, ...title].join(". ")

    if(!head) return ""

    return `${pgbreak}<h2 id="${id}">${head}</h2>`
  },

  hscene: undefined,

  //---------------------------------------------------------------------------
  // Paragraphs
  //---------------------------------------------------------------------------

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

function getSeparator(options) {
  if(options) {
    return `<br/><center>${options}</center><br/>\n`
  }
  return "<br\n>"
}

function escape(text) {
  return (text && text
    .replaceAll('&', "&amp;")
    .replaceAll('<', "&lt;")
    .replaceAll('>', "&gt;")
  )
}
