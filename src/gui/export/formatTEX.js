// ****************************************************************************
//
// LaTeX formatting table
//
// ****************************************************************************

import {elemAsText} from "../../document"

//-----------------------------------------------------------------------------

const packages=`\
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

//-----------------------------------------------------------------------------

export const formatTEX = {
  // Info
  "suffix": ".tex",

  // File
  "file": (head, content, options) => {
    const titlepage = options.pgbreak ? "titlepage" : "notitlepage"
    const mainmatter = options.pgbreak ? "\\mainmatter" : ""
    const {author, title, subtitle} = head

    return `\
\\documentclass[oneside,${titlepage},12pt]{book}
${packages}
\\begin{document}
\\author{${author ?? ""}}
\\title{
  ${title ?? ""}
  ${subtitle ? "\\\\ \\large " + subtitle : ""}
}
\\date{}
\\maketitle
${mainmatter}
${content}
\\end{document}
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

  "split": (paragraphs) => "\\noindent " + paragraphs.join("\n\n"),

  //---------------------------------------------------------------------------

  // Paragraph styles
  "synopsis": (p) => undefined,
  "comment": (p) => undefined,
  "missing": (p) => `{\\color{red}${linify(elemAsText(p))}}`,
  "p": (p) => `${linify(elemAsText(p))}`,
}

//-----------------------------------------------------------------------------

function getHeading(elem, type, pgbreak, chnum) {
  const size = pgbreak ? "\\Large" : "\\large"
  const sb = pgbreak ? "\\newpage" : "\n\n"
  const sa = "\n\n\\par\\null\n\n"

  switch(type) {
    case "numbered": return `${sb}{\\noindent${size} ${chnum}.}${sa}`
    case "named": return `${sb}{\\noindent${size} ${chnum}. ${escape(elem.name)}}${sa}`
    default: break;
  }
  return ""
}

function getSeparator(separator, pgbreak) {
  if(separator) {
    //if(pgbreak) return "\\page"
    return "\n\n\\begin{center}* * *\\end{center}\n\n"
  }
  return "\n\n\\par\\null\n\n"
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
