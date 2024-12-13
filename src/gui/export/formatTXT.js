// ****************************************************************************
//
// ASCII .TXT formatting table
//
// ****************************************************************************

export const formatTXT = {
  // Info
  suffix: ".txt",

  // File
  head: (head, options) => {
    //const author = head.nickname || head.author
    const {author, title, subtitle} = head
    //const headinfo = author ? `${author}: ${title}` : title
    return `\
${center(author ?? "")}

${center(title.toUpperCase()) ?? ""}
${subtitle ? "\n" + center(subtitle) + "\n" : ""}
`
  },

  footer: (options) => "",

  //---------------------------------------------------------------------------
  // Joining elements

  hact: (p) => {
    const {title, number} = p
    if(!title && !number) return

    const numbering = number ? [`${number}`] : []
    const text = title ? [title] : []
    const head = [ ...numbering, ...text].join(". ")

    return `${escape(head)}\n`
  },

  hchapter: (p) => {
    const {title, number} = p
    if(!title && !number) return

    const numbering = number ? [`${number}`] : []
    const text = title ? [title] : []
    const head = [ ...numbering, ...text].join(". ")

    return `${escape(head)}\n`
  },

  hscene: undefined,

  // Paragraph styles
  //"bookmark": (p) => undefined,
  //"comment": (sp) => undefined,
  "missing": (p, text) => linify(`${p.first ? "    " : ""}!! ${text}`),
  "p": (p, text) => linify(`${p.first ? "    " : ""}${text}`),

  "b": (text) => `*${text}*`,
  "i": (text) => `_${text}_`,
  "text": (text) => text,
}

//-----------------------------------------------------------------------------

export const formatMD = {
  // Info
  suffix: ".md",

  // File
  head: (head, options) => {
    //const author = head.nickname || head.author
    const {author, title, subtitle} = head
    //const headinfo = author ? `${author}: ${title}` : title
    return `\
${author ?? ""}

# ${title.toUpperCase() ?? ""}

${subtitle ? "\n## " + subtitle + "\n" : ""}
`
  },

  footer: (options) => "",

  //---------------------------------------------------------------------------
  // Headings
  //---------------------------------------------------------------------------

  hact: (p) => {
    const {title, number} = p
    if(!title && !number) return

    const numbering = number ? [`${number}`] : []
    const text = title ? [title] : []
    const head = [ ...numbering, ...text].join(". ")

    return `# ${escape(head)}\n`
  },

  hchapter: (p) => {
    const {title, number} = p
    if(!title && !number) return

    const numbering = number ? [`${number}`] : []
    const text = title ? [title] : []
    const head = [ ...numbering, ...text].join(". ")

    return `## ${escape(head)}\n`
  },

  hscene: undefined,

  //---------------------------------------------------------------------------
  // Breaks
  //---------------------------------------------------------------------------

  separator: () => "* * *\n",
  br: () => "\n",

  //---------------------------------------------------------------------------
  // Paragraph styles
  //---------------------------------------------------------------------------

  // Paragraph styles
  //"bookmark": (p) => undefined,
  //"comment": (sp) => undefined,
  "missing": (p, text) => `!! ${text}\n`,
  "p": (p, text) => `${text}\n`,

  "b": (text) => `**${text}**`,
  "i": (text) => `_${text}_`,
  "text": (text) => text,
}

//-----------------------------------------------------------------------------

function escape(text) {
  return text
}

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
