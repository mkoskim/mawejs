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

import { formatRTF } from "./exportRTF";
import { formatHTML } from "./exportHTML"
import { formatTXT } from "./exportTXT"
import { formatTEX } from "./exportTEX"

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
    Export:
    <Button onClick={exportRTF}>RTF</Button>
    <Button onClick={exportTEX}>TEX</Button>
    <Button onClick={exportTXT}>TXT</Button>
    <Separator/>
    <SectionWordInfo section={body}/>
    <Separator/>
    <Filler/>
  </ToolBox>

  function exportRTF(event) {
    const content = FormatFile(formatRTF, settings, body)
    //console.log(content)
    exportToFile(doc, ".rtf", content)
  }

  function exportTXT(event) {
    const content = FormatFile(formatTXT, settings, body)
    //console.log(content)
    exportToFile(doc, ".txt", content)
  }

  function exportTEX(event) {
    const content = FormatFile(formatTEX, settings, body)
    //console.log(content)
    exportToFile(doc, ".tex", content)
  }
}

async function exportToFile(doc, filesuffix, content) {
  const dirname  = await fs.dirname(doc.file.id)
  const name = await fs.basename(doc.file.id)
  const suffix = getSuffix(name, [".mawe", ".mawe.gz"]);
  const basename = await fs.basename(name, suffix);
  const filename = await fs.makepath(dirname, basename + filesuffix)
  console.log("Export to:", filename)
  fs.write(filename, content)
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
    const content = parts.map(FormatPart).filter(p => p)

    return format["body"](
      settings,
      FormatHead(head),
      content
    )
  }

  function FormatHead(head) {
    return format["title"](settings, head.title);
  }

  function FormatPart(part) {
    const scenes = part.children.map(FormatScene).filter(s => s)

    if(!scenes.length) return null

    return format["part"](
      settings,
      part,
      scenes
    );
  }

  function FormatScene(scene) {
    const splits = splitByTrailingElem(scene.children, p => p.type === "br")
      .map(s => s.filter(p => p.type !== "br"))
      .filter(s => s.length)
    //console.log(splits)

    if(!splits.length) return null

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
