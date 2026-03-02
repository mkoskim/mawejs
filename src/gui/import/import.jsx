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
  useContext,
} from 'react';

import {
  VBox, HBox,
  ToolBox,
  Button, IconButton,
  Label, Icon,
  Separator,
  Inform,
  Filler,
  Dialog,
} from "../common/factory";

import { maweFromTree } from "../../document/xmljs/load";

import { Preview } from "./preview";
import { ImportText } from "./importText";

import mammoth from "mammoth"
import fs from "../../system/localfs"
import { CmdContext, doImport } from "../app/context";

//*****************************************************************************
//
// Import view
//
//*****************************************************************************

const formats = {
  "text": { name: "Text", },
}

async function getContent(filename) {
  if (!filename) {
    return {
      loader: navigator.clipboard.readText(),
      format: "text"
    }
  }

  const file = await fs.fstat(filename)
  const ext  = await fs.extname(file.id)

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

export function ImportDialog({ filename, setDialogs }) {
  const setCommand = useContext(CmdContext)

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
    doImport({setCommand, story})
    setDialogs(d => { delete d.importing; })
  }

  function cancel(e) {
    //console.log('Cancel function called'); // Debugging log
    setDialogs(d => { delete d.importing; })
  }

  useEffect(() => {
    getContent(filename)
    .then(({ loader, format }) => {
      loader
      .then(content => {
        setContent(content)
        setFormat(format)
        if (filename) Inform.success(`Loaded: ${filename}`);
      })
      .catch(err => {
        Inform.error(err);
        setDialogs(d => { delete d.importing; })
      })
    })
  }, [filename, setDialogs])

  return <Dialog open={true} onOpenChange={cancel} className="Dialog xl">
    <ToolBox side="top">
      <Label>Import from: {filename ?? "Clipboard"}</Label>
      <Separator />
      <Label>Format: {formats[format]?.name ?? format}</Label>
      <Separator />
      <Filler />

      {/*
      */}
      {/*<SelectFormatButton value={format} setFormat={setFormat}/>*/}

      {//*
      <IconButton color="error" onClick={cancel}><Icon.Close /></IconButton>
      /*/
      <Button disableElevation variant="contained" color="error" onClick={cancel}>
        Cancel
      </Button>
      /**/}
    </ToolBox>

    <HBox style={{ overflow: "auto" }}>
      <Preview imported={imported} />
      <VBox className="Panel">
        <SelectFormat format={format} content={content} setImported={setImported} />
        <Button variant="filled" color="success" onClick={Import}>
          Import
        </Button>
      </VBox>
    </HBox>
  </Dialog>
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

    return <Button tooltip="Paragraph style">Format: {name}</Button>

    /*
          {order.map(k => [k, choices[k]]).map(([k, v]) => (
            <MenuItem key={k} value={k} onClick={e => { setFormat(k) }}>
              {v.name}
            </MenuItem>
          )
          )}

        </Menu>
      </React.Fragment>
      }
    */
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
