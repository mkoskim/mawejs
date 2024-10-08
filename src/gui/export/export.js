// ****************************************************************************
//
// Document exporting
//
// ****************************************************************************

import "./styles/export.css"
import "../common/styles/sheet.css"

import React, {
  useMemo, useCallback,
  useDeferredValue,
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

import { elemName, getSuffix, nanoid, filterCtrlElems } from "../../document/util";
import {
  EditHead, SectionWordInfo,
  updateDocStoryType, updateDocChapterElem, updateDocChapterType,
} from "../common/components";

import { storyType } from "../../document/head"

import { FormatBody } from "./formatDoc"

import { formatRTF } from "./formatRTF";
import { formatHTML } from "./formatHTML"
import { formatMD, formatTXT } from "./formatTXT"
import { formatTEX1, formatTEX2 } from "./formatTEX"
import { setFocusTo } from "../editor/editor";

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs");

// ****************************************************************************
//
// Export settings
//
// ****************************************************************************

const formatters = {
  "rtf1": formatRTF,
  "rtf2": formatRTF,
  "tex1": formatTEX1,
  "tex2": formatTEX2,
  "md": formatMD,
  "txt": formatTXT,
}

export function loadExportSettings(settings) {
  // TODO: Check here that values are valid

  return {
    format: "rtf1",
    type: "short",
    chapterelem: "part",
    chaptertype: "separated",
    ...(settings?.attributes ?? {})
  }
}

export function saveExportSettings(settings) {
  const {type, chapterelem, chaptertype} = settings
  return {type: "export", attributes: {
    type,
    chapterelem,
    chaptertype,
  }}
}

// ****************************************************************************
//
// Export view
//
// ****************************************************************************

export function Export({ doc, updateDoc }) {

  const format = doc.exports.format
  const setFormat = useCallback(value => updateDoc(doc => { doc.exports.format = value}), [])

  return <HBox style={{ overflow: "auto" }}>
    <ExportIndex style={{ maxWidth: "300px", width: "300px" }} doc={doc} updateDoc={updateDoc}/>
    <Preview doc={doc}/>
    <ExportSettings doc={doc} updateDoc={updateDoc} format={format} setFormat={setFormat}/>
  </HBox>
}

//-----------------------------------------------------------------------------
// Export settings
//-----------------------------------------------------------------------------

function ExportSettings({ style, doc, updateDoc, format, setFormat }) {

  const formatter = formatters[format]

  const { head, exports } = doc

  return <VBox style={style} className="ExportSettings">
    <TextField select label="Format" value={format} onChange={e => setFormat(e.target.value)}>
      <ListSubheader>RTF</ListSubheader>
      <MenuItem value="rtf1">RTF, A4, 1-side</MenuItem>
      <MenuItem value="rtf2">RTF, A4, 2-side</MenuItem>
      <ListSubheader>LaTeX</ListSubheader>
      <MenuItem value="tex1">LaTeX, A5, 1-side</MenuItem>
      <MenuItem value="tex2">LaTeX, A5 booklet</MenuItem>
      <ListSubheader>Other</ListSubheader>
      <MenuItem value="md">MD (Mark Down)</MenuItem>
      {/* <MenuItem value="txt">Text (wrapped)</MenuItem> */}
      </TextField>

    <Button variant="contained" color="success" onClick={e => doExport(e)}>Export</Button>

    <Accordion disableGutters>
    <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Story type: {storyType(doc)}</AccordionSummary>
    <AccordionDetails><VBox>
    <TextField select label="Story Class" value={exports.type} onChange={e => updateDocStoryType(updateDoc, e.target.value)}>
      <MenuItem value="short">Short Story</MenuItem>
      <MenuItem value="long">Long Story</MenuItem>
      </TextField>
    <TextField select label="Chapters" value={exports.chapterelem} onChange={e => updateDocChapterElem(updateDoc, e.target.value)}>
      <MenuItem value="part">Part</MenuItem>
      <MenuItem value="scene">Scene</MenuItem>
      <MenuItem value="none">None</MenuItem>
      </TextField>
    <TextField select label="Chapter style" value={exports.chaptertype} onChange={e => updateDocChapterType(updateDoc, e.target.value)}>
      <MenuItem value="separated">Separated</MenuItem>
      <MenuItem value="numbered">Numbered</MenuItem>
      <MenuItem value="named">Named</MenuItem>
      </TextField>
    </VBox></AccordionDetails>
    </Accordion>

    <EditHead head={head} updateDoc={updateDoc}/>
  </VBox>

  function doExport(event) {
    const content = FormatBody(formatter, doc)
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

function ExportIndex({ style, doc, updateDoc }) {
  const { parts } = doc.body

  return <VFiller className="TOC" style={style}>
    {filterCtrlElems(parts).map(part => <PartItem key={part.id} part={part} doc={doc} updateDoc={updateDoc}/>)}
  </VFiller>
}

function PartItem({ part, doc, updateDoc }) {
  const { id, children } = part
  const name = elemName(part)
  return <>
    <div
      className="Entry PartName"
      onClick={ev => window.location.href = `#${id}`}
      onDoubleClick={ev => setFocusTo(updateDoc, "body", id)}
      style={{ cursor: "pointer" }}
    >
      <span className="Name">{name}</span>
    </div>
    {filterCtrlElems(children).map(scene => <SceneItem key={scene.id} scene={scene} doc={doc} updateDoc={updateDoc}/>)}
  </>
}

function SceneItem({ scene, doc, updateDoc }) {
  const { id } = scene
  const name = elemName(scene)
  return <div
    className="Entry SceneName"
    onClick={ev => window.location.href = `#${id}`}
    onDoubleClick={ev => setFocusTo(updateDoc, "body", id)}
    style={{ cursor: "pointer" }}
  >
    <span className="Name">{name}</span>
  </div>
}

//-----------------------------------------------------------------------------
// Export preview
//-----------------------------------------------------------------------------

function Preview({ doc }) {
  return <div className="Filler Board">
    <DeferredRender><div
      className="Sheet Regular"
      dangerouslySetInnerHTML={{ __html: FormatBody(formatHTML, doc) }}
    /></DeferredRender>
  </div>
}
