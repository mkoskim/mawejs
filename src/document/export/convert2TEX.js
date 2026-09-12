//*****************************************************************************
//
// LaTeX formatting table
//
//*****************************************************************************

import { lines2text } from "../../util";
import { mawe } from "../index.js";
import { getLangTEX } from "../lang.js";
import {textEscape, textLinify} from "./util.js";

export function getTEXConverter(options={}) {
  return {...file(options), ...formatter};
}

const formatter = {

  //---------------------------------------------------------------------------
  // Header styles
  //---------------------------------------------------------------------------

  act(node) { return makeHeader(node); },
  chapter(node) { return makeHeader(node); },
  scene(node) { return makeHeader(node); },
  br(node) { return makeHeader(node); },

  //---------------------------------------------------------------------------
  // Paragraph styles
  //---------------------------------------------------------------------------

  p({first, text}) {return `${first ? "\\noindent " : ""}${text}\n`; },
  missing({first, text}) { return `{${first ? "\\noindent" : ""}\\color{red}${text}}\n`; },
  quote({text}) { return (text ? `{${text}\\par}` : "\\par\\null") + "\n"; },

  bookmark() { return; },
  comment() { return; },
  tags() { return; },

  //---------------------------------------------------------------------------
  // Character styles
  //---------------------------------------------------------------------------

  text({text, bold, italic}) {
    text = escape(text)
    if(bold) text = this.bold(text)
    if(italic) text = this.italic(text)
    return text
  },
  bold(text) { return `\\textbf{${text}}`; },
  italic(text) { return `\\textit{${text}}`; },
}

//-----------------------------------------------------------------------------

function makeHeader({type, header = "none", prefix, first, number, pgbr, text}) {

  switch(header) {
    case "none": return;
    case "break": return first ? undefined : "\\null\n"
    case "separated": return first ? undefined : `\\separator{${escape("* * *")}}\n`;
    default: break;
  }

  let numbering, name

  if(number) switch(header) {
    default:
    case "named": {
      numbering = "";
      name = text ?? ""
      break;
    }
    case "numbered": {
      numbering = `${prefix ? (escape(prefix) + " ") : ""}${number}`
      name = ""
      break;
    }
    case "numbered&named": {
      numbering = `${prefix ? (escape(prefix) + " ") : ""}${number}.`
      name = text ?? ""
      break;
    }
  } else {
    numbering = ""
    name = text ?? ""
  }

  switch(type) {
    case "act": return `\\act{${numbering}}{${name}}\n`
    case "chapter": return `\\chapt{${numbering}}{${name}}\n`
    case "scene": return `\\scene{${numbering}}{${name}}\n`
  }
}

//-----------------------------------------------------------------------------

const escapes = {
  '\\': "{\\textbackslash}",
  '&': "\\&",
  '%': "\\%",
  '$': "\\$",
  '#': "\\#",
  '_': "\\_",
  '{': "\\{",
  '}': "\\}",
  '~': "{\\textasciitilde}",
  '^': "{\\textasciicircum}",
  '"': "''",
  '<': "{\\textless}",
  '>': "{\\textgreater}",
  '|': "{\\textbar}",
}

function escape(text) {
  // Replace source characters once so generated commands are not escaped.
  // Unicode text remains unchanged for UTF-8 output (modern LaTeX's default).
  return textEscape(text, escapes)
}

//*****************************************************************************
//
// File header, footer and postprocessing
//
//*****************************************************************************

function file(options) {
  return {
    suffix: ".tex",
    header(head, settings) { return lines2text([
      paper(options),
      language(head),
      "\\usepackage[utf8]{inputenc}",
      "\\usepackage{times}",
      "\\usepackage[T1]{fontenc}",
      //"\\frenchspacing",
      //"\\sloppy",
      commands(settings, options),
      //headinfo(head),
      temporarySettings(),
      "\\begin{document}",
      "\\pagestyle{empty}",
      title(head, settings, options),
      "\\pagestyle{plain}",
    ])},
    footer(settings) { return lines2text([
      backcover(settings, options),
      "\\end{document}"
    ])},
    postprocess(text) {
      return text
        .split("\n")
        .map(line => textLinify(line, {width: 80}))
        .join("\n")
    }
  }
}

//-----------------------------------------------------------------------------

function language({lang}) {
  const langcode = getLangTEX(lang)
  return langcode ? `\\usepackage[${langcode}]{babel}` : undefined
}

//-----------------------------------------------------------------------------

function title(head, settings, options) {
  const {sides = "single"} = options
  const {type = "short"} = settings
  const pgbr = (sides === "single") ? "\\newpage" : "\\cleartooddpage"
  const {author, title, subtitle} = mawe.info(head)

  return lines2text([
    //author ? `\\author{${escape(author)}}` : undefined,
    //title ? `\\title{${escape(title)}}` : undefined,
    //subtitle ? `\\subtitle{${escape(subtitle)}}` : undefined,
    (type === "long") ? `\\null\\vskip1in` : undefined,
    "\\begin{center}",
    author ? `${escape(author)}\\par\\vskip12pt` : undefined,
    title ? `\\LARGE\\textbf{${escape(title)}}\\par\\vskip12pt` : undefined,
    subtitle ? `\\large\\textbf{${escape(subtitle)}}\\par` : undefined,
    "\\end{center}\\vskip0.5in",
    (type === "long") ? `${pgbr}` : undefined,
  ])
}

