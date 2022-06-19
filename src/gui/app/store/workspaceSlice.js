//*****************************************************************************
//*****************************************************************************
//
// Editor workspaces
//
//*****************************************************************************
//*****************************************************************************

//-----------------------------------------------------------------------------
// Workspace is fundamentally a list of files. But because we want to share
// the same file in several workspaces, and react to renaming and moving
// correctly, we use indirections: we save files as UUIDs, and use table
// to fetch them.
//-----------------------------------------------------------------------------

/* eslint-disable no-unused-vars */

import { createSlice, current } from "@reduxjs/toolkit";
import { uuid } from "../../../util";

const fs = require("../../../storage/localfs")
const path = require("path")
const mawe = require("../../../document")

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState: { status: false },
  reducers: {
    reset,
    addFile,
    removeFile,
    moveFile,
    selectFile,
  }
})

export default workspaceSlice.reducer
export const workspace = {
  ...workspaceSlice.actions,
  init,
  open,
}

//-----------------------------------------------------------------------------

var docs = {}

export function docByID(id) {
  //console.log("docByID:", id)
  //console.log("Docs:", docs)
  return docs[id]
}

//-----------------------------------------------------------------------------

function reset(state, {payload}) {
  const {value, nosync} = payload
  if(!nosync) sync(value)
  return value
}

function findFile(state, id, file) {
  return state[id].files.find(f => f.id === file.id)
}

function fileIndex(state, id, file) {
  return state[id].files.findIndex(elem => elem.id === file.id)
}

function removeFile(state, {payload}) {
  const {file, nosync} = payload;
  const id = payload.id ?? state.selected

  const index = fileIndex(state, id, file)
  if(index !== -1) {
    state[id].files.splice(index, 1)
  }

  if(state[id].selected?.id === file.id) {
    state[id].selected = undefined
  }

  if(!nosync) sync(state)
}

function addFile(state, {payload}) {
  const {file, nosync} = payload;
  const id = payload.id ?? state.selected

  if(!findFile(state, id, file)) {
    state[id].files = [...state[id].files, file]
    if(!nosync) sync(state)
  }
}

function moveFile(state, {payload}) {
  const {file, index, nosync} = payload;
  const id = payload.id ?? state.selected

  const srcindex = fileIndex(state, id, file);
  if(srcindex === -1) return;

  state[id].files.splice(srcindex, 1)
  state[id].files.splice(index, 0, file)

  if(!nosync) sync(state)
}

function selectFile(state, action) {
  const {file, nosync} = action.payload;
  const id = action.payload.id ?? state.selected
  const ws = state[id]

  if(ws.selected?.id === file.id) return

  if(file) addFile(state, {payload: {id, file, nosync: true}})

  ws.selected = file
  if(!nosync) sync(state)
}

//-----------------------------------------------------------------------------

async function sync(state) {
  fs.settingswrite("workspaces.json", JSON.stringify(state, null, 2))
}

function init() {
  return async(dispatch, getState) => {
    try {
      const content = await fs.settingsread("workspaces.json")
      const value = {
        ...JSON.parse(content),
        status: true,
      }
      dispatch(workspace.reset({value, nosync: true}))
    }
    catch(err) {
      console.log("ERROR: workspaces.js:", err)

      const id = uuid()

      dispatch(workspace.reset({value: {
        status: true,
        selected: id,
        [id]: {
          id: id,
          name: "<New>",
          files: []
        },
      }}))
    }
    finally {
      console.log("Workspace initialized.")
    }
  }
}

//-----------------------------------------------------------------------------

function open(file) {
  return async (dispatch, getState) => {
    console.log("workspace.open:", file);

    if(!(file.id in docs)) {
      console.log("Loading:", file)
      try {
        const content = await mawe.load(file)
        docs[file.id] = content;
      }
      catch(err) {
        console.log("Trying to open:", file)
        console.log("ERROR:", err)
      }
    }

    //dispatch(workspace.setLoaded({status: true}))
    //dispatch(workspace.setEdit({file}))
  }
}
