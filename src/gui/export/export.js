// ****************************************************************************
//
// Document exporting
//
// ****************************************************************************

import "./styles/export.css"
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
  Radio,
  Input,
  SearchBox,
  Label,
  List, ListItem, ListItemText, ListSubheader,
  Grid,
  Separator, Loading, addClass,
  TextField, SelectFrom,
  MenuItem,
  Accordion, AccordionSummary, AccordionDetails,
  DeferredRender,
  Inform,
} from "../common/factory";

import { getSuffix, nanoid } from "../../document/util";
import {
  EditHead, SectionWordInfo,
  setDocStoryType, setDocChapterElem, setDocChapterType,
} from "../common/components";

import { mawe } from "../../document"

import { FormatBody } from "./formatDoc"

import { formatRTF } from "./formatRTF";
import { formatHTML } from "./formatHTML"
import { formatTXT } from "./formatTXT"
import { formatTEX1, formatTEX2 } from "./formatTEX"

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs");

//-----------------------------------------------------------------------------

export function Export({ doc, setDoc, focusTo, setFocusTo }) {

  const [format, setFormat] = useState("rtf1")

  return <VBox style={{ overflow: "auto" }}>
    {/* <ExportToolbar {...previewprops}/> */}
    <HBox style={{ overflow: "auto" }}>
      {/* <ExportSettings {...previewprops}/> */}
      <ExportIndex style={{ maxWidth: "300px", width: "300px" }} doc={doc} setFocusTo={setFocusTo}/>
      <Preview doc={doc}/>
      <ExportSettings doc={doc} setDoc={setDoc} format={format} setFormat={setFormat}/>
    </HBox>
  </VBox>
}

//-----------------------------------------------------------------------------
// Export settings
//-----------------------------------------------------------------------------

function ExportSettings({ style, doc, setDoc, format, setFormat }) {

  const formatter = {
    "rtf1": formatRTF,
    "rtf2": formatRTF,
    "tex1": formatTEX1,
    "tex2": formatTEX2,
    "txt": formatTXT,
  }[format]

  const { body } = doc.story
  const { head } = body
  const info = mawe.info(body.head)

  return <VBox style={style} className="ExportSettings">
    <TextField select label="Format" value={format} onChange={e => setFormat(e.target.value)}>
      <ListSubheader>RTF</ListSubheader>
      <MenuItem value="rtf1">RTF, A4, 1-side</MenuItem>
      <MenuItem value="rtf2">RTF, A4, 2-side</MenuItem>
      <ListSubheader>LaTeX</ListSubheader>
      <MenuItem value="tex1">LaTeX, A5, 1-side</MenuItem>
      <MenuItem value="tex2">LaTeX, A5 booklet</MenuItem>
      <ListSubheader>Other</ListSubheader>
      <MenuItem value="txt">ASCII Text</MenuItem>
      </TextField>

    <Button variant="contained" color="success" onClick={e => doExport(e)}>Export</Button>

    <Accordion disableGutters>
    <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Story type: {info.type}</AccordionSummary>
    <AccordionDetails><VBox>
    <TextField select label="Story Class" value={head.export.type} onChange={e => setDocStoryType(setDoc, e.target.value)}>
      <MenuItem value="short">Short Story</MenuItem>
      <MenuItem value="long">Long Story</MenuItem>
      </TextField>
    <TextField select label="Chapters" value={head.export.chapterelem} onChange={e => setDocChapterElem(setDoc, e.target.value)}>
      <MenuItem value="part">Part</MenuItem>
      <MenuItem value="scene">Scene</MenuItem>
      <MenuItem value="none">None</MenuItem>
      </TextField>
    <TextField select label="Chapter style" value={head.export.chaptertype} onChange={e => setDocChapterType(setDoc, e.target.value)}>
      <MenuItem value="separated">Separated</MenuItem>
      <MenuItem value="numbered">Numbered</MenuItem>
      <MenuItem value="named">Named</MenuItem>
      </TextField>
    </VBox></AccordionDetails>
    </Accordion>

    <EditHead head={head} setDoc={setDoc}/>
  </VBox>

  function doExport(event) {
    const content = FormatBody(formatter, body)
    //console.log(content)
    exportToFile(doc, formatter.suffix, content)
  }
}

async function exportToFile(doc, filesuffix, content) {
  const dirname = await fs.dirname(doc.file.id)
  const name = await fs.basename(doc.file.id)
  const suffix = getSuffix(name, [".mawe", ".mawe.gz"]);
  const basename = await fs.basename(name, suffix);
  const filename = await fs.makepath(dirname, basename + filesuffix)
  console.log("Export to:", filename)
  fs.write(filename, content)
  .then(file => Inform.success(`Exported: ${file.name}`))
  .catch(err => Inform.error(err))
}

//-----------------------------------------------------------------------------
// Export index
//-----------------------------------------------------------------------------

function ExportIndex({ style, doc, setFocusTo }) {
  const { body } = doc.story
  const { parts } = body

  return <VFiller className="TOC" style={style}>
    {parts.map(part => <PartItem key={part.id} part={part} setFocusTo={setFocusTo}/>)}
  </VFiller>
}

function PartItem({ part, setFocusTo }) {
  const { id, name, children } = part
  return <>
    <div
      className="Entry PartName"
      onClick={ev => window.location.href = `#${id}`}
      onDoubleClick={ev => setFocusTo({ id })}
      style={{ cursor: "pointer" }}
    >
      <span className="Name">{name}</span>
    </div>
    {children.map(scene => <SceneItem key={scene.id} scene={scene} setFocusTo={setFocusTo}/>)}
  </>
}

function SceneItem({ scene, setFocusTo }) {
  const { id, name } = scene
  return <div
    className="Entry SceneName"
    onClick={ev => window.location.href = `#${id}`}
    onDoubleClick={ev => setFocusTo({ id })}
    style={{ cursor: "pointer" }}
  >
    <span className="Name">{name}</span>
  </div>
}

//-----------------------------------------------------------------------------
// Export preview
//-----------------------------------------------------------------------------

function Preview({ doc }) {
  const { body } = doc.story

  return <div className="Filler Board">
    <DeferredRender><div
      className="Sheet Regular"
      dangerouslySetInnerHTML={{ __html: FormatBody(formatHTML, body) }}
    /></DeferredRender>
  </div>
}
