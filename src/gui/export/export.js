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
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText, ListSubheader,
  Grid,
  Separator, Loading, addClass,
  TextField, SelectFrom,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  DeferredRender,
} from "../common/factory";

import { getSuffix, nanoid } from "../../document/util";
import { SectionWordInfo } from "../common/components";
import { mawe } from "../../document"

import { FormatBody } from "./formatDoc"

import { formatRTF } from "./formatRTF";
import { formatHTML } from "./formatHTML"
import { formatTXT } from "./formatTXT"
import { formatTEX } from "./formatTEX"

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs");

//-----------------------------------------------------------------------------

export function Export({ doc, setDoc, focusTo, setFocusTo }) {

  const {head} = doc.story.body

  function setHead(head) {
    setDoc({
      ...doc,
      story: {
        ...doc.story,
        body: {
          ...doc.story.body,
          head: {
            ...doc.story.body.head,
            ...head,
          }
        }
      }
    })
  }

  function setName(value)  { setHead({name: value}) }
  function setTitle(value) { setHead({title: value}) }
  function setSubtitle(value) { setHead({subtitle: value}) }
  function setAuthor(value) { setHead({author: value}) }
  function setPseudonym(value) { setHead({pseudonym: value}) }

  function setExport(value) {
    setHead({
      export: {
        ...head.export,
        ...value
      }
    })

  }

  function setStoryType(value) { setExport({type: value}) }
  function setChapterElem(value) { setExport({chapterelem: value}) }
  function setChapterType(value) { setExport({chaptertype: value}) }

  const [format, setFormat] = useState("rtf1")

  const settings = {
    setFocusTo,

    setName,
    setTitle,
    setSubtitle,
    setAuthor,
    setPseudonym,

    story: {
      format: format,
      type: head.export.type,
      setFormat: setFormat,
      setType: setStoryType,
    },

    chapters: {
      element: head.export.chapterelem,   // part, scene, none
      type: head.export.chaptertype,  // separated, numbered, named
      setElement: setChapterElem,
      setType: setChapterType,
    },
  }

  const previewprops = {
    settings,
    doc,
  }

  return <VBox style={{ overflow: "auto" }}>
    {/* <ExportToolbar {...previewprops}/> */}
    <HBox style={{ overflow: "auto" }}>
      {/* <ExportSettings {...previewprops}/> */}
      <ExportIndex style={{ maxWidth: "300px", width: "300px" }} {...previewprops} />
      <Preview {...previewprops} />
      <ExportSettings {...previewprops}/>
    </HBox>
  </VBox>
}

//-----------------------------------------------------------------------------
// Export settings
//-----------------------------------------------------------------------------

