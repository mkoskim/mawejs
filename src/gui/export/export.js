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
    body: doc.story.body,
  }

  return <Preview {...previewprops}/>
}

//-----------------------------------------------------------------------------
// Preview rendering
//-----------------------------------------------------------------------------

function Preview({settings, body}) {
  const titleprops = { settings, head: body.head}
  const partsprops = { settings, parts: body.parts }

  return <div className="Board">
    <div className="Sheet Regular">
      <RenderTitle {...titleprops}/>
      <RenderParts {...partsprops}/>
    </div>
  </div>
}

function RenderTitle({settings, head}) {
  const {title} = head;
  return null;
}

function RenderParts({settings, parts}) {
  return parts.map(part => <RenderPart key={part.id} {...{settings, part}}/>)
}

function RenderPart({settings, part}) {
  return part.children.map(scene => <RenderScene key={scene.id} {...{settings, scene}}/>)
}

function RenderScene({settings, scene}) {
  return scene.children.map(p => <RenderParagraph key={p.id} {...{settings, p}}/>)
}

function RenderParagraph({settings, p}) {
  //console.log(p)

  switch(p.type) {
    case "comment":   return null;
    case "synopsis":  return null;
    case "missing":   return <p className="missing">{elemAsText(p)}</p>
    case "p":         return <p>{elemAsText(p)}</p>
    case "br":        return <br/>
    default: break;
  }
  return null;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
