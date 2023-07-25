// ****************************************************************************
//
// ASCII .TXT formatting table
//
// ****************************************************************************

import {elemAsText} from "../../document"

export const formatTXT = {
  // File
  "file": (settings, head, content) => {
    //const author = head.nickname || head.author
    //const title = head.title ?? ""
    //const headinfo = author ? `${author}: ${title}` : title
    return content
  },

  //---------------------------------------------------------------------------
  // Head
  "title": (settings, title) => `${center(title.toUpperCase())}\n\n`,

  //---------------------------------------------------------------------------
  // Body
  "body": (settings, head, parts) => {
    const {separator} = settings.part
    const sep = "\n\n" + center(separator) + "\n\n"
    return head + parts.join(sep)
  },

  //---------------------------------------------------------------------------

  // Part
  "part": (settings, part, scenes) => {
    //const {separator} = settings.scene
    //const sep = separator ? (center(formatTXT["sep.scene"](separator)) + "\n\n" : "\n\n"
    return scenes.join("\n\n")
  },

  // Scene & breaks
  "scene": (settings, scene, splits) => {
    return splits.join("\n\n")
  },
  "split": (settings, paragraphs) => paragraphs.join("\n    "),

  // Paragraph styles
  "synopsis": (settings, p) => undefined,
  "comment": (settings, p) => undefined,
  "missing": (settings, p) => `!! ${linify(elemAsText(p))}`,
  "p": (settings, p) => `${linify(elemAsText(p))}`,
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
