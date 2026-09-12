//*****************************************************************************
// Basic HTML converter for export development and previews.
//*****************************************************************************

import { getHeader } from "../head";
import { mawe } from "..";
import {textEscape} from "./util.js";

export function getHTMLConverter({format = "html"} = {}) {
  switch(format) {
    case "preview": return formatter;
  }
  return {...file, ...formatter};
}

//-----------------------------------------------------------------------------

const file = {
  suffix: ".html",
  header(head) {
    const {title, subtitle, author} = mawe.info(head)
    const titleElem = title ? `<h1>${escape(title)}</h1>\n`: ""
    const subtitleElem = subtitle ? `<h2>${escape(subtitle)}</h2>\n`: ""
    const authorElem = author ? `<p class="author">${escape(author)}</p>\n`: ""
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<style>
  body {
    max-width: 6in; margin: 1in auto; line-height: 1.6;
    font-family: Times New Roman, serif;
  }
  h1, h2, p.author {text-align: center}
  p, br {margin: 0; p + & { text-indent: 1.0cm; }}
  .missing { color: #a33; }
  blockquote { margin: 0 2cm; }
  .separator { text-align: center; margin: 1em 0; }
  @media print { .page-break { break-before: page; } }
</style>
</head>
<body>
${authorElem}${titleElem}${subtitleElem}
`;
  },
  footer() { return "</body>\n</html>"; },
};

//-----------------------------------------------------------------------------

const preview = {
  header(head) {
    const headinfo = getHeader(head) // Add this to page top :)
  },
  footer() {}
}

/* Old code for preview title block:

function formatFile(head, content, options) {
  const {author, title, subtitle} = head
  const headinfo = getHeader(head)
  return `\
<div style="margin-bottom: 1cm">${escape(headinfo)}</div>\n
<center>${escape(author ?? "")}</center>
<div style="margin-bottom: 0.5in">
<h1>${escape(title ?? "<New Story>")}</h1>
${subtitle ? "<h2>" + escape(subtitle) + "</h2>" : ""}
</div>
${content}
`
}
*/

// Also, remember, that preview uses <hr/> as page break indicator
//   const pgbreak = p.pgbreak ? "<hr/>\n" : ""

//-----------------------------------------------------------------------------

const formatter = {
  //---------------------------------------------------------------------------
  // Format headers
  //---------------------------------------------------------------------------

  act(node) { return makeHeader(node); },
  chapter(node) { return makeHeader(node); },
  scene(node) { return makeHeader(node); },
  br(node) { return makeHeader(node); },

  //---------------------------------------------------------------------------
  // Format paragraphs
  //---------------------------------------------------------------------------

  p({first, text}) {return `<p>${text}</p>`; },
  missing({first, text}) { return `<p class="missing">${text}</p>`; },
  quote({text}) { return `<blockquote>${text}</blockquote>`; },

  bookmark() { return; },
  comment() { return; },
  tags() { return; },

  //---------------------------------------------------------------------------
  // Format text
  //---------------------------------------------------------------------------

  text({text, bold, italic}) {
    text = escape(text)
    if(bold) text = this.bold(text)
    if(italic) text = this.italic(text)
    return text
  },
  bold(text) { return `<b>${text}</b>`; },
  italic(text) { return `<i>${text}</i>`; },
};

//-----------------------------------------------------------------------------

function makeHeader({type, header = "none", prefix, first, number, pgbr, text}) {
  let tag

  switch(type) {
    case "act": tag = "h2"; break;
    case "chapter": tag = "h3"; break;
    case "scene": tag = "h4"; break;
  }

  switch(header) {
    case "none": return;
    case "break": return first ? undefined : '<br/>'
    case "separated": return first ? undefined : '<div class="separator">* * *</div>';
    default: break;
  }

  if(number) {
    const numbering = `${prefix ? (escape(prefix) + " ") : ""}${number}`

    switch(header) {
      case "numbered": return `<${tag}>${numbering}</${tag}>`
      case "numbered&named": return `<${tag}>${numbering}. ${text}</${tag}>`
      default: break;
    }
  }
  return `<${tag}>${text}</${tag}>`;
}

//-----------------------------------------------------------------------------

const escapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

function escape(text) {
  return text && textEscape(text, escapes)
}