function ExportSettings({ style, settings, doc }) {

  /*
  const { basename } = doc;
  const { body } = doc.story
  const { head, parts } = body

  return <VBox style={{ ...style, background: "white", padding: "8px" }}>
    <Label>Filename: {basename}</Label>
    <Separator />
    <Input label="Title" value={head.title} />
    <Input label="Subtitle" value={head.subtitle} />
    <Input label="Author" value={head.author} />
    <Separator />
  </VBox>
  */

  const { story, chapters } = settings

  const formatter = {
    "rtf1": formatRTF,
    "rtf2": formatRTF,
    "tex1": formatTEX,
    "tex2": formatTEX,
    "txt": formatTXT,
  }[story.format]

  const { body } = doc.story
  const { head } = body
  const info = mawe.info(body.head)

  return <VBox style={style} className="ExportSettings">
    <TextField select label="Format" value={story.format} onChange={e => story.setFormat(e.target.value)}>
      <ListSubheader>RTF</ListSubheader>
      <MenuItem value="rtf1">RTF, A4, 1-side</MenuItem>
      <MenuItem value="rtf2">RTF, A4, 2-side</MenuItem>
      <ListSubheader>LaTeX</ListSubheader>
      <MenuItem value="tex1">LaTeX, A5, 1-side</MenuItem>
      <MenuItem value="tex2">LaTeX, A5, 2-side</MenuItem>
      <ListSubheader>Other</ListSubheader>
      <MenuItem value="txt">ASCII Text</MenuItem>
      </TextField>

    <Accordion disableGutters>
    <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Story type: {info.type}</AccordionSummary>
    <AccordionDetails><VBox>
    <TextField select label="Story Class" value={story.type} onChange={e => story.setType(e.target.value)}>
      <MenuItem value="short">Short Story</MenuItem>
      <MenuItem value="long">Long Story</MenuItem>
      </TextField>
    <TextField select label="Chapters" value={chapters.element} onChange={e => chapters.setElement(e.target.value)}>
      <MenuItem value="part">Part</MenuItem>
      <MenuItem value="scene">Scene</MenuItem>
      <MenuItem value="none">None</MenuItem>
      </TextField>
    <TextField select name="Chapter style" value={chapters.type} onChange={e => chapters.setType(e.target.value)}>
      <MenuItem value="separated">Separated</MenuItem>
      <MenuItem value="numbered">Numbered</MenuItem>
      <MenuItem value="named">Named</MenuItem>
      </TextField>
    </VBox></AccordionDetails>
    </Accordion>

    <Accordion disableGutters>
    <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Title: {info.title}</AccordionSummary>
    <AccordionDetails><VBox>
    <TextField label="Name" value={head.name} onChange={e => settings.setName(e.target.value)}/>
    <TextField label="Title" value={head.title ?? ""} onChange={e => settings.setTitle(e.target.value)}/>
    <TextField label="Subtitle" value={head.subtitle ?? ""} onChange={e => settings.setSubtitle(e.target.value)}/>
    </VBox></AccordionDetails>
    </Accordion>

    <Accordion disableGutters>
    <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Author: {info.author}</AccordionSummary>
    <AccordionDetails><VBox>
    <TextField label="Author" value={head.author ?? ""} onChange={e => settings.setAuthor(e.target.value)}/>
    <TextField label="Pseudonym" value={head.pseudonym ?? ""} onChange={e => settings.setPseudonym(e.target.value)}/>
    </VBox></AccordionDetails>
    </Accordion>

    <Button variant="contained" color="success" onClick={e => doExport(e)}>Export</Button>
  </VBox>

/*
  return <VBox style={style}>
    Export:
    <Button onClick={exportRTF}>RTF</Button>
    <Button onClick={exportTEX}>TEX</Button>
    <Button onClick={exportTXT}>TXT</Button>
    <SectionWordInfo section={body} />
  </VBox>
*/

  function doExport(event) {
    const content = FormatBody(settings, formatter, body)
    //console.log(content)
    exportToFile(doc, formatter.suffix, content)
  }

/*
  function exportTXT(event) {
    const content = FormatBody(settings, formatTXT, body)
    //console.log(content)
    exportToFile(doc, ".txt", content)
  }

  function exportTEX(event) {
    const content = FormatBody(settings, formatTEX, body)
    //console.log(content)
    exportToFile(doc, ".tex", content)
  }
*/
}

async function exportToFile(doc, filesuffix, content) {
  const dirname = await fs.dirname(doc.file.id)
  const name = await fs.basename(doc.file.id)
  const suffix = getSuffix(name, [".mawe", ".mawe.gz"]);
  const basename = await fs.basename(name, suffix);
  const filename = await fs.makepath(dirname, basename + filesuffix)
  console.log("Export to:", filename)
  fs.write(filename, content)
}

//-----------------------------------------------------------------------------
// Export index
//-----------------------------------------------------------------------------

function ExportIndex({ style, settings, doc }) {
  const { body } = doc.story
  const { parts } = body

  return <VFiller className="TOC" style={style}>
    {parts.map(part => <PartItem key={part.id} settings={settings} part={part} />)}
  </VFiller>
}

function PartItem({ settings, part }) {
  const { id, name, children } = part
  return <>
    <div
      className="Entry PartName"
      onClick={ev => window.location.href = `#${id}`}
      onDoubleClick={ev => settings.setFocusTo({ id })}
      style={{ cursor: "pointer" }}
    >
      <span className="Name">{name}</span>
    </div>
    {children.map(scene => <SceneItem key={scene.id} settings={settings} scene={scene} />)}
  </>
}

function SceneItem({ settings, scene }) {
  const { id, name } = scene
  return <div
    className="Entry SceneName"
    onClick={ev => window.location.href = `#${id}`}
    onDoubleClick={ev => settings.setFocusTo({ id })}
    style={{ cursor: "pointer" }}
  >
    <span className="Name">{name}</span>
  </div>
}

//-----------------------------------------------------------------------------
// Export preview
//-----------------------------------------------------------------------------

function Preview({ settings, doc }) {
  const { body } = doc.story

  return <div className="Filler Board">
    <DeferredRender><div
      className="Sheet Regular"
      dangerouslySetInnerHTML={{ __html: FormatBody(settings, formatHTML, body) }}
    /></DeferredRender>
  </div>
}
