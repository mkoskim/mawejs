//*****************************************************************************
//
// ASCII .TXT formatting table
//
//*****************************************************************************

//*****************************************************************************
//
// Generic .TXT
//
//*****************************************************************************

export const formatTXT = {
  // Info
  suffix: ".txt",

  // File
  file: (head, content, options) => {
    //const author = head.nickname || head.author
    const {author, title, subtitle} = head
    //const headinfo = author ? `${author}: ${title}` : title
    return `\
${center(author ?? "")}

${center(title.toUpperCase()) ?? ""}
${subtitle ? "\n" + center(subtitle) + "\n" : ""}

${content}
`},

  hact: (p) => formatHeading(p, ""),
  hchapter: (p) => formatHeading(p, ""),
  hscene: undefined,

  separator: () => "* * *\n",
  br: () => "\n",

  //"bookmark": (p) => undefined,
  //"comment": (sp) => undefined,
  "missing": (p, text) => linify(`${p.first ? "    " : ""}!! ${text}`),
  "p": (p, text) => linify(`${p.first ? "    " : ""}${text}`),

  "quote": (p, text) => linify(`    ${text}`),

  "b": (text) => `*${text}*`,
  "i": (text) => `_${text}_`,
  "text": (text) => text,
}

//*****************************************************************************
//
// Generic .MD (Mark-Down)
//
//*****************************************************************************

export const formatMD = {
  // Info
  suffix: ".md",

  // File
  file: (head, content, options) => {
    //const author = head.nickname || head.author
    const {author, title, subtitle} = head
    //const headinfo = author ? `${author}: ${title}` : title
    return `\
${author ?? ""}

# ${title.toUpperCase() ?? ""}

${subtitle ? "\n## " + subtitle + "\n" : ""}

${content}
`
  },

  hact: (p) => formatHeading(p, "#"),
  hchapter: (p) => formatHeading(p, "##"),
  hscene: undefined,

  separator: () => "* * *\n",
  br: () => "\n",

  //"bookmark": (p) => undefined,
  //"comment": (sp) => undefined,
  "missing": (p, text) => `!! ${text}\n`,
  "p": (p, text) => `${text}\n`,
  "quote": (p, text) => `    ${text}`,

  "b": (text) => `**${text}**`,
  "i": (text) => `_${text}_`,
  "text": (text) => text,
}

//*****************************************************************************
//
// Paragraph formatting
//
//*****************************************************************************

function formatHeading(p, tag)
{
  const {title, number} = p
  if(!title && !number) return

  const numbering = number ? [`${number}`] : []
  const text = title ? [title] : []
  const head = [ ...numbering, ...text].join(". ")

  return `${tag} ${escape(head)}\n`
}

//*****************************************************************************
//
// Misc text utils
//
//*****************************************************************************

function escape(text) {
  return text
}

//-----------------------------------------------------------------------------

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
