//*****************************************************************************
//
// RTF formatting table
//
//*****************************************************************************

export function getRTFConverter(options={}) {
  return {suffix: ".rtf", ...file, ...formatter};
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
  bold(text) { return `{\\b ${text}}`; },
  italic(text) { return `{\\i ${text}}`; },
}

//-----------------------------------------------------------------------------

function escape(text) {
  if(!text) return text

  return text.split("").map(charEscape).join("")

  function charEscape(c) {
    const code = c.charCodeAt(0)
    // RTF uses signed UTF-16 code units, including surrogate pairs.
    // The '?' fallback assumes \uc1 (also the RTF default).
    if(code > 127) return `\\u${code > 32767 ? code - 65536 : code}?`
    switch(c) {
      case '\\': return "\\\\"
      case '{': return "\\{"
      case '}': return "\\}"
      //case '~': return "\\~"
    }
    return c
  }
}
