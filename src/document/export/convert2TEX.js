//*****************************************************************************
//
// LaTeX formatting table
//
//*****************************************************************************

export function getTEXConverter(options={}) {
  return {suffix: ".tex", ...file, ...formatter};
}

//-----------------------------------------------------------------------------

const file = {
  header() { return; },
  footer() { return; },
}

const formatter = {

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

function escape(text) {
  // Replace source characters once so generated commands are not escaped.
  // Unicode text remains unchanged for UTF-8 output (modern LaTeX's default).
  return text && text.replace(/[\\&%$#_{}~^"<>|]/g, char => escapes[char])
}

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
