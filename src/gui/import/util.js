//*****************************************************************************
//
// Import utilities
//
//*****************************************************************************

export function text2lines(content, linebreak = "\n\n") {
  return content
    .replaceAll("\r", "")
    .split(linebreak)
    .map(line => line.replaceAll(/\s+/g, " ").trim())
}
