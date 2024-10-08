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
  useDeferredValue,
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

//-----------------------------------------------------------------------------

export function ImportView({doc, updateDoc, buffer, setBuffer}) {
  const {file, ext, content} = buffer

  console.log("File:", file, "Ext:", ext)

  const imported = importTXT(content)

  return <HBox style={{ overflow: "auto" }}>
    <ImportIndex style={{ maxWidth: "300px", width: "300px" }}/>
    <Preview imported={imported}/>
    <ImportSettings doc={doc} updateDoc={updateDoc}/>
  </HBox>
}

//-----------------------------------------------------------------------------

function importTXT(content) {
  const paragraphs = content
    .replaceAll("\r", "")
    //.split(/\n+/)
    .split(/\n/)
    .map(line => line.trim())
    .map(line => ({type: "p", text: line}))
  ;
  return paragraphs
}

//-----------------------------------------------------------------------------

function ImportSettings() {
  return null
}

//-----------------------------------------------------------------------------

function ImportIndex() {
  return null
}

//-----------------------------------------------------------------------------

function Preview({imported}) {

  return <div className="Filler Board">
    <DeferredRender>
      <div className="Sheet Regular">
        {imported.map(elem => <p>
          {elem.text}
          <span style={{marginLeft: "2pt", color: "grey"}}>&para;</span>
          </p>
      )}
      </div>
    </DeferredRender>
  </div>
}