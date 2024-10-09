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
  useState,
} from 'react';

import {
  VBox, HBox,
  ToolBox, Button,
  Label,
  Separator,
  Menu, MenuItem,
} from "../common/factory";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { maweFromTree } from "../../document/xmljs/load";

import { Preview } from "./preview";
import { ImportText } from "./importText";

//*****************************************************************************
//
// Import view
//
//*****************************************************************************

function ext2format(ext) {
  switch(ext) {
    //case ".rtf": return "rtf"
  }
  return "text"
}

export function ImportView({updateDoc, buffer, setBuffer}) {
  const {file, ext, content} = buffer

  console.log("File:", file, "Ext:", ext)

  const [format, setFormat] = useState(ext2format(ext))
  const [imported, setImported] = useState()

  return <VBox style={{ overflow: "auto" }}>
    <ImportBar format={format} setFormat={setFormat} imported={imported} updateDoc={updateDoc} buffer={buffer} setBuffer={setBuffer}/>
    <HBox style={{ overflow: "auto" }}>
      <VBox className="ImportSettings">
        <SelectFormat format={format} content={content} setImported={setImported}/>
      </VBox>
      <Preview imported={imported}/>
    </HBox>
  </VBox>
}

//-----------------------------------------------------------------------------

function ImportBar({format, setFormat, imported, updateDoc, buffer, setBuffer}) {

  function Import(e) {
    setBuffer(undefined)

    const story = maweFromTree({
      elements: [{
        type: "element", name: "story",
        attributes: {
          format: "mawe"
        },
        elements: [
          {
            type: "element", name: "body",
            elements: imported,
          }
        ]
    }]})
    updateDoc(story)
  }

  function Cancel(e) {
    setBuffer(undefined)
  }

  return <ToolBox>
    <Label>Import: {buffer.file?.name ?? "Clipboard"}</Label>
    <Separator/>
    <SelectFormatButton value={format} setFormat={setFormat}/>
    <Separator/>
    <Button variant="contained" color="error" onClick={Cancel}>Cancel</Button>
    <Separator/>
    <Button variant="contained" color="success" onClick={Import}>Import</Button>
    <Separator/>
  </ToolBox>
}

//-----------------------------------------------------------------------------

class SelectFormatButton extends React.PureComponent {

  static choices = {
    "text": {name: "Text",},
  }

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
