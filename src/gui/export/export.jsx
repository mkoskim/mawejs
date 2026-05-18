// ****************************************************************************
//
// Document exporting
//
// ****************************************************************************

import "./export.css"

import {
  VBox, HBox, VFiller,
  Button, Input,
  Separator,
  DeferredRender,
  Inform,
  Label,
  DropDown,
} from "../common/factory";

import { getSuffix, text2words } from "../../document/util";

import { exportAs, flattedFormat, flattedToText, storyToBatches } from "../../document/export"

import { numfmt } from "../../util";
import fs from "../../system/localfs"

import { useState } from "react";

//*****************************************************************************
//
// Choices
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Export formats
//-----------------------------------------------------------------------------

const formatters = {
  "rtf1": {
    name: "RTF, A4, 1-side",
    formatter: exportAs.RTF
  },
  /*
  "rtf2": {
    name: "RTF, A4, 2-side",
    formatter: exportAs.RTF,
  },
  */
  "tex1": {
    name: "LaTeX, A5, 1-side",
    formatter: exportAs.TEX1,
  },
  "tex2": {
    name: "LaTeX, A5 booklet",
    formatter: exportAs.TEX2,
  },
  "md": {
    name: "MD (Mark Down)",
    formatter: exportAs.MD,
  },
  "txt": {
    name: "Text (wrapped)",
    formatter: exportAs.TXT,
  },
  choices: [
    //<ListSubheader>RTF</ListSubheader>
    "rtf1",
    "---", //<ListSubheader>LaTeX</ListSubheader>
    "tex1",
    "tex2",
    "---", //<ListSubheader>LaTeX</ListSubheader>
    "md",
    //"txt",
  ]
}

//-----------------------------------------------------------------------------
// Content selection
//-----------------------------------------------------------------------------

const contenttype = {
  "draft": {name: "Draft"},
  "synopsis": {name: "Synopsis"},
  "storybook": {name: "Storybook"},
  choices: ["draft", "synopsis", "storybook"]
}

function getTypeSuffix(contentType) {
  switch(contentType) {
    case "synopsis": return ".synopsis"
    case "storybook": return ".storybook"
    default: break;
  }
  return ""
}

//-----------------------------------------------------------------------------
// Story type selection
//-----------------------------------------------------------------------------

const storytype = {
  "short": {name: "Short story"},
  "long":  {name: "Long story"},
  choices: ["short", "long"]
}

//-----------------------------------------------------------------------------
// Header type selection
//-----------------------------------------------------------------------------

const headertype = {
  "none": {name: "None"},
  "separated": {name: "Separated"},
  "numbered": {name: "Numbered"},
  "named": {name: "Named"},
  "numbered&named": {name: "Numbered & Named"},
  choices: ["none", "separated", "numbered", "named", "numbered&named"]
}

// ****************************************************************************
//
// Export settings
//
// ****************************************************************************

export function loadExportSettings(settings) {
  return {
    format: "rtf1",
    content: "draft",
    type: "short",
    acts: "none",
    chapters: "none",
    scenes: "none",
    prefix_act: "",
    prefix_chapter: "",
    prefix_scene: "",
    ...(settings?.attributes ?? {})
  }
}

export function saveExportSettings(settings) {
  const {
    content, type,
    acts, chapters, scenes,
    prefix_act, prefix_chapter, prefix_scene
  } = settings
  return {type: "export", attributes: {
    content,
    type,
    acts,
    chapters,
    scenes,
    prefix_act,
    prefix_chapter,
    prefix_scene
  }}
}

function updateDocFormat(updateDoc, value) { updateDoc(doc => { doc.exports.format = value})}
function updateDocStoryContent(updateDoc, value) { updateDoc(doc => {doc.exports.content = value})}
function updateDocStoryType(updateDoc, value) { updateDoc(doc => {doc.exports.type = value})}

