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

import { ItemTypes } from '../common/dnd'
import { useDrop } from 'react-dnd'

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
import React from "react";

//-----------------------------------------------------------------------------

export function Workspace() {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FILE,
    drop: () => ({ name: 'Workspace' }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))
  const isActive = canDrop && isOver

  const className = addClass(
    "Workspace dragTarget",
    canDrop ? "canAccept" : undefined,
    isActive ? "canDrop" : undefined,
  )

  return <div ref={drop} className={className}></div>
}
