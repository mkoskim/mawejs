// ****************************************************************************
//
// LaTeX formatting table
//
// ****************************************************************************

import { elemAsText } from "../../document"

//-----------------------------------------------------------------------------

const commonHeading = `\
\\usepackage[a5paper]{geometry}
\\usepackage{times}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[finnish]{babel}
\\usepackage{setspace}
\\usepackage{xcolor}
\\usepackage{nextpage}
\\usepackage{ifthen}
\\usepackage{xfp}

\\setstretch{1.25}
\\pagestyle{plain}

\\makeatletter
\\def\\subtitle#1{\\gdef\\@subtitle{#1}}
\\makeatother
`

function renewCommands(options, sides) {
  const newpage = sides === "oneside" ? "\\newpage" : "\\cleartooddpage"

  return `\
\\makeatletter

\\renewcommand\\maketitle{
  ${options.pgbreak ? "\\null\\vskip 4cm" : ""}
  {\\center
    {\\@author \\par}
    \\vskip 1em
    {\\LARGE \\@title \\par}%
    \\ifthenelse{\\equal{\\@subtitle}{\\empty}}
    {}
    {
      \\vskip 1.5em
      {\\Large \\@subtitle \\par}
    }
  }
  ${options.pgbreak ? newpage : "\\vskip 1cm"}
}

\\renewcommand\\chapter[2]{
  ${options.pgbreak ? newpage : "\\vskip 1cm"}
  \\ifthenelse{\\equal{#1}{}}
  {{\\Large\\noindent #2}}
  {
    \\ifthenelse{\\equal{#2}{}}
    {{\\Large\\noindent #1}}
    {{\\Large\\noindent #1. #2}}
  }
  \\vskip 0.5cm
}

\\newcommand{\\doifmultipleof}[2]{%
  \\ifnum\\numexpr((#2)/(#1))*(#1)-(#2)=0
    \\expandafter\\@firstoftwo
  \\else
    \\expandafter\\@secondoftwo
  \\fi}

\\newcommand\\abspagenumber{\\inteval{\\ReadonlyShipoutCounter+1}}

\\newcommand\\backcover{
  \\cleartoevenpage
  \\doifmultipleof{4}{\\abspagenumber}{}{\\null\\cleartoevenpage}
}

\\makeatother
`
}

function FileHeading(head, options) {
  const { author, title, subtitle } = head

  return `\
${commonHeading}
\\author{${author ?? ""}}
\\title{${title ?? ""}}
\\subtitle{${subtitle ?? ""}}
\\date{}
`
}

//-----------------------------------------------------------------------------
// Generic TEX formatter
//-----------------------------------------------------------------------------

const formatTEX = {
  // Info
  "suffix": ".tex",

  // File
  "file": (head, content, options) => {
    const sides = "oneside"
    const titlepage = options.pgbreak ? "titlepage" : "notitlepage"
    // const mainmatter = options.pgbreak ? "\\mainmatter" : ""

    return `\
\\documentclass[${sides},${titlepage},12pt]{book}
${FileHeading(head, options)}

\\begin{document}
${renewCommands(options, sides)}
\\maketitle
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${content}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\end{document}
`
  },

  //---------------------------------------------------------------------------
  // Joining elements

  "body": (parts, options) => {
    const { separator, pgbreak } = options
    return parts.join(getSeparator(separator, pgbreak))
  },

  "part": (part, scenes, options) => {
    const { type, separator, pgbreak, chnum } = options
    return getHeading(part, type, pgbreak, chnum) + scenes.join(getSeparator(separator, pgbreak))
  },

  "scene": (scene, splits, options) => {
    const { type, separator, pgbreak, chnum } = options
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
// Onesided TEX
//-----------------------------------------------------------------------------

export const formatTEX1 = {
  ...formatTEX,
}

//-----------------------------------------------------------------------------
// Twosided booklet TEX
//-----------------------------------------------------------------------------

export const formatTEX2 = {
  ...formatTEX,

  // File
  "file": (head, content, options) => {
    const sides = "twoside"
    const titlepage = options.pgbreak ? "titlepage" : "notitlepage"
    // const mainmatter = options.pgbreak ? "\\mainmatter" : ""

    return `\
\\documentclass[${sides},${titlepage},12pt]{book}
${FileHeading(head, options)}
\\begin{document}
${renewCommands(options, sides)}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\frontmatter
\\pagestyle{empty}
\\maketitle

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\mainmatter
\\pagestyle{plain}
${content}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\backmatter
\\pagestyle{empty}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\backcover
Takakansiteksti
\\end{document}
`
  },
}

//-----------------------------------------------------------------------------

function getHeading(elem, type, pgbreak, chnum) {
  switch(type) {
    case "numbered": return `\n\n\\chapter{${chnum}}{}\n\n`
    case "named": return `\n\n\\chapter{${chnum}}{${escape(elem.name)}}\n\n`
    default: break;
  }
  return ""
/*
  const size = pgbreak ? "\\Large" : "\\large"
  const sb = pgbreak ? "\\cleartooddpage" : "\n\n"
  const sa = "\n\n\\par\\null\n\n"

  switch (type) {
    case "numbered": return `${sb}{\\noindent${size} ${chnum}.}${sa}`
    case "named": return `${sb}{\\noindent${size} ${chnum}. ${escape(elem.name)}}${sa}`
    default: break;
  }
  return ""
*/
}

function getSeparator(separator, pgbreak) {
  if (separator) {
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
  for (const word of words) {
    const last = lines[lines.length - 1]
    if (!last.length) {
      lines[lines.length - 1] = word
    } else if (last.length + word.length + 1 < 80) {
      lines[lines.length - 1] = last + " " + word
    } else {
      lines.push(word)
    }
  }
  return lines.join("\n")
}

function center(text) {
  const escaped = escape(text)
  return escaped.padStart((40 + escaped.length / 2), " ")
}
