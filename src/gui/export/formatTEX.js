// ****************************************************************************
//
// LaTeX formatting table
//
// ****************************************************************************

import { elemAsText } from "../../document"

//-----------------------------------------------------------------------------

function paperSize(sides) {
  if(sides === "twoside") {
    return "\\usepackage[a5paper, nohead, top=0.5in, inner=1.25in, outer=0.5in]{geometry}"
  }
  return "\\usepackage[a5paper, nohead, top=0.5in]{geometry}"
}

const commonHeading = `\
\\usepackage{times}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[finnish]{babel}
\\usepackage{setspace}
\\usepackage{xcolor}
\\usepackage{nextpage}
\\usepackage{ifthen}
\\usepackage{xfp}

\\setstretch{1.2}
\\frenchspacing
\\sloppy
`

function renewCommands(options, sides) {
  const newpage = sides === "oneside" ? "\\newpage" : "\\cleartooddpage"

  return `\
\\makeatletter

\\def\\subtitle#1{\\gdef\\@subtitle{#1}}

\\renewcommand\\maketitle{
  ${options.pgbreak ? "\\null\\vskip 4cm" : ""}
  {\\center
    {\\@author \\par}
    \\vskip 12pt
    {\\LARGE \\@title \\par}%
    \\ifthenelse{\\equal{\\@subtitle}{}}
    {}
    {
      \\vskip 8pt
      {\\large \\@subtitle \\par}
    }
  }
  ${options.pgbreak ? newpage : "\\vskip 48pt"}
}

\\renewcommand\\chapter[2]{
  ${options.pgbreak ? newpage : "\\vskip 36pt"}
  \\ifthenelse{\\equal{#1}{}}
  {{\\Large\\noindent #2}}
  {
    \\ifthenelse{\\equal{#2}{}}
    {{\\Large\\noindent #1}}
    {{\\begin{center}
      \\chaptername{} #1\\vskip 12pt
      \\large\\bfseries #2
      \\end{center}
    }}
  }
  \\vskip 48pt
}

\\newcommand\\separator[1]{
  \\vskip 24pt
  \\begin{center}#1\\end{center}
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

function FileHeading(head, options, sides) {
  const { author, title, subtitle } = head

  return `\
${paperSize(sides)}
${commonHeading}
\\begin{document}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Macros
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${renewCommands(options, sides)}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Doc Info
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\author{${author ?? ""}}
\\title{${title ?? ""}}
\\subtitle{${subtitle ?? ""}}
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
    const frontmatter = options.pgbreak ? "\\frontmatter\\pagestyle{empty}" : "\\pagestyle{plain}"
    const mainmatter  = options.pgbreak ? "\\mainmatter\\pagestyle{plain}" : ""
    const backmatter  = options.pgbreak ? "\\backmatter\\pagestyle{empty}" : ""
    // const mainmatter = options.pgbreak ? "\\mainmatter" : ""

    return `\
\\documentclass[${sides},${titlepage},12pt]{book}
${FileHeading(head, options, sides)}

${frontmatter}
\\maketitle

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${mainmatter}
${content}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${backmatter}

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
    const frontmatter = options.pgbreak ? "\\frontmatter\\pagestyle{empty}" : ""
    const mainmatter  = options.pgbreak ? "\\mainmatter\\pagestyle{plain}" : ""
    const backmatter  = options.pgbreak ? "\\backmatter\\pagestyle{empty}" : ""

    return `\
\\documentclass[${sides},${titlepage},12pt]{book}
${FileHeading(head, options, sides)}
\\pagestyle{plain}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${frontmatter}
\\maketitle

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${mainmatter}
${content}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${backmatter}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\backcover
\\null
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
    return "\n\n\\separator{* * *}\n\n"
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
