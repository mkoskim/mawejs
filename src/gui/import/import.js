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
  useMemo, useCallback,
  useState,
} from 'react';

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip, IconButton,
  ToggleButton, ToggleButtonGroup,
  Radio,
  Input,
  Label,
  List, ListItem, ListItemText, ListSubheader,
  Grid,
  Separator, Loading, addClass,
  TextField, SelectFrom,
  Menu, MenuItem,
  Accordion, AccordionSummary, AccordionDetails,
  DeferredRender,
  Inform,
} from "../common/factory";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { elemName, getSuffix, nanoid, filterCtrlElems } from "../../document/util";
import { Preview } from "./preview";
import { maweFromTree } from "../../document/xmljs/load";

//*****************************************************************************
//
// Import view
//
//*****************************************************************************

function ext2format(ext) {
  switch(ext) {
    case ".rtf": return "rtf"
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

class SelectFormat extends React.PureComponent {
  render() {
    const {format, content, setImported} = this.props

    switch(format) {
      case "text": return <ImportTXT content={content} setImported={setImported}/>
    }
    return null
  }
}

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

//*****************************************************************************
//
// Text import
//
//*****************************************************************************

class ImportTXT extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      linebreak: "double"
    };
  }

  setLinebreak(linebreak) {
    this.setState({linebreak})
  }

  getLinebreak() {
    switch(this.state.linebreak) {
      case "single": return "\n"
      default:
      case "double": return "\n\n"
    }
  }

  render() {
    const {content, setImported} = this.props

    setImported(importTXT(content, this.getLinebreak()))

    return <>
      <Label>Text import</Label>
      <TextField select label="Line break" value={this.state.linebreak} onChange={e => this.setLinebreak(e.target.value)}>
        <MenuItem value="double">Double</MenuItem>
        <MenuItem value="single">Single</MenuItem>
      </TextField>
    </>
  }
}

//-----------------------------------------------------------------------------

export function text2lines(content, linebreak = "\n\n") {
  return content
    .replaceAll("\r", "")
    .split(linebreak)
    .map(line => line.replaceAll(/\s+/g, " ").trim())
}

function importTXT(content, linebreak) {

  const elements = text2lines(content, linebreak)
    .map(line => ({
      type: "element", name: "p", id: nanoid(),
      elements: [{type: "text", text: line}]
    }))
  ;
  return [{
    type: "element", name: "part", id: nanoid(),
    elements: [{
      type: "element", name: "scene", id: nanoid(),
      elements
    }]
  }]
}
