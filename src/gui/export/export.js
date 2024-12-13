// ****************************************************************************
//
// Document exporting
//
// ****************************************************************************

import "./styles/export.css"
import "../common/styles/sheet.css"

import React, {
} from 'react';

import {
  VBox, HBox, VFiller,
  Button,
  ListSubheader,
  Separator,
  TextField,
  MenuItem,
  DeferredRender,
  Inform,
  Label,
} from "../common/factory";

import { elemName, getSuffix } from "../../document/util";

import { flattedFormat, storyToFlatted } from "./formatDoc"

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
    content: "draft",
    type: "short",
    acts: "none",
    chapters: "numbered",
    scenes: "none",
    ...(settings?.attributes ?? {})
  }
}

export function saveExportSettings(settings) {
  const {content, type, acts, chapters, scenes} = settings
  return {type: "export", attributes: {
    content,
    type,
    acts,
    chapters,
    scenes,
  }}
}

// ****************************************************************************
//
// Export view
//
// ****************************************************************************

export function Export({ doc, updateDoc }) {

  const {exports} = doc

  const flatted = storyToFlatted(doc)
  //console.log("Flatted:", flatted)

  return <HBox style={{ overflow: "auto" }}>
    <ExportIndex style={{ maxWidth: "300px", width: "300px", borderRight: "1px solid lightgray" }} flatted={flatted}/>
    <Preview flatted={flatted}/>
    <ExportSettings style={{minWidth: "300px"}} flatted={flatted} exports={exports} updateDoc={updateDoc}/>
  </HBox>
}

//-----------------------------------------------------------------------------
// Export settings
//-----------------------------------------------------------------------------

function updateDocFormat(updateDoc, value) { updateDoc(doc => { doc.exports.format = value})}
function updateDocStoryContent(updateDoc, value) { updateDoc(doc => {doc.exports.content = value})}
function updateDocStoryType(updateDoc, value) { updateDoc(doc => {doc.exports.type = value})}
function updateDocActElem(updateDoc, value) { updateDoc(doc => {doc.exports.acts = value})}
function updateDocChapterElem(updateDoc, value) { updateDoc(doc => {doc.exports.chapters = value})}
function updateDocSceneElem(updateDoc, value) { updateDoc(doc => {doc.exports.scenes = value})}

function ExportSettings({ style, flatted, exports, updateDoc}) {

  const {format} = exports
  const formatter = formatters[format]

  return <VBox style={style} className="ExportSettings">
    <TextField select label="Format" value={format} onChange={e => updateDocFormat(updateDoc, e.target.value)}>
      <ListSubheader>RTF</ListSubheader>
      <MenuItem value="rtf1">RTF, A4, 1-side</MenuItem>
      {/*<MenuItem value="rtf2">RTF, A4, 2-side</MenuItem>*/}
      <ListSubheader>LaTeX</ListSubheader>
      <MenuItem value="tex1">LaTeX, A5, 1-side</MenuItem>
      <MenuItem value="tex2">LaTeX, A5 booklet</MenuItem>
      <ListSubheader>Other</ListSubheader>
      <MenuItem value="md">MD (Mark Down)</MenuItem>
      {/* <MenuItem value="txt">Text (wrapped)</MenuItem> */}
      </TextField>

    <TextField select label="Content" value={exports.content} onChange={e => updateDocStoryContent(updateDoc, e.target.value)}>
      <MenuItem value="draft">Draft</MenuItem>
      <MenuItem value="synopsis">Synopsis</MenuItem>
      </TextField>

    <Button variant="contained" color="success" onClick={e => exportToFile(formatter, flatted)}>Export</Button>

    <Separator/>

    <TextField select label="Story Class" value={exports.type} onChange={e => updateDocStoryType(updateDoc, e.target.value)}>
      <MenuItem value="short">Short Story</MenuItem>
      <MenuItem value="long">Long Story</MenuItem>
      </TextField>

    <TextField select label="Acts" value={exports.acts} onChange={e => updateDocActElem(updateDoc, e.target.value)}>
      <MenuItem value="none">None</MenuItem>
      <MenuItem value="separated">Separated</MenuItem>
      <MenuItem value="numbered">Numbered</MenuItem>
      <MenuItem value="named">Named</MenuItem>
      <MenuItem value="numbered&named">Numbered & Named</MenuItem>
      </TextField>

    <TextField select label="Chapters" value={exports.chapters} onChange={e => updateDocChapterElem(updateDoc, e.target.value)}>
    <MenuItem value="none">None</MenuItem>
      <MenuItem value="separated">Separated</MenuItem>
      <MenuItem value="numbered">Numbered</MenuItem>
      <MenuItem value="named">Named</MenuItem>
      <MenuItem value="numbered&named">Numbered & Named</MenuItem>
      </TextField>

    <TextField select label="Scenes" value={exports.scenes} onChange={e => updateDocSceneElem(updateDoc, e.target.value)}>
    <MenuItem value="none">None</MenuItem>
      <MenuItem value="separated">Separated</MenuItem>
      <MenuItem value="numbered">Numbered</MenuItem>
      <MenuItem value="named">Named</MenuItem>
      <MenuItem value="numbered&named">Numbered & Named</MenuItem>
      </TextField>
  </VBox>
}

