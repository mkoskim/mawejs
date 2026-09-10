//*****************************************************************************
//
// ASCII .TXT formatting table
//
//*****************************************************************************

import { mawe } from "..";

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
  header(head) {
    const {title, subtitle, author} = mawe.info(head)
    return [
      `${author ? escape(author) : ""}`,
      `${title ? "# " + escape(title).toUpperCase() : ""}`,
      `${subtitle ? "## " + escape(subtitle) : ""}`,
    ].join("\n\n")
  },
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

  act(node) { return makeHeader("##", node); },
  chapter(node) { return makeHeader("###", node); },
  scene(node) { return makeHeader("####", node); },
  br(node) { return makeHeader(undefined, node); },

  //---------------------------------------------------------------------------
  // Format paragraphs: MD does not like indentations.
  //---------------------------------------------------------------------------

  p({first, text}) { return `${text}\n`; },
  missing({first, text}) { return `!! ${text}\n`; },
  quote({first, text}) { return `> ${text}\n>`; },

  //p({first, text}) { return `${first ? "" : "    "}${text}\n`; },
  //quote({first, text}) { return `${text}\n`; },
  //missing({first, text}) { return `${first ? "" : "    "}!! ${text}\n`; },

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

  switch(header) {
    case "none": return undefined
    case "break": return first ? undefined : "&nbsp;\n"
    case "separated": return first ? undefined : `${tag} * * *\n`
    default: break;
  }

  if(number) {
    const numbering = `${prefix ? (escape(prefix) + " ") : ""}${number}`

    switch(header) {
      case "numbered": return `${tag} ${numbering}\n`
      case "numbered&named": return `${tag} ${number ? numbering + ". " : ""}${text}\n`
      default: break;
    }
  }
  return `${tag} ${text}\n`;
}

//-----------------------------------------------------------------------------

function escape(text) {
  return text;
}

//*****************************************************************************
//
// Utils for plain (non-MD) exports (not used atm)
//
//*****************************************************************************

function linify(text) {
  const words = escape(text).split(" ").filter(p => p.length)
  var lines = [""]
  for(const word of words) {
    const last = lines[lines.length-1]
    if(!last.length) {
      lines[lines.length-1] = word
    } else if(last.length + word.length + 1 < 80) {
      lines[lines.length-1] = last + " " + word
    } else {
      lines.push(word)
    }
  }
  return lines.join("\n")
}

function center(text) {
  const escaped = escape(text)
  return escaped.padStart((40+escaped.length/2), " ")
}
