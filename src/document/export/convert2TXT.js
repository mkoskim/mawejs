//*****************************************************************************
//
// ASCII .TXT formatting table
//
//*****************************************************************************

import { mawe } from "..";
import { textLinify } from "./util";

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
  postprocess(text) { return text; }
}

//*****************************************************************************
//
// MD (MarkDown) format
//
//*****************************************************************************

function linify(text) { return textLinify(text, {width: 80})}

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

  p({first, text}) { return linify(`${text}\n`); },
  missing({first, text}) { return linify(`!! ${text}\n`); },
  quote({first, text}) { return linify(`> ${text}\n>`); },

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
