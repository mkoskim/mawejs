//*****************************************************************************
//*****************************************************************************
//
// Stash DnD target
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import "./stash.css"

import React from "react"
import { useSelector, useDispatch } from "react-redux";
import { CWD } from "../store/cwdSlice"
import { document } from "../store/docSlice"
import { stash } from "../store/stashSlice"

import {
  Icons, Icon, IconSize,
  Box, FlexBox, VBox, HBox, Filler, Separator,
  Button, ButtonGroup, Input, SearchBox,
  Breadcrumbs,
  ToolBox,
  Label,
  addClass,
  addHotkeys,
} from "../common/factory";

import { onOpen, FileItemConfig } from "../filebrowser/file";

//-----------------------------------------------------------------------------

export function Stash({color}) {
  return null
}
