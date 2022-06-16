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
import { CWD } from "../../features/cwdSlice"
import { document } from "../../features/docSlice"
import { stash } from "../../features/stashSlice"

import { ItemTypes } from '../common/dnd'
import { useDrag, useDrop } from 'react-dnd'

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
  const dispatch = useDispatch();

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FILE,
    drop: () => ({ name: 'Stash' }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))
  const isActive = canDrop && isOver

  const stashed = useSelector((state) => state.stash.stashed)
  console.log("Stashed:", stashed);

  const className = addClass(
    "Stash", "dragTarget",
    canDrop ? "canAccept" : undefined,
    isActive ? "canDrop" : undefined,
  )

  const style = stashed.length ? {minWidth: 280} : {}

  return <div ref={drop} className={className} style={{background: color, ...style}}>
    {stashed.map(f => <StashFile key={f.id} file={f}/>)}
  </div>

  function StashFile({file}) {
    const { icon, color: iconcolor, disabled, type } = FileItemConfig(file)

    return <div className="FileCard">
        <div onDoubleClick={() => dispatch(onOpen(file))}>
        <Icon icon={icon} style={{ marginRight: 16 }} color={iconcolor} />
        <span>{file.name}</span>
      </div>
    </div>;
  }
}
