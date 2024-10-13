// ****************************************************************************
//
// ASCII .TXT formatting table
//
// ****************************************************************************

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
`
  },

  //---------------------------------------------------------------------------
  // Joining elements

  body: (chapters, options) => {
    return chapters.join(getSeparator(options.separator))
  },

  chapter: (head, scenes, options) => {
    return head + scenes.join(getSeparator(options.separator))
  },

  scene: (head, splits) => {
    return head + splits.join("\n\n")
  },

  split: (paragraphs) => paragraphs.join("\n    "),

  hact: (id, number, name, options) => {
    if(options.skip) return ""

    const numbering = options.number ? [escape(`${options.prefix ?? ""}${number}`)] : []
    const title = options.name ? [escape(name)] : []
    const head = [ ...numbering, ...title].join(". ")

    if(!head) return ""

    return `${head}\n\n`
  },

  hchapter: (id, number, name, options) => {
    if(options.skip) return ""

    const numbering = options.number ? [escape(`${options.prefix ?? ""}${number}`)] : []
    const title = options.name ? [escape(name)] : []
    const head = [ ...numbering, ...title].join(". ")

    if(!head) return ""

    return `${head}\n\n`
  },

  hscene: undefined,

  // Paragraph styles
  //"synopsis": (p) => undefined,
  //"comment": (sp) => undefined,
  "missing": (p,text) => `!! ${linify(text)}`,
  "p": (p, text) => `${linify(text)}`,

  "b": (text) => `*${text}*`,
  "i": (text) => `_${text}_`,
  "text": (text) => text,
}

//-----------------------------------------------------------------------------

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

  //---------------------------------------------------------------------------
  // Joining elements

  body: (chapters, options) => {
    return chapters.join(getSeparator(options.separator))
  },

  chapter: (head, scenes, options) => {
    return head + scenes.join(getSeparator(options.separator))
  },

  scene: (head, splits) => {
    return head + splits.join("\n\n")
  },

  split: (paragraphs) => paragraphs.join("\n\n"),

  //---------------------------------------------------------------------------
  // Headings
  //---------------------------------------------------------------------------

  hact: (id, number, name, options) => {
    if(options.skip) return ""

    const numbering = options.number ? [escape(`${options.prefix ?? ""}${number}`)] : []
    const title = options.name ? [escape(name)] : []
    const head = [ ...numbering, ...title].join(". ")

    if(!head) return ""

    return `# ${head}\n\n`
  },

  hchapter: (id, number, name, options) => {
    if(options.skip) return ""

    const numbering = options.number ? [escape(`${options.prefix ?? ""}${number}`)] : []
    const title = options.name ? [escape(name)] : []
    const head = [ ...numbering, ...title].join(". ")

    if(!head) return ""

    return `## ${head}\n\n`
  },

  hscene: undefined,

  // Paragraph styles
  //"synopsis": (p) => undefined,
  //"comment": (sp) => undefined,
  "missing": (p,text) => `!! ${text}`,
  "p": (p, text) => `${text}`,

  "b": (text) => `**${text}**`,
  "i": (text) => `_${text}_`,
  "text": (text) => text,
}

//-----------------------------------------------------------------------------

function getSeparator(separator) {
  if(separator) {
    return `\n\n${center(separator)}\n\n`
  }
  return "\n\n"
}

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
