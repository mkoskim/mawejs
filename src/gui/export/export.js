// ****************************************************************************
//
// Document exporting
//
// ****************************************************************************

import "../common/styles/sheet.css"

import React, {
  useState, useEffect, useReducer,
  useMemo, useCallback,
  useDeferredValue,
  StrictMode,
} from 'react';

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
} from "../common/factory";

import {elemAsText} from "../../document"
import { getSuffix } from "../../document/util";
import { splitByTrailingElem } from "../../util";

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs");

//-----------------------------------------------------------------------------

export function Export({doc, setDoc}) {
  const settings = {
    part: {
      separator: "* * *",
    },
    scene: {
      separator: "* * *",
    },
  }

  const previewprops = {
    settings,
    doc,
  }

  return <HBox style={{overflow: "auto"}}>
    <Settings {...previewprops}/>
    <Preview {...previewprops}/>
  </HBox>
}

//-----------------------------------------------------------------------------
// Export settings
//-----------------------------------------------------------------------------

function Settings({settings, doc}) {
  const {basename} = doc;
  const {body} = doc.story
  const {head, parts} = body

  return <VBox style={{background: "white", padding: "8px", borderRight: "2px solid lightgray"}}>
    <Label>Filename: {basename}</Label>
    <Button onClick={exportRTF}>Export</Button>
    <Separator/>
    <Input label="Title" value={head.title}/>
    <Input label="Subtitle" value={head.subtitle}/>
    <Input label="Author" value={head.author}/>
    <Separator/>
  </VBox>

  async function exportRTF(event) {
    console.log("Exporting...")

    const content = FormatFile(formatRTF, settings, body)
    //console.log(content)

    const dirname  = await fs.dirname(doc.file.id)
    const name = await fs.basename(doc.file.id)
    const suffix = getSuffix(name, [".mawe", ".mawe.gz"]);
    const basename = await fs.basename(name, suffix);
    const filename = await fs.makepath(dirname, basename + ".rtf")
    console.log("Filename:", filename)
    fs.write(filename, content)
  }
}

//-----------------------------------------------------------------------------
// Export preview
//-----------------------------------------------------------------------------

// TODO: Make this use mawe.asHTML / mawe.asRTF functions

function Preview({settings, doc}) {
  //const titleprops = { settings, head: body.head}
  //const partsprops = { settings, parts: body.parts }

  const {body} = doc.story

  return <div className="Filler Board">
    <div
      className="Sheet Real"
      dangerouslySetInnerHTML={{__html: FormatFile(formatHTML, settings, body)}}
      />
  </div>
}

//-----------------------------------------------------------------------------
// Formatting engine
//-----------------------------------------------------------------------------

function FormatFile(format, settings, body) {
  const {head, parts} = body
  return format["file"](
    settings,
    head,
    FormatBody(head, parts)
  )

  function FormatBody(head, parts) {
    return format["body"](
      settings,
      FormatHead(head),
      parts.map(FormatPart)
    )
  }

  function FormatHead(head) {
    return format["title"](settings, head.title);
  }

  function FormatPart(part) {
    return format["part"](
      settings,
      part,
      part.children.map(FormatScene).filter(s => s)
    );
  }

  function FormatScene(scene) {
    const splits = splitByTrailingElem(scene.children, p => p.type === "br")
      .map(s => s.filter(p => p.type !== "br"))
      .filter(s => s.length)
    //console.log(splits)

    return format["scene"](
      settings,
      scene,
      splits.map(FormatSplit).filter(s => s?.length)
    )
  }

  function FormatSplit(split) {
    const content = split.map(FormatParagraph).filter(p => p?.length)
    //console.log(split, "->", content)
    if(!content.length) return
    return format["split"](
      settings,
      content
    )
  }

  function FormatParagraph(p) {
    return format[p.type](settings, p)
  }
}

// ****************************************************************************
//
// HTML formatting table
//
// ****************************************************************************

