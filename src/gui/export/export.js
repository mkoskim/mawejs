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

import {docLoad, docSave, docUpdate} from "../editor/doc"
import {elemAsText} from "../../document"
import { splitByTrailingElem } from "../../util";

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs");

//-----------------------------------------------------------------------------

export function Export({id, doc}) {
  return <VFiller>
    <ExportView id={id} doc={doc}/>
    </VFiller>
}

//-----------------------------------------------------------------------------

function ExportView({id, doc}) {
  const settings = {

  }

  const previewprops = {
    settings,
    doc,
  }

  return <HFiller>
    <Settings {...{settings, doc}}/>
    <Preview {...previewprops}/>
  </HFiller>
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
    const filename = await fs.makepath(dirname, doc.basename + ".rtf")
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
      className="Sheet Regular"
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
      .map(s => s.slice(0, -1))
      .filter(s => s.length)
    //console.log(splits)

    return format["scene"](
      settings,
      scene,
      splits.map(FormatSplit).filter(s => s && s.length)
    )
  }

  function FormatSplit(split) {
    const content = split.map(FormatParagraph).filter(p => p)
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
    return content
  },

  // Body
  "body": (settings, head, parts) => {
    return head + parts.join("\n")
  },

  //---------------------------------------------------------------------------

  "title": (settings, title) => `<h1>${title}</h1>\n`,

  //---------------------------------------------------------------------------

  // Part
  "part": (settings, part, scenes) => {
    return scenes.join("<center>* * *</center>")
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
{\\info{\\title ${head.title}}{\\author ${head.author}}}
\\paperh16837\\paperw11905
\\margl1701\\margr1701\\margt851\\margb1701
\\sectd\\sbknone
\\pgwsxn11905\\pghsxn16837
\\marglsxn1701\\margrsxn1701\\margtsxn1701\\margbsxn1701
\\gutter0\\ltrsect
\\deflang${langcode}
{\\lang${langcode}\\sl-440
{\\header\\tqr\\tx8496 ${headinfo}\\tab ${pgnum} / ${pgtot}\\par}
${content}
}}\n`
  },

  //\\headery851\\f0\\fs24\\fi0\\li0\\ri0\\rin0\\lin0

  //---------------------------------------------------------------------------
  // Body
  "body": (settings, head, parts) => {
    return head + parts.join("{\\sb480\\fs34\\qc * * *\\par}\n")
  },

  "title": (settings, title) => `{\\qc\\sa480\\b\\fs34 ${title}\\par}\n`,

  //---------------------------------------------------------------------------

  // Part
  "part": (settings, part, scenes) => {
    return scenes.filter(s => s.length).join("{\\sb480\\fs34\\qc * * *\\par}\n")
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
    return (text
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