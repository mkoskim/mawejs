//*****************************************************************************
//*****************************************************************************
//
// File import view
//
//*****************************************************************************
//*****************************************************************************

import "./import.css"

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
  addHotkeys,
  IsKey,
  Dialog,
} from "../common/factory";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { maweFromTree } from "../../document/xmljs/load";

import { Preview } from "./preview";
import { ImportText } from "./importText";

//import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

//const anytext = require("any-text")
const mammoth = require("mammoth")
const fs = require("../../system/localfs")

//*****************************************************************************
//
// Import view
//
//*****************************************************************************

const formats = {
  "text": { name: "Text", },
}

function getContent(file, ext) {
  if (!file) {
    return {
      loader: navigator.clipboard.readText(),
      format: "text"
    }
  }
  switch (ext) {
    //case ".rtf":
    case ".docx": return {
      loader: fs.read(file.id, null)
        .then(buffer => mammoth.extractRawText({ arrayBuffer: buffer }))
        .then(result => result.value),
      format: "text"
    }
  }
  return {
    loader: fs.read(file.id),
    format: "text"
  }
}

export function ImportDialog({ updateDoc, buffer, setBuffer }) {
  const { file, ext } = buffer

  //console.log("File:", file, "Ext:", ext)

  const [content, setContent] = useState()
  const [format, setFormat] = useState()
  const [imported, setImported] = useState()

  function Import(e) {
    const story = maweFromTree({
      elements: [{
        type: "element", name: "story",
        attributes: { format: "mawe", version: "4" },
        elements: [
          {
            type: "element", name: "body",
            elements: imported,
          }
        ]
      }]
    })
    updateDoc(story)
    setBuffer(undefined)
  }

  function Cancel(e) {
    //console.log('Cancel function called'); // Debugging log
    setBuffer(undefined); // Close the dialog by resetting the buffer
  }

  useEffect(() => addHotkeys([
    [IsKey.Escape, Cancel],
  ]), [])

  useEffect(() => {
    const { loader, format } = getContent(file, ext)
    loader
      .then(content => {
        setContent(content)
        setFormat(format)
        if (file) Inform.success(`Loaded: ${file.name}`);
      })
      .catch(err => {
        Inform.error(err);
        setBuffer()
      })
  }, [buffer, setContent, setFormat, setBuffer])

  return <Dialog
      open={true}
      //fullScreen={true}
      fullWidth={true}
      maxWidth="xl"
      disableEscapeKeyDown={true}
    >
    <VBox style={{ overflow: "auto", padding: "4pt", background: "#F5F7F9" }}>

    <ToolBox>
      <Label>Import from: {buffer.file?.name ?? "Clipboard"}</Label>
      <Separator />
      <Filler />

      <Separator />
      <Label>Format: {formats[format]?.name ?? format}</Label>
      {/*<SelectFormatButton value={format} setFormat={setFormat}/>*/}

      <Separator />

      <Separator />
      <IconButton onClick={Cancel} aria-label="close"><CloseIcon /></IconButton>
    </ToolBox>

    <HBox style={{ overflow: "auto" }}>
      <Preview imported={imported} />
      <VBox className="ImportSettings">
        <SelectFormat format={format} content={content} setImported={setImported} />
        <Button variant="contained" color="success" onClick={Import}>
          Import
        </Button>
      </VBox>
    </HBox>
  </VBox></Dialog>
}

//-----------------------------------------------------------------------------

class SelectFormatButton extends React.PureComponent {

  static order = ["text"]

  render() {
    const { format, setFormat } = this.props;
    //const type = node?.type ?? undefined

    const choices = this.constructor.choices
    const order = this.constructor.order
    const name = format in choices ? choices[format].name : "Text"

    //console.log("Block type:", type)

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button tooltip="Paragraph style" style={{ justifyContent: "flex-start" }} {...bindTrigger(popupState)}>Format: {name}</Button>
        <Menu {...bindMenu(popupState)}>
          {order.map(k => [k, choices[k]]).map(([k, v]) => (
            <MenuItem key={k} value={k} onClick={e => { setFormat(k); popupState.close(e) }}>
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
    const { format, content, setImported } = this.props

    switch (format) {
      case "text": return <ImportText content={content} setImported={setImported} />
    }
    return null
  }
}