function updateDocActElem(updateDoc, value) { updateDoc(doc => {doc.exports.acts = value})}
function updateDocChapterElem(updateDoc, value) { updateDoc(doc => {doc.exports.chapters = value})}
function updateDocSceneElem(updateDoc, value) { updateDoc(doc => {doc.exports.scenes = value})}

function updateDocActPrefix(updateDoc, value) { updateDoc(doc => {doc.exports.prefix_act = value})}
function updateDocChapterPrefix(updateDoc, value) { updateDoc(doc => {doc.exports.prefix_chapter = value})}
function updateDocScenePrefix(updateDoc, value) { updateDoc(doc => {doc.exports.prefix_scene = value})}

// ****************************************************************************
//
// Export view
//
// ****************************************************************************

export function ExportView({ doc, updateDoc }) {

  const {exports} = doc
  const batches = storyToBatches(doc)

  return <HBox overflow="hidden">
    <ExportIndex style={{overflow: "auto", maxWidth: "300px", width: "300px", borderRight: "1px solid lightgray" }} batches={batches}/>
    <Preview batches={batches}/>
    <ExportSettings style={{overflow: "auto", minWidth: "300px"}} batches={batches} exports={exports} updateDoc={updateDoc}/>
  </HBox>
}

//-----------------------------------------------------------------------------
// Export settings
//-----------------------------------------------------------------------------

function ExportInfo({batches}) {
  const text = batches.map(b => flattedToText(b.flatted)).join("\n")

  const words = text2words(text)
  const wc = words.length
  const chars = text.length

  const style={
    padding: "6pt 0pt 6pt 0pt",
    //border: "1pt solid lightgray",
    //borderRadius: "2pt",
  }

  return <VBox style={style}>
    <Label>Words: {numfmt.group.format(wc)}</Label>
    <Label>Chars: {numfmt.group.format(chars)}</Label>
    </VBox>
}

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------

function ExportSettings({ style, batches, exports, updateDoc}) {
  const [exportedFile, setExportedFile] = useState(null);

  const {format} = exports
  const {formatter} = formatters[format]

  return <VBox style={style} side="right" className="Panel">
    <ExportInfo batches={batches}/>

    <Separator/>

    <DropDown
      as="text"
      label="Format"
      choices={formatters.choices}
      selected={format}
      selections={formatters}
      setSelected={value => updateDocFormat(updateDoc, value)}
    />

    <Button variant="filled" color="success" onClick={e => exportToFile(formatter, batches, setExportedFile)}>Export</Button>
    <Button variant="filled" disabled={!exportedFile} color={exportedFile ? "success" : "default"} onClick={() => fs.openexternal(exportedFile)}>
      Open exported file
    </Button>

    <Separator/>
    <DropDown
      as="text"
      label="Content"
      choices={contenttype.choices}
      selected={exports.content}
      selections={contenttype}
      setSelected={value => updateDocStoryContent(updateDoc, value)}
    />
    <DropDown
      as="text"
      label="Story Class"
      choices={storytype.choices}
      selected={exports.type}
      selections={storytype}
      setSelected={value => updateDocStoryType(updateDoc, value)}
    />

    <Separator/>
    <DropDown
      as="text"
      label="Acts"
      choices={headertype.choices}
      selected={exports.acts}
      selections={headertype}
      setSelected={value => updateDocActElem(updateDoc, value)}
    />
    <DropDown
      as="text"
      label="Chapters"
      choices={headertype.choices}
      selected={exports.chapters}
      selections={headertype}
      setSelected={value => updateDocChapterElem(updateDoc, value)}
    />
    <DropDown
      as="text"
      label="Scenes"
      choices={headertype.choices}
      selected={exports.scenes}
      selections={headertype}
      setSelected={value => updateDocSceneElem(updateDoc, value)}
    />

    <Separator/>
    <Input variant="outlined" label="Act Prefix" value={exports.prefix_act} onChange={e => updateDocActPrefix(updateDoc, e.target.value)}/>
    <Input variant="outlined" label="Chapter Prefix" value={exports.prefix_chapter} onChange={e => updateDocChapterPrefix(updateDoc, e.target.value)}/>
    <Input variant="outlined" label="Scene Prefix" value={exports.prefix_scene} onChange={e => updateDocScenePrefix(updateDoc, e.target.value)}/>

  </VBox>
}

