//*****************************************************************************
//*****************************************************************************
//
// File import view
//
//*****************************************************************************
//*****************************************************************************

//import "./styles/export.css"
import "../common/styles/sheet.css"

import React, {
  useMemo, useCallback,
  useState,
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

//*****************************************************************************
//
// Import view
//
//*****************************************************************************

export function ImportView({doc, updateDoc, buffer, setBuffer}) {
  const {file, ext, content} = buffer

  console.log("File:", file, "Ext:", ext)

  switch(ext) {
    case ".txt": return <ImportTXT doc={doc} updateDoc={updateDoc} content={content} setBuffer={setBuffer}/>
  }
  return null
}

//*****************************************************************************
//
// Text import
//
//*****************************************************************************

function ImportTXT({content, setBuffer, doc, updateDoc}) {

  const [linebreak, setLinebreak] = useState("\n\n")

  const imported = importTXT(content, linebreak)

  return <HBox style={{ overflow: "auto" }}>
    <VBox>
      <Label>Text import</Label>
    </VBox>
    <Preview imported={imported}/>
    <ImportIndex style={{ maxWidth: "300px", width: "300px" }}/>
    </HBox>
}

//-----------------------------------------------------------------------------

function importTXT(content, linebreak) {
  const paragraphs = content
    .replaceAll("\r", "")
    //.split(/\n+/)
    .split(linebreak)
    .map(line => line.replaceAll("\n", " "))
    .map(line => line.trim())
    .map(line => ({type: "p", text: line}))
  ;
  return paragraphs
}

//*****************************************************************************
//
// Import preview
//
//*****************************************************************************

function ImportIndex() {
  return null
}

//-----------------------------------------------------------------------------

function Preview({imported}) {

  return <div className="Filler Board">
    <DeferredRender>
      <div className="Sheet Regular">
        {imported && imported.map(elem => <p>
          {elem.text}
          <span style={{marginLeft: "2pt", color: "grey"}}>&para;</span>
          </p>
      )}
      </div>
    </DeferredRender>
  </div>
}