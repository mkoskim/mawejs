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
import {SectionWordInfo} from "../common/components";

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs");

//-----------------------------------------------------------------------------

export function Export({doc, setDoc, focusTo, setFocusTo}) {
  const settings = {
    part: {
      separator: "* * *",
    },
    scene: {
      //separator: "* * *",
    },
    setFocusTo,
  }

  const previewprops = {
    settings,
    doc,
  }

  return <VBox style={{overflow: "auto"}}>
    <ExportToolbar {...previewprops}/>
    <HBox style={{overflow: "auto"}}>
      <ExportIndex style={{width: "300px"}} {...previewprops}/>
      <Preview {...previewprops}/>
      <ExportSettings {...previewprops}/>
    </HBox>
  </VBox>
}

//-----------------------------------------------------------------------------
// Export toolbar
//-----------------------------------------------------------------------------

function ExportToolbar({settings, doc}) {
  const {body} = doc.story
  const {head, parts} = body

  return <ToolBox style={{background: "white"}}>
    <Button onClick={exportRTF}>Export</Button>
    <Separator/>
    RTF
    <Separator/>
    <SectionWordInfo sectWithWords={body}/>
    <Separator/>
    <Filler/>
  </ToolBox>

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
// Export settings
//-----------------------------------------------------------------------------

function ExportSettings({style, settings, doc}) {
  const {basename} = doc;
  const {body} = doc.story
  const {head, parts} = body

  return <VBox style={{...style, background: "white", padding: "8px"}}>
    <Label>Filename: {basename}</Label>
    <Separator/>
    <Input label="Title" value={head.title}/>
    <Input label="Subtitle" value={head.subtitle}/>
    <Input label="Author" value={head.author}/>
    <Separator/>
  </VBox>

}

//-----------------------------------------------------------------------------
// Export index
//-----------------------------------------------------------------------------

function ExportIndex({style, settings, doc}) {
  const {body} = doc.story
  const {parts} = body

  return <VFiller className="TOC" style={style}>
    {parts.map(part => <PartItem key={part.id} part={part}/>)}
  </VFiller>

  function PartItem({part}) {
    const {id, name, children} = part
    return <>
      <div
        className="Entry PartName"
        onClick={ev => window.location.href=`#${id}`}
        onDoubleClick={ev => settings.setFocusTo({id})}
        style={{cursor: "pointer"}}
        >
        <span className="Name">{name}</span>
        </div>
      {children.map(scene => <SceneItem key={scene.id} scene={scene}/>)}
    </>
  }

  function SceneItem({scene}) {
    const {id, name} = scene
    return <div
      className="Entry SceneName"
      onClick={ev => window.location.href=`#${id}`}
      onDoubleClick={ev => settings.setFocusTo({id})}
      style={{cursor: "pointer"}}
      >
      <span className="Name">{name}</span>
      </div>
  }
}

//-----------------------------------------------------------------------------
// Export preview
//-----------------------------------------------------------------------------

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
    const sep = separator ? formatHTML["sep.scene"](separator) : "<br/>\n"
    return `<div id="${part.id}"/>` + scenes.join(sep)
  },

  // Scene & breaks
  "scene": (settings, scene, splits) => {
    return `<div id="${scene.id}"/>` + splits.join("<br/>\n")
  },
  "split": (settings, paragraphs) => paragraphs.join("\n"),

  // Paragraph styles
  "synopsis": (settings, p) => "",
  "comment": (settings, p) => "",
  "missing": (settings, p) => `<p id="${p.id}" style="color: rgb(180, 20, 20);">${formatHTML.escape(elemAsText(p))}</p>`,
  "p": (settings, p) => `<p id="${p.id}">${formatHTML.escape(elemAsText(p))}</p>`,

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

      // If you have copy-pasted text, you may have these
      .replaceAll('“', "\\'94")
      .replaceAll('”', "\\'94")
      .replaceAll('…', "...")
    )
  },
}