// ****************************************************************************
//
// ASCII .TXT formatting table
//
// ****************************************************************************

import {elemAsText, elemName} from "../../document"

export const formatTXT = {
  // Info
  "suffix": ".txt",

  // File
  "file": (head, content, options) => {
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

  "body": (parts, options) => {
    const {separator, pgbreak} = options
    return parts.join(getSeparator(separator, pgbreak))
  },

  "part": (part, scenes, options) => {
    const {type, separator, pgbreak, chnum} = options
    return getHeading(part, type, pgbreak, chnum) + scenes.join(getSeparator(separator, pgbreak))
  },

  "scene": (scene, splits, options) => {
    const {type, separator, pgbreak, chnum} = options
    return getHeading(scene, type, pgbreak, chnum) + splits.join(getSeparator(separator, pgbreak))
  },

  "split": (paragraphs) => paragraphs.join("\n    "),

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

function getHeading(elem, type, pgbreak, chnum) {
  //const size = pgbreak ? "\\Large" : "\\large"
  //const sb = pgbreak ? "\\newpage" : "\n\n"
  //const sa = "\n\n\\par\\null\n\n"

  switch(type) {
    case "numbered": return `${chnum}.\n\n`
    case "named": return `${chnum}. ${escape(elemName(elem))}\n\n`
    default: break;
  }
  return ""
}

function getSeparator(separator, pgbreak) {
  if(separator) {
    //if(pgbreak) return "\\page"
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
