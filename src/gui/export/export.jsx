// ****************************************************************************
//
// Document exporting
//
// ****************************************************************************

import "./export.css"

import { useState } from "react";

import {
  VBox, HBox, VFiller,
  Button, Input,
  Separator,
  DeferredRender,
  Inform,
  Label,
  DropDown,
} from "../common/factory";

import {getTextConverter} from "../../document/export/convert2TXT";
import {getHTMLConverter} from "../../document/export/convert2HTML";
import {getTEXConverter} from "../../document/export/convert2TEX";
import {getRTFConverter} from "../../document/export/convert2RTF";
import {doc2flatted, flatted2file, convertFlatted, convertText, convertNode } from "../../document/export/process";

import { numfmt, text2words } from "../../util";
import { nodeAsText } from "../../document/nodeutil";
import { getSuffix } from "../../document/fileutil";
import fs from "../../system/localfs"

//*****************************************************************************
//
// Choices
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Export formats
//-----------------------------------------------------------------------------

const formatPreview = getHTMLConverter({format: "preview"})
const formatPlain = getTextConverter({format: "plain"})

const formatters = {
  "rtf1": {
    name: "RTF, A4, 1-side",
    formatter: getRTFConverter({size: "a4", sides: "single"}),
  },
  /*
  "rtf2": {
    name: "RTF, A4, 2-side",
    formatter: exportAs.RTF,
  },
  */
  "tex1": {
    name: "LaTeX, A5, 1-side",
    formatter: getTEXConverter({size: "a5", sides: "single"}),
  },
  "tex2": {
    name: "LaTeX, A5 booklet",
    formatter: getTEXConverter({size: "a5", sides: "double"}),
  },
  "md": {
    name: "MD (Mark Down)",
    formatter: getTextConverter({format: "md"}),
  },
  /*
  "txt": {
    name: "Text (wrapped)",
    formatter: exportAs.TXT,
  },
  */
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
// Split type selection
//-----------------------------------------------------------------------------

const splittype = {
  "none":    {name: "None"},
  "act":     {name: "Acts"},
  "chapter": {name: "Chapters"},
  choices: ["none", "act", "chapter"]
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
  return {name: "export", attributes: {
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

function updateDocSplit(updateDoc, value) { updateDoc(doc => {doc.exports.split = value === "none" ? undefined : value})}
function updateDocActNode(updateDoc, value) { updateDoc(doc => {doc.exports.acts = value})}
function updateDocChapterNode(updateDoc, value) { updateDoc(doc => {doc.exports.chapters = value})}
function updateDocSceneNode(updateDoc, value) { updateDoc(doc => {doc.exports.scenes = value})}

function updateDocActPrefix(updateDoc, value) { updateDoc(doc => {doc.exports.prefix_act = value})}
function updateDocChapterPrefix(updateDoc, value) { updateDoc(doc => {doc.exports.prefix_chapter = value})}
function updateDocScenePrefix(updateDoc, value) { updateDoc(doc => {doc.exports.prefix_scene = value})}

// ****************************************************************************
//
// Export view
//
// ****************************************************************************

export function ExportView({ doc, updateDoc }) {

  const flatted = doc2flatted(doc)

  return <HBox overflow="hidden">
    <ExportIndex doc={doc} flatted={flatted} style={{overflow: "auto", maxWidth: "300px", width: "300px", borderRight: "1px solid lightgray" }}/>
    <Preview doc={doc} flatted={flatted}/>
    <ExportSettings doc={doc} flatted={flatted} updateDoc={updateDoc} style={{overflow: "auto", minWidth: "300px"}}/>
  </HBox>
}

//-----------------------------------------------------------------------------
// Export settings
//-----------------------------------------------------------------------------

function ExportInfo({doc, flatted}) {
  const text = flatted2file(formatPlain, doc, flatted)

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

function ExportSettings({ doc, flatted, updateDoc, style}) {
  const [exportedFile, setExportedFile] = useState(null);

  const {exports} = doc;
  const {format} = exports
  const {formatter} = formatters[format]

  return <VBox style={style} side="right" className="Panel">
    <ExportInfo doc={doc} flatted={flatted}/>

    <Separator/>

    <DropDown
      as="text"
      label="Format"
      choices={formatters.choices}
      selected={format}
      selections={formatters}
      setSelected={value => updateDocFormat(updateDoc, value)}
    />

    {/* Batches temporarily disabled
    <DropDown
      as="text"
      label="Split by"
      choices={splittype.choices}
      selected={exports.split ?? "none"}
      selections={splittype}
      setSelected={value => updateDocSplit(updateDoc, value)}
    />
    */}

    <Button disabled={!doc.file} variant="filled" color="success" onClick={e => exportToFile(formatter, doc, flatted, setExportedFile)}>Export</Button>
    {//*
    <Button disabled={!exportedFile} variant="filled" color={exportedFile ? "success" : "default"} onClick={() => fs.openexternal(exportedFile)}>
      Open exported file
    </Button>
    /**/}

    <Separator/>
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
      setSelected={value => updateDocActNode(updateDoc, value)}
    />
    <DropDown
      as="text"
      label="Chapters"
      choices={headertype.choices}
      selected={exports.chapters}
      selections={headertype}
      setSelected={value => updateDocChapterNode(updateDoc, value)}
    />
    <DropDown
      as="text"
      label="Scenes"
      choices={headertype.choices}
      selected={exports.scenes}
      selections={headertype}
      setSelected={value => updateDocSceneNode(updateDoc, value)}
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

async function exportToFile(formatter, doc, flatted, setExportedFile) {

  if(!flatted?.length) return;

  const {file} = doc
  const dirname = await fs.dirname(file.id)
  const name = await fs.basename(file.id)
  const filesuffix = getSuffix(name, [".mawe", ".mawe.gz"])
  const basename = await fs.basename(name, filesuffix)

  const filename = basename + contentSuffix() + formatter.suffix
  const fullname = await fs.makepath(dirname, filename)

  console.log("Export to:", fullname)
  //console.log("Settings:", doc.exports)
  const content = flatted2file(formatter, doc, flatted)

  //*
  fs.write(fullname, content)
    .then(async (file) => {
      console.log("Exported to:", file.id)
      setExportedFile(file.id)
      const name = await fs.basename(file.id)
      Inform.success(`Exported: ${name}`)
    })
    .catch(err => Inform.error(err))
  /**/

  function contentSuffix() {
    switch(doc.exports.content) {
      case "storybook": return ".storybook"
      case "synopsis": return ".synopsis"
      default:
      case "draft": return ""
    }
  }

  //---------------------------------------------------------------------------
  // TODO: Batches will be added later
  //---------------------------------------------------------------------------

  /*
  if (!batches.length) return

  const {file, options} = batches[0].flatted
  const typesuffix = getTypeSuffix(options.content)

  Promise.all(batches.map(async ({suffix, flatted}) => {
    const content = flattedFormat(formatter, flatted)
    console.log("Export to:", filename)
    return fs.write(filename, content)
  }))
  .then(files => {
    setExportedFile(files[0]?.id)
    const msg = files.length === 1
      ? `Exported: ${files[0].name}`
      : `Exported: ${files[0].name} (+${files.length - 1})`
    Inform.success(msg)
  })
  .catch(err => Inform.error(err))
  */
}

//-----------------------------------------------------------------------------
// Export preview
//-----------------------------------------------------------------------------

function Preview({ doc, flatted }) {
  const __html = flatted2file(formatPreview, doc, flatted)

  return <div className="Filler Board Preview">
    <DeferredRender>
      <div
        className="Sheet Regular"
        dangerouslySetInnerHTML={{__html}}
      />
    </DeferredRender>
  </div>
}

//-----------------------------------------------------------------------------
// Export index
//-----------------------------------------------------------------------------

function ExportIndex({ doc, flatted, style }) {
  const {acts, chapters, scenes} = doc?.exports ?? {};
  const header = {
    "act": acts,
    "chapter": chapters,
    "scene": scenes,
  }

  // NOTE: Index always shows the name of the elements, as well as
  // their number (if they have one), even if exported headers do not
  // contain them.

  return <VFiller className="TOC" style={style}>
    {flatted.map((node, index) => indexItem(node, index))}
  </VFiller>

  function indexItem(node, index) {
    switch(header[node.type]) {
      case "numbered":
      case "named":
      case "numbered&named":
        break
      default: return
    }

    switch(node.type) {
      case "act": return <ActItem key={index} node={node}/>
      case "chapter": return <ChapterItem key={index} node={node}/>
      case "scene": return <SceneItem key={index} node={node}/>
    }
  }
}

function ActItem({node}) {
  const { number, anchor } = node;
  const name = nodeAsText(node)

  return <div
      className="Entry Act"
      onClick={() => scrollToId(anchor)}
    >
      <span className="Name">{number ? number + ". " + name : name}</span>
    </div>
}

function ChapterItem({node}) {
  const { number, anchor } = node;
  const name = nodeAsText(node)

  return <div
      className="Entry Chapter"
      onClick={() => scrollToId(anchor)}
    >
      <span className="Name">{number ? number + ". " + name : name}</span>
    </div>
}

function SceneItem({node}) {
  const { number, anchor } = node;
  const name = nodeAsText(node)

  return <div
    className="Entry Scene"
    onClick={() => scrollToId(anchor)}
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