//-----------------------------------------------------------------------------

function commands(settings, options) {
  return lines2text([
    "\\usepackage{xcolor}",
    "\\usepackage{nextpage}",
    "\\usepackage{ifthen}",
    "\\usepackage{xfp}",
    "\\makeatletter",
    "\\newcommand\\abspagenumber{\\inteval{\\ReadonlyShipoutCounter+1}}",
    "\\newcommand{\\doifmultipleof}[2]{%",
      "\\ifnum\\numexpr((#2)/(#1))*(#1)-(#2)=0",
        "\\expandafter\\@firstoftwo",
      "\\else",
        "\\expandafter\\@secondoftwo",
      "\\fi}",
    "\\makeatother",
    headerCommands(settings, options),
  ])
}

//-----------------------------------------------------------------------------

function headerCommands(settings, options) {
  const {sides = "single"} = options
  const {type = "short"} = settings
  const pgbr = (sides === "single") ? "\\newpage" : "\\cleartooddpage"

  return lines2text([
    //-------------------------------------------------------------------------
    "\\newcommand{\\separator}[1]{",
      "\\vskip 24pt",
      "\\begin{center}#1\\end{center}",
    "}",

    //-------------------------------------------------------------------------
    "\\newcommand{\\header}[2]{",
      "\\ifthenelse{\\equal{#1}{}}{}{#1}",
      "\\ifthenelse{\\equal{#2}{}}{}{#2}",
    "}",

    //-------------------------------------------------------------------------
    "\\newcommand{\\act}[2]{",
      (type === "long") ? `${pgbr}\\null\\vskip1in` : undefined,
      "\\begin{center}",
        "\\LARGE\\textbf{\\header{#1}{#2}}",
      "\\end{center}",
    "}",

    //-------------------------------------------------------------------------
    "\\newcommand{\\chapt}[2]{",
      (type === "long") ? `${pgbr}` : undefined,
      "\\begin{center}",
        "\\Large\\textbf{\\header{#1}{#2}}",
      "\\end{center}",
    "}",

    //-------------------------------------------------------------------------
    "\\newcommand{\\scene}[2]{",
      "\\vskip12pt",
      "\\noindent\\textbf{\\header{#1}{#2}}",
    "}",
  ])
}

//-----------------------------------------------------------------------------

function backcover(settings, options) {
  const {sides = "single"} = options
  const {type = "short"} = settings

  let pgbr
  switch(type + "." + sides) {
    default:
    case "short.single":
    case "short.double":
      pgbr = undefined;
      break;
    case "long.single":
      pgbr = "\\newpage\\pagestyle{empty}";
      break;
    case "long.double":
      pgbr = lines2text([
        "\\newpage\\pagestyle{empty}",
        "\\cleartoevenpage",
        "\\doifmultipleof{4}{\\abspagenumber}{}{\\null\\cleartoevenpage}",
      ])
      break;
  }

  return lines2text([
    pgbr,
    "\\IfFileExists{./backcover.tex}{\\include{backcover.tex}}{\\null}",
  ])
}

//-----------------------------------------------------------------------------

function paper(options) {
  const {size = "a4", sides = "single"} = options

  switch(size + sides) {
    default:
    case "a4single": return lines2text([
      `\\documentclass[oneside, 12pt]{book}`,
      `\\usepackage[a4paper, top=1in, left=1in, right=1in]{geometry}`,
      "\\usepackage{setspace}",
      "\\setstretch{1.5}",
    ])
    case "a4double": return lines2text([
      `\\documentclass[twoside, 12pt]{book}`,
      `\\usepackage[a4paper, top=1in, left=1in, right=1in]{geometry}`,
      "\\usepackage{setspace}",
      "\\setstretch{1.5}",
    ])
    case "a5single": return lines2text([
      `\\documentclass[oneside, 12pt]{book}`,
      `\\usepackage[a5paper, top=0.5in, left=1in, right=1in]{geometry}`,
      "\\usepackage{setspace}",
      "\\setstretch{1.25}",
    ])
    case "a5double": return lines2text([
      `\\documentclass[twoside, 12pt]{book}`,
      `\\usepackage[a5paper, top=0.5in, inner=1.25in, outer=0.5in]{geometry}`,
      "\\usepackage{setspace}",
      "\\setstretch{1.25}",
    ])
  }
}

//-----------------------------------------------------------------------------

function temporarySettings() {
  return [
    "\\DeclareUnicodeCharacter{1F525}{}",
  ].join("\n")
}