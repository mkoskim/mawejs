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
import { CWD, workspace } from "../app/store"

import {
  Box, FlexBox, VBox, HBox, Filler, Separator,
  Button, ButtonGroup, Input, SearchBox,
  Breadcrumbs,
  ToolBox,
  Label,
  addClass,
  addHotkeys,
} from "../common/factory";

const fs = require("../../storage/localfs")
const { suffix2format } = require('../../document/util');

//-----------------------------------------------------------------------------

export function FileEntry({file, options}) {
  const dispatch = useDispatch();

  const {
    icon, color: iconcolor,
    disabled
  } = FileItemConfig(file, options)

  const className = addClass(
    options.type === "card" ? "FileCard" : undefined,
    options.type === "row" ? "File" : undefined,
    disabled ? "disabled" : undefined,
  )

  const callback = file.access ? (() => dispatch(onOpen(file))) : undefined

  if(options.type === "card") {
    return <div
      item={file}
      itemtype="File"
      className={className}
      onDoubleClick={callback}
      >
      <span>{file.name}</span>
    </div>;
  }
  if(options.type === "row") {
    return <tr
      className={addClass(className, disabled ? "disabled" : undefined)}
      onDoubleClick={callback}
    >
      <td className="FileIcon"></td>
      <td className="FileName">{file.name}</td>
      <td className="FileDir">{file.relpath}</td>
    </tr>;
  }
  return null;
}

//-----------------------------------------------------------------------------

export function FileItemConfig(file) {
  switch (file.type) {
    case "folder": return {
      //icon: Icons.FileType.Folder,
      color: "#666", //"#77b4e2",
      disabled: !file.access,
    }
    case "file": return {
      //icon: Icons.FileType.File,
      color: "#666", //"#51585b",
      disabled: !file.access,
    }
    default: return {
      //icon: Icons.FileType.Unknown,
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
      dispatch(workspace.setEdit({file}))
      dispatch(workspace.open({file}))
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