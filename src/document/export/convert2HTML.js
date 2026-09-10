//*****************************************************************************
// Basic HTML converter for export development and previews.
//*****************************************************************************

export function getHTMLConverter(options={}) {
  return {suffix: ".html", ...file, ...formatter};
}

const file = {
  header() {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Export preview</title>
<style>
  body { max-width: 44rem; margin: 3rem auto; padding: 0 1.5rem;
    font-family: Georgia, serif; line-height: 1.6; }
  p { margin: 0; text-indent: 2em; }
  p.first { text-indent: 0; }
  blockquote { margin: 1em 2em; }
  .missing { color: #a33; }
  .break { height: 1em; }
  .separator { text-align: center; margin: 1em 0; }
  @media print { .page-break { break-before: page; } }
</style>
</head>
<body>`;
  },
  footer() { return "</body>\n</html>"; },
};

const formatter = {
  title() { return; },

  act(node) { return makeHeader("h1", node); },
  chapter(node) { return makeHeader("h2", node); },
  scene(node) { return makeHeader("h3", node); },

  p({first, text}) {
    return `<p${first ? ' class="first"' : ""}>${text}</p>`;
  },
  quote({text}) { return `<blockquote>${text}</blockquote>`; },
  missing({first, text}) {
    return `<p class="missing${first ? " first" : ""}">!! ${text}</p>`;
  },
  br() { return '<div class="break"></div>'; },

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

function makeHeader(tag, {header = "none", prefix, first, number, pgbr, text}) {
  const numbering = number ? `${prefix ? escape(prefix) + " " : ""}${number}` : "";
  let title;

  switch(header) {
    default:
    case "none": return;
    case "separated": return first ? undefined : '<div class="separator">* * *</div>';
    case "numbered": title = numbering || text; break;
    case "named": title = text; break;
    case "numbered&named": title = [numbering, text].filter(Boolean).join(". "); break;
  }

  if(!title) return;
  return `<${tag}${pgbr && !first ? ' class="page-break"' : ""}>${title}</${tag}>`;
}

//-----------------------------------------------------------------------------

function escape(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
