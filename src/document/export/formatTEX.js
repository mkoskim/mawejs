// ****************************************************************************
//
// LaTeX formatting
//
// ****************************************************************************

//-----------------------------------------------------------------------------
// Generic TEX formatter
//-----------------------------------------------------------------------------

const formatTEX = {
  // Info
  suffix: ".tex",

  // File
  file: formatFile1,

  //---------------------------------------------------------------------------
  // Headings
  //---------------------------------------------------------------------------

  hact: (p) => {
    const {title, number} = p
    if(!title) return

    return `\\part{${escape(title)}}\n`
  },

  hchapter: (p) => {

    const {title, number} = p
    if(!title && !number) return

    const numbering = number ? escape(number.toString()) : ""
    const head = title ? escape(title) : ""
    //const numbering = number ? [`${number}`] : []
    //const text = title ? [title] : []
    //const head = [ ...numbering, ...text].join(". ")

    return `\\chapter{${numbering}}{${head}}\n`
  },

  //---------------------------------------------------------------------------
  // Breaks
  //---------------------------------------------------------------------------

  separator: () => "\\separator{* * *}\n",
  //br: () => "\n\n\\par\\null\n\n",
  br: () => "\\par\\null\n",

  //---------------------------------------------------------------------------
  // Paragraph styles
  //---------------------------------------------------------------------------

  "missing": (p, text) => linify(`{${p.first ? "\\noindent" : ""}\\color{red}${text}}`) + "\n",
  "p": (p, text) => linify(`${p.first ? "\\noindent " : ""}${text}`) + "\n",

  //"bookmark": (p) => undefined,
  //"comment": (p) => undefined,

  "quote": (p, text) => (text ? `{${text}\\par}` : "\\par\\null") + "\n",

  //---------------------------------------------------------------------------
  // Character styles
  //---------------------------------------------------------------------------

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
  file: formatFile2,
}

//*****************************************************************************
//
// LaTeX formatting
//
//*****************************************************************************

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
  const pgbreak = options.long
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
  ${pgbreak ? newpage : "\\vskip 48pt"}
}

\\renewcommand\\part[1] {
  \\if@titlepage${newpage}\\fi
  \\null\\vskip 2cm
  \\begin{center}{\\Huge #1}\\end{center}
}


\\newcommand\\innertitle{{\\center{\\Large\\@title\\vskip 48pt}}}

\\newcommand{\\RNum}[1]{\\uppercase\\expandafter{\\romannumeral #1\\relax}}

\\newcommand{\\chNumber}[1]{
}

\\renewcommand\\chapter[2]{
  ${pgbreak ? newpage : "\\vskip 36pt"}
  \\begin{center}
    \\if@titlepage
      \\ifthenelse{\\equal{#1}{}}{}{\\RNum{#1}\\vskip 12pt}
      \\ifthenelse{\\equal{#2}{}}{}{\\textbf{#2}}
    \\else
      \\ifthenelse{\\equal{#1}{}}{}{\\textbf{#1. }}
      \\ifthenelse{\\equal{#2}{}}{}{\\textbf{#2}}
    \\fi
  \\end{center}
  ${pgbreak ? "\\vskip 48pt" : "\\vskip 18pt"}
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

\\author{${escape(author) ?? ""}}
\\title{${escape(title) ?? ""}}
\\subtitle{${escape(subtitle) ?? ""}}
`
}

//*****************************************************************************
//
// One-sided file
//
//*****************************************************************************

function formatFile1(head, content, options) {
  const sides = "oneside"
  const titlepage = options.long ? "titlepage" : "notitlepage"
  const frontmatter = options.long ? "\\frontmatter\\pagestyle{empty}" : "\\pagestyle{plain}"
  const mainmatter  = options.long ? "\\mainmatter\\pagestyle{plain}" : ""
  // const mainmatter = options.pgbreak ? "\\mainmatter" : ""
  const backmatter  = options.long ? "\\backmatter\\pagestyle{empty}" : ""

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
\\IfFileExists{./backcover.tex}{\\include{backcover.tex}}{\\null}
\\end{document}
`
}

//*****************************************************************************
//
// Two-sided file
//
//*****************************************************************************

function formatFile2(head, content, options) {
  const sides = "twoside"
  //const titlepage = options.pgbreak ? "titlepage" : "notitlepage"
  //const frontmatter = options.pgbreak ? "\\frontmatter\\pagestyle{empty}" : ""
  //const mainmatter  = options.pgbreak ? "\\mainmatter\\pagestyle{plain}" : ""
  //const backmatter  = options.pgbreak ? "\\backmatter\\pagestyle{empty}" : ""

  const pgbreak = options.long
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
${pgbreak ? "" : "\\innertitle"}

${content}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

${backmatter}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\backcover
\\IfFileExists{./backcover.tex}{\\include{backcover.tex}}{\\null}
\\end{document}
`
}

//*****************************************************************************
//
// Misc text utils
//
//*****************************************************************************

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
  )
}

//-----------------------------------------------------------------------------

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
