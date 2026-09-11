//*****************************************************************************
//
// LaTeX formatting table
//
//*****************************************************************************

import {textEscape} from "./util.js";

export function getTEXConverter(options={}) {
  return {suffix: ".tex", ...file, ...formatter};
}

// TODO: File postprocessing, e.g. linify

//-----------------------------------------------------------------------------

const file = {
  header() { return; },
  footer() { return; },
}

const formatter = {

  //---------------------------------------------------------------------------
  // Paragraph styles
  //---------------------------------------------------------------------------

  p({first, text}) {return `${first ? "\\noindent " : ""}${text}\n`; },
  missing({first, text}) { return `{${first ? "\\noindent" : ""}\\color{red}${text}}\n`; },
  quote({text}) { return (text ? `{${text}\\par}` : "\\par\\null") + "\n"; },

  bookmark() { return; },
  comment() { return; },
  tags() { return; },

  //---------------------------------------------------------------------------
  // Character styles
  //---------------------------------------------------------------------------

  text({text, bold, italic}) {
    text = escape(text)
    if(bold) text = this.bold(text)
    if(italic) text = this.italic(text)
    return text
  },
  bold(text) { return `\\textbf{${text}}`; },
  italic(text) { return `\\textit{${text}}`; },
}

//-----------------------------------------------------------------------------

const escapes = {
  '\\': "{\\textbackslash}",
  '&': "\\&",
  '%': "\\%",
  '$': "\\$",
  '#': "\\#",
  '_': "\\_",
  '{': "\\{",
  '}': "\\}",
  '~': "{\\textasciitilde}",
  '^': "{\\textasciicircum}",
  '"': "{\\textquotedbl}",
  '<': "{\\textless}",
  '>': "{\\textgreater}",
  '|': "{\\textbar}",
}

function escape(text) {
  // Replace source characters once so generated commands are not escaped.
  // Unicode text remains unchanged for UTF-8 output (modern LaTeX's default).
  return textEscape(text, escapes)
}
