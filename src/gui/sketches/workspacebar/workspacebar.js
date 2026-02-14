//*****************************************************************************
//
// Experimental: Document toolbar
//
//*****************************************************************************

import "./workspacebar.css"

import React, {
  useState,
} from "react"

import {
  Button, Icon, IconButton,
  HBox,
  addClass,
} from "../../common/factory";

//-----------------------------------------------------------------------------

export function WorkspaceBar({doc}) {
  const [workspace, setWorkspace] = useState([
    "ExampleFile1.mawe",
    "ExampleFile2.mawe",
    "ExampleFile3.mawe",
    "ExampleFile4.mawe",
  ])
  const [selected, setSelected] = useState(0)

  return <HBox className="WorkspaceBar">
    {//*
    <HBox className="LeftSide">
      {
        <Button>Workspace</Button>
      }
      {
        //<IconButton tooltip="File Menu"><Icon.Menu/></IconButton>
      }
    </HBox>
    /**/}
    <HBox className="FileTab">

      {workspace.map(function (name, index) {
        return <DocTabItem key={index} index={index} name={name} active={index === selected} setSelected={setSelected}/>
      })}
    </HBox>
    <HBox className="NewItem">
      <IconButton tooltip="New"><Icon.Action.File.New/></IconButton>
      <IconButton tooltip="Open"><Icon.Action.File.Open/></IconButton>
      <IconButton tooltip="Help"><Icon.Help/></IconButton>
      {/*<HBox className="Gap"/>*/}
    </HBox>
    <HBox className="Gap"/>
    <HBox className="RightSide">
      <IconButton tooltip="Quit"><Icon.Action.Quit/></IconButton>
    </HBox>
  </HBox>
}

function DocTabItem({name, active, index, setSelected}) {
  const btn_sx = {borderRadius: "12px"}

  return <HBox
    className={addClass("Item", active ? "Active" : undefined)}
    onClick={e => setSelected(index)}
    >
    <span className="Name">{name}</span>
    <Button
      sx={btn_sx}
      tooltip="Close"
      onClick={e => {console.log("Close:", name); e.stopPropagation();} }
    ><Icon.Close fontSize="12pt"/></Button>
  </HBox>
}
