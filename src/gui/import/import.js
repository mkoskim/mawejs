//*****************************************************************************
//*****************************************************************************
//
// File import view
//
//*****************************************************************************
//*****************************************************************************

import "./styles/import.css"
import "../common/styles/sheet.css"

import React, {
  useState, useEffect,
} from 'react';

import {
  VBox, HBox,
  ToolBox, Button,
  Label,
  Separator,
  Menu, MenuItem,
  Inform,
  Filler,
} from "../common/factory";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { maweFromTree } from "../../document/xmljs/load";

import { Preview } from "./preview";
import { ImportText } from "./importText";

//const anytext = require("any-text")
const mammoth = require("mammoth")
const fs = require("../../system/localfs")

//*****************************************************************************
//
// Import view
//
//*****************************************************************************

const formats = {
  "text": {name: "Text",},
}

function getContent(file, ext) {
  if(!file) {
    return {
      loader: navigator.clipboard.readText(),
      format: "text"
    }
  }
  switch(ext) {
    //case ".rtf":
    case ".docx": return {
      loader: fs.read(file.id, null)
        .then(buffer => mammoth.extractRawText({arrayBuffer: buffer}))
        .then(result => result.value),
      format: "text"
    }
  }
  return {
    loader: fs.read(file.id),
    format: "text"
  }
}

export function ImportView({updateDoc, buffer, setBuffer}) {
  const {file, ext} = buffer

  //console.log("File:", file, "Ext:", ext)

  const [content, setContent] = useState()
  const [format, setFormat] = useState()
  const [imported, setImported] = useState()

  useEffect(() => {
    const {loader, format} = getContent(file, ext)
    loader
    .then(content => {
      setContent(content)
      setFormat(format)
      if(file) Inform.success(`Loaded: ${file.name}`);
    })
    .catch(err => {
      Inform.error(err);
      setBuffer()
    })
  }, [buffer, setContent, setFormat, setBuffer])

  return <VBox style={{ overflow: "auto", padding: "4pt", background: "#F5F7F9" }}>
    <ImportBar format={format} setFormat={setFormat} imported={imported} updateDoc={updateDoc} buffer={buffer} setBuffer={setBuffer}/>
    <HBox style={{ overflow: "auto" }}>
      <Preview imported={imported}/>
      <VBox className="ImportSettings">
        <SelectFormat format={format} content={content} setImported={setImported}/>
      </VBox>
    </HBox>
  </VBox>
}

//-----------------------------------------------------------------------------

function ImportBar({format, setFormat, imported, updateDoc, buffer, setBuffer}) {

  function Import(e) {
    const story = maweFromTree({
      elements: [{
        type: "element", name: "story",
        attributes: {format: "mawe", version: "4"},
        elements: [
          {
            type: "element", name: "body",
            elements: imported,
          }
        ]
    }]})
    updateDoc(story)
    setBuffer(undefined)
  }

  function Cancel(e) {
    setBuffer(undefined)
  }

  return <ToolBox>
    <Label>Import: {buffer.file?.name ?? "Clipboard"}</Label>
    <Separator/>
    <Label>Format: {formats[format]?.name ?? format}</Label>
    {/*<SelectFormatButton value={format} setFormat={setFormat}/>*/}
    <Separator/>
    <Filler/>
    <Separator/>
    <Button variant="contained" color="success" onClick={Import}>Import</Button>
    <Separator/>
    <Button variant="contained" color="error" onClick={Cancel}>Cancel</Button>
    <Separator/>
  </ToolBox>
}

//-----------------------------------------------------------------------------

class SelectFormatButton extends React.PureComponent {

  static order = ["text"]

  render() {
    const {format, setFormat} = this.props;
    //const type = node?.type ?? undefined

    const choices = this.constructor.choices
    const order   = this.constructor.order
    const name    = format in choices ? choices[format].name : "Text"

    //console.log("Block type:", type)

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button tooltip="Paragraph style" style={{justifyContent: "flex-start"}} {...bindTrigger(popupState)}>Format: {name}</Button>
        <Menu {...bindMenu(popupState)}>
          {order.map(k => [k, choices[k]]).map(([k, v]) => (
            <MenuItem key={k} value={k} onClick={e => {setFormat(k); popupState.close(e)}}>
              {v.name}
              </MenuItem>
            )
          )}
          {/*
          <ListSubheader>RTF</ListSubheader>
          <MenuItem value="rtf1">RTF, A4, 1-side</MenuItem>
          <MenuItem value="rtf2">RTF, A4, 2-side</MenuItem>
          <ListSubheader>LaTeX</ListSubheader>
          <MenuItem value="tex1">LaTeX, A5, 1-side</MenuItem>
          <MenuItem value="tex2">LaTeX, A5 booklet</MenuItem>
          <ListSubheader>Other</ListSubheader>
          <MenuItem value="md">MD (Mark Down)</MenuItem>
          */}
        </Menu>
      </React.Fragment>
      }
    </PopupState>
  }
}

//-----------------------------------------------------------------------------

class SelectFormat extends React.PureComponent {
  render() {
    const {format, content, setImported} = this.props

    switch(format) {
      case "text": return <ImportText content={content} setImported={setImported}/>
    }
    return null
  }
}
