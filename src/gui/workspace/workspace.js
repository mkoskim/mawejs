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
import { CWD } from "../app/store"
import { document } from "../app/store"

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

local = {
  // Window settings are always local
}

account = {
  projectfiles: {
    file1,
    file2
  },
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
      supportive: [ // Supportive files (docs, sketches, ...)

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

//-----------------------------------------------------------------------------

function openProjectFile(fileid) {
  // Open project file, which contains workspaces
}

//-----------------------------------------------------------------------------

export function Workspace() {
  const className = addClass(
    "Workspace dragTarget",
  )

  return <div className={className}></div>
}
