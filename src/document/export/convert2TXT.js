//*****************************************************************************
//
// ASCII .TXT formatting table
//
//*****************************************************************************

export function getTextConverter({format = "md"}) {
  switch(format) {
    default:
    case "md": return {
      suffix: ".md",
      ...file,
      ...formatMD,
    }
    /*
    case "txt": return {
      suffix: ".txt",
      ...file,
      ...formatter,
    }
    */
  }
}

//-----------------------------------------------------------------------------

const file = {
  header() { return; },
  footer() { return; },
}

//*****************************************************************************
//
// MD (MarkDown) format
//
//*****************************************************************************

const formatMD = {

  //---------------------------------------------------------------------------
  // Title, subtitle, author
  //---------------------------------------------------------------------------

  title(head) { return; },

  //---------------------------------------------------------------------------
  // Format headers
  //---------------------------------------------------------------------------

  act(node) { return makeHeader("#", node); },
  chapter(node) { return makeHeader("##", node); },
  scene(node) { return makeHeader("###", node); },

  //---------------------------------------------------------------------------
  // Format paragraphs: MD does not like indentations.
  //---------------------------------------------------------------------------

  p({first, text}) { return `${text}\n`; },
  missing({first, text}) { return `!! ${text}\n`; },
  quote({first, text}) { return `> ${text}\n>`; },

  //p({first, text}) { return `${first ? "" : "    "}${text}\n`; },
  //quote({first, text}) { return `${text}\n`; },
  //missing({first, text}) { return `${first ? "" : "    "}!! ${text}\n`; },
  br() { return "\n"; },

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
  bold(text) { return `**${text}**`; },
  italic(text) { return `_${text}_`; },
}

//*****************************************************************************
//
// Helpers
//
//*****************************************************************************

function makeHeader(tag, {header = "none", prefix, first, number, pgbr = false, text}) {

  const numbering = number ? `${prefix ? (escape(prefix) + " ") : ""}${number}` : ""

  switch(header) {
    default:
    case "none": return undefined
    case "separated": return `${tag} ${first ? "" : "* * *\n"}`
    case "numbered": if(number) { return `${tag} ${numbering}\n`}
    // Fall-through
    case "named": return `${tag} ${text}\n`;
    case "numbered&named": return `${tag} ${number ? numbering + ". " : ""}${text}\n`
  }
  /*
  const numbering = number ? [`${prefix ? (prefix + " ") : ""}${number}`] : []
  const text = title ? [title] : []
  const head = [ ...numbering, ...text].join(". ")

  return `${tag} ${escape(head)}\n`
  */
  // return `${tag} ${prefix} ${number} ${text}`
}

//-----------------------------------------------------------------------------

function escape(text) {
  return text;
}