//-----------------------------------------------------------------------------
// Export to file
//-----------------------------------------------------------------------------

async function exportToFile(formatter, batches, setExportedFile) {

  if (!batches.length) return

  const {file, options} = batches[0].flatted
  const typesuffix = getTypeSuffix(options.content)
  const dirname = await fs.dirname(file.id)
  const name = await fs.basename(file.id)
  const filesuffix = getSuffix(name, [".mawe", ".mawe.gz"])
  const basename = await fs.basename(name, filesuffix)

  for (const {suffix, flatted} of batches) {
    const content = flattedFormat(formatter, flatted)
    const filename = await fs.makepath(dirname, basename + typesuffix + suffix + formatter.suffix)
    console.log("Export to:", filename)
    fs.write(filename, content)
      .then(file => {
        setExportedFile(filename)
        Inform.success(`Exported: ${file.name}`)
      })
      .catch(err => Inform.error(err))
  }
}

//-----------------------------------------------------------------------------
// Export preview
//-----------------------------------------------------------------------------

function Preview({ batches }) {

  return <div className="Filler Board Preview">
    <DeferredRender>
      {batches.map(({suffix, flatted}) =>
        <div key={suffix}
          className="Sheet Regular"
          dangerouslySetInnerHTML={{ __html: flattedFormat(exportAs.HTML, flatted) }}
        />
      )}
    </DeferredRender>
  </div>
}

//-----------------------------------------------------------------------------
// Export index
//-----------------------------------------------------------------------------

function ExportIndex({ style, batches }) {
  const content = batches.flatMap(b => b.flatted.content)

  return <VFiller className="TOC" style={style}>
    {content.map((node, index) => indexItem(node, index))}
  </VFiller>

  function indexItem(node, index) {

    switch(node.type) {
      case "hact": return <ActItem key={index} node={node} index={index}/>
      case "hchapter": return <ChapterItem key={index} node={node} index={index}/>
      case "hscene": return <SceneItem key={index} node={node} index={index}/>
      case "hsynopsis": return <SceneItem key={index} node={node} index={index}/>
      case "hnotes": return <SceneItem key={index} node={node} index={index}/>
    }
  }
}

function ActItem({node, index}) {
  const { name, number } = node;

  return <div
      className="Entry Act"
      /*FUTURE DOUBLE CLICK FUNCTIONALITY HERE*/
      onClick={() => scrollToId(index)}
      //style={{ cursor: "pointer" }}
    >
      <span className="Name">{number ? number + ". " + name : name}</span>
    </div>
}

function ChapterItem({node, index}) {
  const { name, number } = node;

  return <div
      className="Entry Chapter"
      /*FUTURE DOUBLE CLICK FUNCTIONALITY HERE*/
      onClick={() => scrollToId(index)}
      //style={{ cursor: "pointer" }}
    >
      <span className="Name">{number ? number + ". " + name : name}</span>
      </div>
}

function SceneItem({node, index}) {
  const { name, number} = node;

  return <div
    className="Entry Scene"
    /*FUTURE DOUBLE CLICK FUNCTIONALITY HERE*/
    onClick={() => scrollToId(index)}
    //style={{ cursor: "pointer" }}
    >
      <span className="Name">{number ? number + ". " + name : name}</span>
    </div>
}

function scrollToId(id) {
  const target = document.getElementById(id);
  if(target) {
    target.scrollIntoView({ block: "start"});
    //target.scrollIntoView({ behavior: "smooth", block: "start"});
    //target.scrollIntoViewIfNeeded(false)

    target.classList.add("flash");

    setTimeout(() => target.classList.remove("flash"), 500);
  }
}
