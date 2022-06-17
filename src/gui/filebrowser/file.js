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
import { CWD } from "../app/store"
import { document } from "../app/store"
import { stash } from "../app/store"

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
  const { icon, color: iconcolor, disabled, type } = FileItemConfig(file)

  const dispatch = useDispatch();

  // Class
  const className = addClass(
    options.type === "card" ? "FileCard" : undefined,
    options.type === "row" ? "File" : undefined,
    disabled ? "disabled" : undefined,
  )

  if(options.type === "card") {
    return <div className={className}>
        <div onDoubleClick={() => !disabled && dispatch(onOpen(file))}>
        <Icon icon={icon} style={{ marginRight: 16 }} color={iconcolor} />
        <span>{file.name}</span>
      </div>
    </div>;
  }
  if(options.type === "row") {
    return <tr
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

export function FileItemConfig(file) {
  switch (file.type) {
    case "folder": return {
      icon: Icons.FileType.Folder,
      color: "#666", //"#77b4e2",
      disabled: !file.access,
    }
    case "file": return {
      icon: Icons.FileType.File,
      color: "#666", //"#51585b",
      disabled: !file.access,
    }
    default: return {
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
          var { docs } = require("../workspace/workspace")
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