//-----------------------------------------------------------------------------
// Export to file
//-----------------------------------------------------------------------------

async function exportToFile(formatter, flatted) {

  const {options, file} = flatted

  const content = flattedFormat(formatter, flatted)

  const typesuffix = options.content === "synopsis" ? ".synopsis" : ""

  const dirname = await fs.dirname(file.id)
  const name = await fs.basename(file.id)
  const suffix = getSuffix(name, [".mawe", ".mawe.gz"]);
  const basename = await fs.basename(name, suffix);
  const filename = await fs.makepath(dirname, basename + typesuffix + formatter.suffix)
  console.log("Export to:", filename)

  fs.write(filename, content)
    .then(file => Inform.success(`Exported: ${file.name}`))
    .catch(err => Inform.error(err))
}

//-----------------------------------------------------------------------------
// Export preview
//-----------------------------------------------------------------------------

function Preview({ flatted }) {

  return <div className="Filler Board">
    <DeferredRender><div
      className="Sheet Regular"
      dangerouslySetInnerHTML={{ __html: flattedFormat(formatHTML, flatted) }}
    /></DeferredRender>
  </div>
}

//-----------------------------------------------------------------------------
// Export index
//-----------------------------------------------------------------------------

function ExportIndex({ style, flatted}) {
  const { content } = flatted

  return <VFiller className="TOC" style={style}>
    {content.map((node, index) => indexItem(node, index))}
  </VFiller>

  function indexItem(node, index) {
    switch(node.type) {
      case "hact": return <ActItem key={index} node={node}/>
      case "hchapter": return <ChapterItem key={index} node={node}/>
      case "hscene": return <SceneItem key={index} node={node}/>
    }
  }
}

function ActItem({node}) {
  const {name, number} = node
  return <div
      className="Entry ActName"
      //onClick={ev => window.location.href = `#${id}`}
      //onDoubleClick={ev => setFocusTo(updateDoc, "body", id)}
      style={{ cursor: "pointer" }}
    >
      <span className="Name">{number ? number + ". " + name : name}</span>
    </div>
}

function ChapterItem({node}) {
  const { name, number } = node
  return <div
      className="Entry ChapterName"
      //onClick={ev => window.location.href = `#${id}`}
      //onDoubleClick={ev => setFocusTo(updateDoc, "body", id)}
      style={{ cursor: "pointer" }}
    >
      <span className="Name">{number ? number + ". " + name : name}</span>
      </div>
}

function SceneItem({node}) {
  const { name, number } = node
  return <div
    className="Entry SceneName"
    //onClick={ev => window.location.href = `#${id}`}
    //onDoubleClick={ev => setFocusTo(updateDoc, "body", id)}
    style={{ cursor: "pointer" }}
  >
    <span className="Name">{number ? number + ". " + name : name}</span>
    </div>
}
