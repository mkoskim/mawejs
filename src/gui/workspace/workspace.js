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
import { CWD } from "../../features/cwdSlice"
import { document } from "../../features/docSlice"

import { ItemTypes } from '../common/dnd'
import { useDrop } from 'react-dnd'

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
    "Workspace",
    canDrop ? "canAccept" : undefined,
    isActive ? "canDrop" : undefined,
  )

  return <VBox style={{flexGrow: 1}}>
    <ToolBox>
      <Button text="Home"/>
    </ToolBox>
    <div ref={drop} className={className}></div>
  </VBox>
}
