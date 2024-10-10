// ****************************************************************************
//
// LaTeX formatting table
//
// ****************************************************************************

import { elemAsText, elemName } from "../../document"

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

\\setstretch{1.25}
\\frenchspacing
\\sloppy
`

function renewCommands(options, sides) {
  const newpage = sides === "oneside" ? "\\newpage" : "\\cleartooddpage"

  return `\
\\makeatletter

\\def\\subtitle#1{\\gdef\\@subtitle{#1}}

\\renewcommand\\maketitle{
  \\if@titlepage{\\null\\vskip 4cm}\\fi
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

\\newcommand\\innertitle{{\\center{\\Large\\@title\\vskip 48pt}}}

\\newcommand{\\RNum}[1]{\\uppercase\\expandafter{\\romannumeral #1\\relax}}

\\newcommand{\\chNumber}[1]{
}

\\renewcommand\\chapter[2]{
  ${options.pgbreak ? newpage : "\\vskip 36pt"}
  \\begin{center}
    \\if@titlepage
      \\ifthenelse{\\equal{#1}{}}{}{\\RNum{#1}\\vskip 12pt}
      \\ifthenelse{\\equal{#2}{}}{}{\\textbf{#2}}
    \\else
      \\ifthenelse{\\equal{#1}{}}{}{\\textbf{#1. }}
      \\ifthenelse{\\equal{#2}{}}{}{\\textbf{#2}}
    \\fi
  \\end{center}
  ${options.pgbreak ? "\\vskip 48pt" : "\\vskip 18pt"}
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
    const titlepage = options.long ? "titlepage" : "notitlepage"
    const frontmatter = options.long ? "\\frontmatter\\pagestyle{empty}" : "\\pagestyle{plain}"
    const mainmatter  = options.long ? "\\mainmatter\\pagestyle{plain}" : ""
    const backmatter  = options.long ? "\\backmatter\\pagestyle{empty}" : ""
    // const mainmatter = options.pgbreak ? "\\mainmatter" : ""

    return `\
\\documentclass[${sides},${titlepage},12pt]{book}
${FileHeading(head, options, sides)}

${frontmatter}
\\maketitle

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${mainmatter}
${options.pgbreak ? "" : ""}
${content}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${backmatter}

\\end{document}
`
  },

  //---------------------------------------------------------------------------
  // Joining elements

  "body": (chapters, options) => {
    return chapters.join(getSeparator(options.separator))
  },

  "chapter": (head, scenes, options) => {
    return head + scenes.join(getSeparator(options.separator))
  },

  "scene": (head, splits) => {
    return head + splits.join("\n\n")
  },

  "split": (paragraphs) => "\\noindent " + paragraphs.join("\n\n"),

  //---------------------------------------------------------------------------
  // Headings
  //---------------------------------------------------------------------------

  "hchapter": (id, number, name, options) => {
    if(options.skip) return ""

    //const pgbreak = options.pgbreak ? "<hr/>\n" : ""
    const chnum = options.number ? [escape(`${options.prefix ?? ""}${number}`)] : []
    const title = options.name ? [escape(name)] : []
    //const head = [ ...numbering, ...title].join(". ")

    return `\n\n\\chapter{${chnum}}{${title}}\n\n`
    //return `${pgbreak}<h2 id="${id}">${head}</h2>`
  },

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

  //---------------------------------------------------------------------------

  // Paragraph styles
  //"synopsis": (p) => undefined,
  //"comment": (p) => undefined,
  "missing": (p, text) => `{\\color{red}${linify(text)}}`,
  "p": (p, text) => `${linify(text)}`,

  "b": (text) => `\\textbf{${text}}`,
  "i": (text) => `\\textit{${text}}`,
  "text": (text) => escape(text),
}

//-----------------------------------------------------------------------------
// Onesided TEX
//-----------------------------------------------------------------------------

export const formatTEX1 = {
  ...formatTEX,
}

//-----------------------------------------------------------------------------
// Twosided booklet TEX: Always insert title page, and backcover
//-----------------------------------------------------------------------------

export const formatTEX2 = {
  ...formatTEX,

  // File
  "file": (head, content, options) => {
    const sides = "twoside"
    //const titlepage = options.pgbreak ? "titlepage" : "notitlepage"
    //const frontmatter = options.pgbreak ? "\\frontmatter\\pagestyle{empty}" : ""
    //const mainmatter  = options.pgbreak ? "\\mainmatter\\pagestyle{plain}" : ""
    //const backmatter  = options.pgbreak ? "\\backmatter\\pagestyle{empty}" : ""

    const titlepage = "titlepage"
    const frontmatter = "\\frontmatter\\pagestyle{empty}"
    const mainmatter  = "\\mainmatter\\pagestyle{plain}"
    const backmatter  = "\\backmatter\\pagestyle{empty}"

    return `\
\\documentclass[${sides},${titlepage},12pt]{book}
${FileHeading(head, options, sides)}
\\pagestyle{plain}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${frontmatter}
\\maketitle

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${mainmatter}
${options.pgbreak ? "" : "\\innertitle"}
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
  const words = text.split(" ").filter(p => p.length)
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
  //const escaped = escape(text)
  return text.padStart((40 + text.length / 2), " ")
}
