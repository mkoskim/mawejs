//*****************************************************************************
// Basic HTML converter for export development and previews.
//*****************************************************************************

import {mawe} from "..";
import {getHeader} from "../head";
import {textEscape, textLinify} from "./util.js";
import {lines2text} from "../../util/";

export function getHTMLConverter({format = "html"} = {}) {
  switch(format) {
    case "preview": return {...preview, ...formatter};
    default: return {...file, ...formatter};
  }
}

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
    case "separated": return first ? undefined : `<br/><center>${escape("* * *")}</center><br/>`;
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

const file = {
  suffix: ".html",
  header(head) {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${metaTitle(head)}
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
<body${head.lang ? ` lang="${escape(head.lang)}"` : ""}>
${bodyTitle(head)}
`;
  },
  footer() { return "</body>\n</html>"; },
  postprocess(text) {
    return text
      .split("\n")
      .map(line => textLinify(line, {width: 80}))
      .join("\n")
  },
};

//-----------------------------------------------------------------------------

const preview = {
  header(head) {
    return lines2text([
      bodyHeader(head),
      bodyTitle(head),
    ])
  },
  footer() {}
}

// Also, remember, that preview uses <hr/> as page break indicator
// const pgbreak = p.pgbreak ? "<hr/>\n" : ""

function metaTitle(head) {
  const {title} = mawe.info(head)
  return `<title>${escape(title)}</title>`
}

function bodyHeader(head) {
  return `<div class="header">${escape(getHeader(head))}</div>`
}

function bodyTitle(head) {
  const {title, subtitle, author} = mawe.info(head)

  return lines2text([
    author ? `<p class="author">${escape(author)}</p>\n` : undefined,
    title  ? `<h1>${escape(title)}</h1>\n`: undefined,
    subtitle ? `<h2>${escape(subtitle)}</h2>\n`: undefined,
  ])
}

//-----------------------------------------------------------------------------

function escape(text) {
  return textEscape(text, {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })
}
