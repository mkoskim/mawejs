// ****************************************************************************
//
// LaTeX formatting table
//
// ****************************************************************************

import {elemAsText} from "../../document"

const packages=`\
\\documentclass[oneside,notitlepage,12pt]{book}
\\usepackage[a5paper]{geometry}
\\usepackage{times}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[finnish]{babel}
\\usepackage{setspace}
\\usepackage{xcolor}

\\setstretch{1.25}
\\pagestyle{plain}
`

export const formatTEX = {
  // File
  "file": (settings, head, content) => {
    //const author = head.nickname || head.author
    //const title = head.title ?? ""
    //const headinfo = author ? `${author}: ${title}` : title
    return `\
${packages}
\\begin{document}
\\title{${head.title ?? ""}}
\\author{${head.author ?? ""}}
\\date{}
\\maketitle
%\\mainmatter
${content}
\\end{document}
`
  },

  //---------------------------------------------------------------------------
  // Head
  //"title": (settings, title) => `\\title{${escape(title)}}\n`,
  "title": (settings, title) => "",

  //---------------------------------------------------------------------------
  // Body
  "body": (settings, head, parts) => {
    const {separator} = settings.part
    //const sep = "\n\n" + escape(separator) + "\n\n"
    //const sep = `\n\n\\chapter\n\n`
    const sep = ""
    return head + parts.join("\n\n\\begin{center}* * *\\end{center}\n\n")
  },

  //---------------------------------------------------------------------------

  // Part
  "part": (settings, part, scenes) => {
    //const {separator} = settings.scene
    //const sep = separator ? (center(formatTXT["sep.scene"](separator)) + "\n\n" : "\n\n"
    return scenes.join("\n\n\\par\\null\n\n")
  },

  // Scene & breaks
  "scene": (settings, scene, splits) => {
    return splits.join("\n\n\\par\\null\n\n")
  },
  "split": (settings, paragraphs) => "\\noindent " + paragraphs.join("\n\n"),

  // Paragraph styles
  "synopsis": (settings, p) => undefined,
  "comment": (settings, p) => undefined,
  "missing": (settings, p) => `{\\color{red}${linify(elemAsText(p))}}`,
  "p": (settings, p) => `${linify(elemAsText(p))}`,
}

function escape(text) {
  return (text && text
    .replaceAll('\\', "{\\textbackslash}")
    .replaceAll('&', "\\&")
    .replaceAll('%', "\\%")
    .replaceAll('$', "\\$")
    .replaceAll('#', "\\#")
    .replaceAll('_', "\\_")
    .replaceAll('{', "\\{")
    .replaceAll('}', "\\}")
    .replaceAll('~', "{\\textasciitilde}")
    .replaceAll('^', "{\\textasciicircum}")
    .replaceAll('"', "''")

    // If you have copy-pasted text, you may have these
    .replaceAll('“', "''")
    .replaceAll('”', "''")
    .replaceAll('…', "...")
  )
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
