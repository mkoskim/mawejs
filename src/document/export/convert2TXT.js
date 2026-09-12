//*****************************************************************************
//
// ASCII .TXT formatting table
//
//*****************************************************************************

import { mawe } from "..";
import { textLinify } from "./util";

export function getTextConverter({format = "md"}) {
  switch(format) {
    case "md": return {
      suffix: ".md",
      ...file,
      ...formatMD,
    }
    default:
    case "plain": return {
      ...formatPlain,
    }
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

function linify(text) { return textLinify(text, {width: 80})}

//-----------------------------------------------------------------------------

const formatMD = {

  //---------------------------------------------------------------------------
  // Format headers
  //---------------------------------------------------------------------------

  act(node) { return makeMDHeader("##", node); },
  chapter(node) { return makeMDHeader("###", node); },
  scene(node) { return makeMDHeader("####", node); },
  br(node) { return makeMDHeader("&nbsp;", node); },

  //---------------------------------------------------------------------------
  // Format paragraphs: MD does not like indentations.
  //---------------------------------------------------------------------------

  p({first, text}) { return linify(`${text}\n`); },
  missing({first, text}) { return linify(`!! ${text}\n`); },
  quote({first, text}) { return linify(`> ${text}\n>`); },

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

//-----------------------------------------------------------------------------

const formatPlain = {
  act(node) { return makePlainHeader(node); },
  chapter(node) { return makePlainHeader(node); },
  scene(node) { return makePlainHeader(node); },

  p({text}) { return `${text}\n`; },
  missing({text}) { return `${text}\n`; },
  quote({text}) { return `${text}\n`; },

  text({text}) { return text; },
}

//*****************************************************************************
//
// Helpers
//
//*****************************************************************************

function makeMDHeader(tag, {header = "none", prefix, first, number, pgbr = false, text}) {

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

function makePlainHeader({header = "none", prefix, first, number, text}) {

  switch(header) {
    case "none": return undefined
    case "break": return undefined
    case "separated": return "* * *\n"
    default: break;
  }

  if(number) {
    const numbering = `${prefix ? (escape(prefix) + " ") : ""}${number}`

    switch(header) {
      case "numbered": return `${numbering}\n`
      case "numbered&named": return `${number ? numbering + ". " : ""}${text}\n`
      default: break;
    }
  }
  return `${text}\n`;
}

//-----------------------------------------------------------------------------

function escape(text) {
  return text;
}
