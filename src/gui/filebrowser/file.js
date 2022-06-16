//*****************************************************************************
//*****************************************************************************
//
// File presentations
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import "./file.css"

import React from "react"
import { useDispatch } from "react-redux";
import { CWD } from "../../features/cwdSlice"
import { document } from "../../features/docSlice"

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

const fs = require("../../storage/localfs")
const mawe = require("../../document")
const { suffix2format } = require('../../document/util');

//-----------------------------------------------------------------------------

export function FileEntry({file, options}) {
  //const {file, options} = props;
  //this.file = file;
  //this.options = options;
  //this.type = file.type == "folder" ?

  const { icon, color: iconcolor, disabled, type } = FileItemConfig(file)

  // Drag source

  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: file,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult) {
        console.log(`You dropped ${item.name} into ${dropResult.name}!`)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }))

  // Drag target
  const canAccept = type == ItemTypes.FOLDER && options.type == "card";

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: canAccept ? [ItemTypes.FILE, ItemTypes.FOLDER] : [],
    drop: () => (file),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  const isActive = canDrop && isOver

  // Class
  const className = addClass(
    options.type == "card" ? "FileCard" : undefined,
    options.type == "row" ? "File" : undefined,
    disabled ? "disabled" : undefined,
    isDragging ? "isDragged" : undefined,
    canDrop ? "canAccept" : undefined,
    isActive ? "canDrop" : undefined,
  )

  const dispatch = useDispatch();

  if(options.type == "card") {
    return <div ref={drop} className={className}>
        <div ref={drag} onDoubleClick={() => !disabled && dispatch(onOpen(file))}>
        <Icon icon={icon} style={{ marginRight: 16 }} color={iconcolor} />
        <span>{file.name}</span>
      </div>
    </div>;
  }
  if(options.type == "row") {
    return <tr
      ref={drag}
      className={addClass(className, disabled ? "disabled" : undefined)}
      onDoubleClick={() => !disabled && dispatch(onOpen(file))}
    >
      <td className="FileIcon"><Icon icon={icon} color={iconcolor} /></td>
      <td className="FileName">{file.name}</td>
      <td className="FileDir">{file.relpath}</td>
    </tr>;
  }
  return null;
}

//-----------------------------------------------------------------------------

function FileItemConfig(file) {
  switch (file.type) {
    case "folder": return {
      type: ItemTypes.FOLDER,
      icon: Icons.FileType.Folder,
      color: "#666", //"#77b4e2",
      disabled: !file.access,
    }
    case "file": return {
      type: ItemTypes.FILE,
      icon: Icons.FileType.File,
      color: "#666", //"#51585b",
      disabled: !file.access,
    }
    default: return {
      type: ItemTypes.NONE,
      icon: Icons.FileType.Unknown,
      color: "#666", //"grey",
      disabled: true,
    }
  }
}

export function onOpen(file) {
  return (dispatch, getState) => {
    console.log("Click:", file.id)

    dispatch(CWD.search(null))

    if (file.type === "folder") {
      dispatch(CWD.chdir(file.id));
      return
    }

    //const {inform} = options;

    if (suffix2format(file)) {
      // TODO: Implement something to show that we are doing something
      //const key = inform.process(`Loading ${f.name}`);

      mawe.load(file.id)
        .then(content => {
          var { docs } = require("../../features/store")
          const { uuid } = content.story;
          docs[uuid] = content;
          dispatch(document.open(uuid))
          //inform.success(`Loaded ${file.name}`)
        })
        .catch(err => {
          //inform.error(`Open '${file.name}': ${err}`);
        })
      return;
    }

    fs.openexternal(file.id)
      .then(err => {
        if (!err) {
          //inform.success(`Open '${file.name}': ok`)
        } else {
          //inform.error(`Open '${file.name}': ${err}`);
        }
      })
  }
}