const formatHTML = {
  // File
  "file": (settings, head, content) => {
    const author = head.nickname || head.author
    const title = head.title ?? ""
    const headinfo = author ? `${author}: ${title}` : title
    return `<div style="margin-bottom: 1cm">${headinfo}</div>\n` + content
  },

  // Body
  "body": (settings, head, parts) => {
    const {separator} = settings.part
    const sep = separator ? formatHTML["sep.part"](separator) : "\n"
    return head + parts.join(sep)
  },

  //---------------------------------------------------------------------------
  "sep.part": (text) => `<center style="margin-top: 1cm; margin-bottom: 1cm">${text}</center>\n`,
  "sep.scene": (text) => `<center style="margin-top: 1cm; margin-bottom: 1cm">${text}</center>\n`,

  //---------------------------------------------------------------------------

  "title": (settings, title) => `<h1>${title}</h1>\n`,

  //---------------------------------------------------------------------------

  // Part
  "part": (settings, part, scenes) => {
    const {separator} = settings.scene
    const sep = separator ? formatHTML["sep.scene"](separator) : "\n"
    return scenes.join(sep)
  },

  // Scene & breaks
  "scene": (settings, scene, splits) => {
    return splits.join("<br/>\n")
  },
  "split": (settings, paragraphs) => paragraphs.join("\n"),

  // Paragraph styles
  "synopsis": (settings, p) => "",
  "comment": (settings, p) => "",
  "missing": (settings, p) => `<p style="color: rgb(180, 20, 20);">${formatHTML.escape(elemAsText(p))}</p>`,
  "p": (settings, p) => `<p>${formatHTML.escape(elemAsText(p))}</p>`,

  //---------------------------------------------------------------------------

  escape: (text) => text
}

// ****************************************************************************
//
// RTF formatting table
//
// ****************************************************************************


const formatRTF = {
  "file": (settings, head, content) => {
    const author = head.nickname || head.author
    const title = head.title ?? ""
    const headinfo = author ? `${author}: ${title}` : title
    const langcode = 1035

    const pgnum = `{\\field{\\*\\fldinst PAGE}}`
    const pgtot = `{\\field{\\*\\fldinst NUMPAGES}}`

    return `{\\rtf1\\ansi
{\\fonttbl\\f0\\froman\\fcharset0 Times New Roman;}
{\\colortbl;\\red0\\green0\\blue0;\\red180\\green20\\blue20;}
{\\info{\\title ${formatRTF.escape(head.title)}}{\\author ${formatRTF.escape(head.author)}}}
\\paperh16837\\paperw11905
\\margl1701\\margr1701\\margt851\\margb1701
\\sectd\\sbknone
\\pgwsxn11905\\pghsxn16837
\\marglsxn1701\\margrsxn1701\\margtsxn1701\\margbsxn1701
\\gutter0\\ltrsect
\\deflang${langcode}
{\\lang${langcode}\\sl-440
{\\header\\tqr\\tx8496 ${formatRTF.escape(headinfo)}\\tab ${pgnum} / ${pgtot}\\par}
${content}
}}\n`
  },

  //\\headery851\\f0\\fs24\\fi0\\li0\\ri0\\rin0\\lin0

  //---------------------------------------------------------------------------
  // Body
  "body": (settings, head, parts) => {
    const {separator} = settings.part
    //const sep = separator ? `{\\sb480\\qc\\fs34 ${separator}\\par}\n` : "\n"
    const sep = separator ? `{\\sb480\\qc ${separator}\\par}\n` : "\n"
    return head + parts.join(sep)
  },

  "title": (settings, title) => `{\\qc\\sa480\\b\\fs34 ${formatRTF.escape(title)}\\par}\n`,

  //---------------------------------------------------------------------------

  // Part
  "part": (settings, part, scenes) => {
    const {separator} = settings.scene
    //const sep = separator ? `{\\sb480\\qc\\fs34 ${separator}\\par}\n` : "\n"
    const sep = separator ? `{\\sb480\\qc ${separator}\\par}\n` : "\n"

    return scenes.filter(s => s.length).join(sep)
  },

  // Scene & breaks
  "scene": (settings, scene, splits) => splits.join(""),
  "split": (settings, split) => "{\\sb480" + split.join("{\\fi567"),

  // Paragraph styles
  "missing": (settings, p) => `\\cf2 ${formatRTF.escape(elemAsText(p))}\\par}\n`,
  "p": (settings, p) => `\\cf1 ${formatRTF.escape(elemAsText(p))}\\par}\n`,
  "synopsis": (settings, p) => undefined,
  "comment": (settings, p) => undefined,

  //---------------------------------------------------------------------------

  escape: text => {
    return (text && text
      .replaceAll('\\', "\\\\")
      .replaceAll('{', "\\{")
      .replaceAll('}', "\\}")

      .replaceAll('~', "\\~")
      .replaceAll('"', "\\'94")

      .replaceAll("å", "\\'e5")
      .replaceAll("Å", "\\'c5")
      .replaceAll("ä", "\\'e4")
      .replaceAll("Ä", "\\'c4")
      .replaceAll("ö", "\\'f6")
      .replaceAll("Ö", "\\'d6")
    )
  },
}