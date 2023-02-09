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

//-----------------------------------------------------------------------------

export function Export({id}) {

  const [doc, setDoc] = useState(undefined)

  useEffect(() => {
    console.log("SingleEdit: Updating doc...")
    if(id) docLoad(id)
      .then(content => setDoc(content))
  }, [id])

  if(!doc) return <Loading/>

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

  return <VBox>
    <Label>Filename: {basename}</Label>
  </VBox>
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
      dangerouslySetInnerHTML={{__html: FormatBody(formatHTML, settings, body)}}
      />
  </div>
}

/*
function toHTML(settings, doc) {
  return FormatBody(formatHTML, settings, doc)
  //return `<div>${Head2HTML(head)}${Parts2HTML(parts)}</div>`
}
*/

//-----------------------------------------------------------------------------
// Formatting engine
//-----------------------------------------------------------------------------

const formatHTML = {
  // Paragraphs
  "p": (settings, p) => `<p>${elemAsText(p)}</p>\n`,
  "br": (settings, p) => "<br/>\n",
  "comment": (settings, p) => "",
  "synopsis": (settings, p) => "",
  "missing": (settings, p) => `<p class="missing">${elemAsText(p)}</p>\n`,

  // Scene
  "scene": (settings, scene, paragraphs) => {
    return paragraphs.join("\n")
  },

  // Part
  "part": (settings, part, scenes) => {
    return scenes.join("\n")
  },

  // Body
  "body": (settings, head, parts) => {
    return parts.join("\n")
  }
}

function FormatBody(format, settings, body) {
  //const {head, parts} = doc.story.body;
  const head  = FormatHead(format, settings, body.head)
  const parts = body.parts.map(part => FormatPart(format, settings, part))

  return format["body"](settings, head, parts)
}

function FormatHead(format, settings, head) {
  return "";
}

function FormatPart(format, settings, part) {
  const content = part.children.map(scene => FormatScene(format, settings, scene))
  return format["part"](settings, part, content);
}

function FormatScene(format, settings, scene) {
  const content = scene.children.map(p => FormatParagraph(format, settings, p))
  return format["scene"](settings, scene, content)
}

function FormatParagraph(format, settings, p) {
  if(!(p.type in format)) return ""

  return format[p.type](settings, p)
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
