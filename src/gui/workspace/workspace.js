//*****************************************************************************
//*****************************************************************************
//
// Workspace
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import "./workspace.css"

import React from "react";
import {useState, useEffect} from 'react'
import {useSelector, useDispatch} from "react-redux";
import {docByID, workspace} from "../app/store"

import {FileBrowser} from "../filebrowser";
import {EditFile} from "../editor/editorSlate";
import {Organizer} from "../editor/organizer";

import {Dropzone} from "../common/dnd"

import {
  Box, FlexBox,
  VBox, HBox, VFiller, HFiller,
  Filler, Separator,
  Tooltip, Button, IconButton, ButtonGroup, Input, SearchBox,
  Breadcrumbs,
  ToolBox,
  Label,
  addClass,
  Spinner,
  addHotkeys,
  Icon,
} from "../common/factory";

//-----------------------------------------------------------------------------

// Pick files to workspace

export function Workspace() {
  console.log("Workspace")
  const dispatch = useDispatch()

  const current = useSelector(state => state.workspace.workspaces[state.workspace.current])
  if(!current) return null;
  const edit = current.edit;

  const itemtype = "file"

  if(!edit) {
    return <React.Fragment>
      <LeftSide current={current} container={itemtype}/>
      <FileBrowser.PickFiles container={itemtype} />
    </React.Fragment>
  }

  if(!current.loaded) {
    dispatch(workspace.open(edit))
    return <React.Fragment>
      <LeftSide current={current} edit={edit} container={itemtype}/>
      <Filler><Spinner style={{margin: "auto"}}/></Filler>
    </React.Fragment>
  }

  /*
  return <React.Fragment>
    <LeftSide current={current} edit={edit} container={itemtype}/>
    <EditFile id={edit.id}/>
  </React.Fragment>
  /*/
  return <React.Fragment>
    <LeftSide current={current} edit={edit} container={itemtype}/>
    <Organizer id={edit.id}/>
  </React.Fragment>
  /**/
}

//-----------------------------------------------------------------------------

function LeftSide({current, edit, container, style}) {
  const dispatch = useDispatch()

  //const current = useSelector(state => state.workspace.workspaces[state.workspace.current])

  console.log("Workspace:", current)

  const className = addClass(
    "Workspace",
  )

  return <VBox className={className} style={style}>
    <ToolBox>
      {current.name}
      <Filler/>
      <ButtonGroup>
        <IconButton size="small"><Icon.NewFile/></IconButton>
        <IconButton size="small" onClick={() => dispatch(workspace.unsetEdit({}))}><Icon.AddFiles/></IconButton>
        </ButtonGroup>
      </ToolBox>
    <div
      //accept="File"
      //onDrop={(item, monitor) => console.log("Drop:", item)}
      //onHover={(item, monitor) => console.log("Hover:", item)}
      style={{display: "flex", flexDirection: "column", minHeight: "70%"}}
      >
      {current.files.map(f => <WorkspaceItem key={f.id} file={f} edit={edit}/>)}
    </div>
    </VBox>

  function onDrop(dragResult) {
    const { removedIndex, addedIndex, payload } = dragResult;
    if (removedIndex === null && addedIndex === null) return;

    const {id} = payload

    //let itemToAdd = payload;
    var result = [...current.files]
    if(removedIndex !== null) result.splice(removedIndex, 1)

    // Sanity check: Ensure we don't save the same file two times
    if(result.filter(f => f.id === id).length) {
      console.log("Duplicate:", id)
      return;
    }

    if(addedIndex !== null) result.splice(addedIndex, 0, payload)

    dispatch(workspace.setFiles({files: result}))
  }

  function onRemove(event, file) {
    event.stopPropagation()
    console.log("Removing:", file)
    dispatch(workspace.setFiles({files: current.files.filter(f => f.id !== file.id)}))
    return true
  }

  function onOpen(event, file) {
    event.stopPropagation()
    console.log("Opening:", file)
    dispatch(workspace.setEdit({file}))
    return true
  }

  function WorkspaceItem({file, edit}) {
    const className = addClass(
      "WorkspaceItem",
      (edit && edit.id === file.id) ? "selected" : null
    )

    console.log("Item:", file, edit)

    return <div className={className} onClick={(e) => onOpen(e, file)}>
      {file.name}
      <Button
        style={{marginLeft: "auto"}}
        //minimal={true}
        //small={true}
        //icon={Icons.Close}
        onClick={(e) => onRemove(e, file)}
      />
    </div>
  }
}

//-----------------------------------------------------------------------------
// Sketching structure

// We need to store to app settings the project file/directory. That contains
// workspaces and other stuff.

// If there is no project file, then - what?

// Hmmh... Maybe we do this with tagging? So that files are tagged to
// certain workspace

/*

What to put local storage? What to put to session storage? Sync'ing between storages?

account file? For settings? So, that we can place it to shared drive and share
(certain) settings between different computers.

When there is no settings at all - fresh installation - give some initial
screen to choose what to do: start writing or do something else?

local = {
  // Window settings are always local
}

// It would be best, if workspace files are merged together like a database

account = {
  projectfiles: [
    file1,
    file2
  ],
  current: file   <-- Which one to load first
}

workspaces = {
  file: "xx", // Project file

  // List of available workspaces
  workspaces: {
    // Workspace is a named list of files
    uuid: {
      uuid: "xxx", // Let's give workspaces ID, we need that for react
      name: "X",
      description: "X",
      files: [
        "fdsfds", // <-- Use UUID
      ],
      related: [ // Related files (docs, sketches, ...)

      ]
    }
  },

  // Make uuid -> file mapping table
  // This way, if file is renamed or moved, all the workspaces will find it
  // again
  files: {
    uuid: filename, // Can also be URL to dropbox/gdrive
  },

  // from that, we generate a lookup table of files, so that we know what
  // files are managed in workspaces
}
*/
