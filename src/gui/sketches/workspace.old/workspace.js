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
import { useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";
import {action, docByID } from "../../app/store"

import { FileBrowser } from "../../filebrowser";

import {
  DndContext,
  useSensors, useSensor, MouseSensor,
  SortableContext, SortableItem
} from "../common/dnd"

import {
  Grid, Box, FlexBox,
  VBox, HBox, VFiller, HFiller,
  Filler, Separator,
  Tooltip, Button, IconButton, ButtonGroup, Input, SearchBox,
  Breadcrumbs,
  ToolBox,
  Label,
  addClass,
  Spinner, Loading,
  Icon,
} from "../../common/factory";

//-----------------------------------------------------------------------------

// Pick files to workspace

export function Workspace() {
  console.log("Workspace")

  const dispatch = useDispatch()

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 15 } })
  )

  const current = useSelector(state => state.workspace[state.workspace.selected])

  console.log("Current=", current)
  if (!current) return null;

  //if(!edit)
  {
    return <HBox className="ViewPort">
      <DndContext onDragEnd={onDrop} sensors={sensors}>
        <SideBar workspace={current} style={{minWidth: "25%", maxWidth: "25%"}}/>
        <FileBrowser.PickFiles selected={current.files} style={{width: "75%"}}/>
      </DndContext>
    </HBox>
  }

  //---------------------------------------------------------------------------

  function SideBar({ workspace, style }) {

    const { files, selected } = workspace;

    const className = addClass(
      "Workspace",
    )

    return <VBox className={className} style={style}>
      <ToolBox>
        <Label text={workspace.name}/>
        <Filler />
        <Button variant="text"><Icon.NewFile /></Button>
      </ToolBox>
      <div className="TabName"><Label text="Files"/></div>
      <VBox className="FilesTab">
        <SortableContext items={files}>
          {files.map(f => <WorkspaceItem key={f.id} id={f.id} file={f} selected={selected} />)}
        </SortableContext>
      </VBox>
      <div className="TabName"><Label text="Related"/></div>
      <VBox className="RelatedTab">
      </VBox>
    </VBox>
  }

  //---------------------------------------------------------------------------

  function onDrop({ active, over }) {
    if (!over) return;
    if (active.id === over.id) return;

    console.log("Move:", active.id, "->", over.id)
    console.log("Active:", active)

    const where = current.files.findIndex(file => file.id === over.id)
    console.log("Index:", where)

    dispatch(action.workspace.moveFile({
      file: active.data.current.content,
      index: where,
    }))
  }

  function onRemove(event, file) {
    event.stopPropagation()
    console.log("Removing:", file)
    dispatch(action.workspace.removeFile({ file }))
  }

  function onOpen(event, file) {
    event.stopPropagation()
    console.log("Opening:", file)
    dispatch(action.workspace.selectFile({ file }))
    dispatch(action.doc.open({ file }))
  }

  //---------------------------------------------------------------------------

  function WorkspaceItem({ file, selected }) {
    const className = addClass(
      "WorkspaceItem",
      (selected?.id === file.id) ? "selected" : null
    )

    return (
      <SortableItem
        id={file.id}
        type="Doc"
        content={file}
        className={className}
        onClick={(e) => onOpen(e, file)}
      >
        <Label className="Name" text={file.name}/>
        <Filler />
        <IconButton onClick={(e) => onRemove(e, file)}>
          <Icon.Close />
        </IconButton>
      </SortableItem>
    )
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
