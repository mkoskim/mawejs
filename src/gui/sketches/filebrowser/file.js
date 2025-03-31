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
import { CSS } from "@dnd-kit/utilities"
import { action } from "../../app/store"

import {
  Box, FlexBox, VBox, HBox, Filler, Separator,
  Button, ButtonGroup, Input, SearchBox,
  Breadcrumbs,
  ToolBox,
  Label, Icon,
  addClass,
} from "../../common/factory";

const fs = require("../../storage/localfs")
const { suffix2format } = require('../../../document/util');

//-----------------------------------------------------------------------------

export function FileEntry({file, options}) {
  const dispatch = useDispatch();

  const {
    icon,
    disabled, selected,
  } = FileItemConfig(file, options)

  const className = addClass(
    options.type === "card" ? "FileCard" : undefined,
    options.type === "row" ? "File" : undefined,
    disabled ? "disabled" : undefined,
    selected ? "selected" : undefined,
  )

  const callback = file.access ? (() => dispatch(onOpen(file))) : undefined

  if(options.type === "card") {
    return <HBox
      className={className}
      onDoubleClick={callback}
      >
      {icon}
      <Label style={{marginLeft: "8pt"}} text={file.name}/>
    </HBox>;
  }
  if(options.type === "row") {
    return <tr
      className={className}
      onDoubleClick={callback}
    >
      <td className="FileIcon">{icon}</td>
      <td className="FileName"><Label text={file.name}/></td>
      <td className="FileDir"><Label text={file.relpath}/></td>
    </tr>;
  }
  return null;
}

//-----------------------------------------------------------------------------

export function FileItemConfig(file, options) {
  if(options.selected && file.id in options.selected) {
    return {
      icon: <Icon.FileType.Selected style={{color: "#51585b"}}/>,
      selected: true,
    }
  }
  switch (file.type) {
    case "folder": return {
      icon: <Icon.FileType.Folder style={{color: "grey" /*"#51585b"*/ /*"#77b4e2"*/}}/>,
      disabled: !file.access,
    }
    case "file": return {
      icon: <Icon.FileType.File style={{color: "#51585b"}}/>,
      disabled: !file.access,
    }
    default: return {
      icon: <Icon.FileType.Unknown style={{color: "grey"}}/>,
      disabled: true,
    }
  }
}

function onOpen(file) {
  return (dispatch, getState) => {
    console.log("Click:", file.id)

    dispatch(action.CWD.search(null))

    if (file.type === "folder") {
      dispatch(action.CWD.chdir(file.id));
      return
    }

    //const {inform} = options;

    if (suffix2format(file)) {
      dispatch(action.workspace.selectFile({file}))
      return
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