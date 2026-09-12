//*****************************************************************************
//
// Utility functions for exporting
//
//*****************************************************************************

//-----------------------------------------------------------------------------

export function textEscape(text, escapes) {
  return text?.split("").map(char => escapes[char] || char).join("")
}

//-----------------------------------------------------------------------------

export function textLinify(text, {width = 80} = {}) {
  const words = text.split(" ").filter(p => p.length)
  var lines = [""]
  for(const word of words) {
    const last = lines[lines.length-1]
    if(!last.length) {
      lines[lines.length-1] = word
    } else if(last.length + word.length + 1 < width) {
      lines[lines.length-1] = last + " " + word
    } else {
      lines.push(word)
    }
  }
  return lines.join("\n")
}

export function textCenter(text, {width = 80} = {}) {
  return text.padStart((width/2 + text.length/2), " ")
}
