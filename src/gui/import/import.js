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

  return null;
}