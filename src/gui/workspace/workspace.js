//*****************************************************************************
//*****************************************************************************
//
// Workspace
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import "./workspace.css"

import { useDispatch } from "react-redux";
import { CWD } from "../store/cwdSlice"
import { document } from "../store/docSlice"

import {
  Icons, Icon, IconSize,
  Box, FlexBox,
  VBox, HBox, VFiller, HFiller,
  Filler, Separator,
  Button, ButtonGroup, Input, SearchBox,
  Breadcrumbs,
  ToolBox,
  Label,
  addClass,
  addHotkeys,
} from "../common/factory";

//-----------------------------------------------------------------------------

export function Workspace() {
  const className = addClass(
    "Workspace dragTarget",
  )

  return <div className={className}></div>
}
