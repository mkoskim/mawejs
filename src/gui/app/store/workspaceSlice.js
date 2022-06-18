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

import { createSlice } from "@reduxjs/toolkit";
import { uuid } from "../../../util";

const fs = require("../../../storage/localfs")
const path = require("path")
const mawe = require("../../../document")

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    current: undefined,
    workspaces: {}
  },
  reducers: {
    create: (state, action) => {
      const {payload} = action;
      const id = payload.id ?? uuid()
      state.workspaces[id] = { ...payload, id};
      if(!payload.nosync) sync(state)
    },
    switchto: (state, action) => {
      const {id, nosync} = action.payload
      state.current = id
      if(!nosync) sync(state)
    },
    setName: (state, action) => {
      const { name, nosync } = action.payload
      const id = action.payload.id ?? state.current
      state.workspaces[id].name = name
      if(!nosync) sync(state)
    },
    setFiles: (state, action) => {
      //console.log("setFiles:", action.payload)
      const { files, nosync } = action.payload
      const id = action.payload.id ?? state.current
      state.workspaces[id].files = files
      if(!files.filter(f => f.id === state.workspaces[id].edit?.id).length) {
        state.workspaces[id].edit = undefined
        state.workspaces[id].loaded = undefined
      }
      if(!nosync) sync(state)
    },
    setEdit: (state, action) => {
      const {file, nosync} = action.payload;
      const id = action.payload.id ?? state.current
      const files = [...state.workspaces[id].files]
      if(!files.filter(f => f.id === file.id).length) {
        state.workspaces[id].files = [...files, file]
      }
      state.workspaces[id].edit = file
      state.workspaces[id].loaded = false
      if(!nosync) sync(state)
    },
    unsetEdit: (state, action) => {
      const {nosync} = action.payload;
      const id = action.payload.id ?? state.current
      state.workspaces[id].edit = undefined
      state.workspaces[id].loaded = undefined
      if(!nosync) sync(state)
    },
    setLoaded: (state, action) => {
      const {status} = action.payload;
      const id = action.payload.id ?? state.current
      state.workspaces[id].loaded = status
    }
  }
})

async function sync(state) {
  var item = {
    current: state.current,
    workspaces: {}
  }

  for(const id in state.workspaces) {
    const {name, edit, files} = state.workspaces[id]
    item.workspaces[id] = {
      id,
      name,
      edit: edit ? edit.id : undefined,
      files: files.map(f => f.id)
    }
  }

  fs.settingswrite("workspaces.json", JSON.stringify(item, null, 2))
}

export default workspaceSlice.reducer

var docs = {}

export function docByID(id) {
  //console.log("docByID:", id)
  //console.log("Docs:", docs)
  return docs[id]
}

export const workspace = {
  ...workspaceSlice.actions,

  //---------------------------------------------------------------------------
  // Load workspaces from settings file

  init: () => {
    return async (dispatch, getState) => {
      try {
        const content = await fs.settingsread("workspaces.json")
        const parsed = JSON.parse(content)
        //console.log("Loaded workspaces:", parsed)
        for(const id in parsed.workspaces) {
          const {name, edit, files} = parsed.workspaces[id]
          const statd = await Promise.all(files.map(f => fs.fstat(f)))
          //console.log(edit)
          //console.log(statd)
          //console.log("Stat'd:", statd)
          dispatch(workspace.create({
            id,
            name,
            edit: edit ? statd.filter(f => f.id === edit)[0] : undefined,
            files: statd,
            nosync: true
          }))
        }
        dispatch(workspace.switchto({id: parsed.current, nosync: true}))
      } catch(err) {
        console.log("ERROR: workspaces.js:", err)
        const id = uuid()
        dispatch(workspace.create({id, name: "<New>", files: [], nosync: true}))
        dispatch(workspace.switchto({id}))
      }
    }
  },

  //---------------------------------------------------------------------------
  // Open a doc
  open: (file) => {
    return async (dispatch, getState) => {
      console.log("workspace.open:", file);

      try {
        if(!(file.id in docs)) {
          console.log("Loading")
          const content = await mawe.load(file)
          docs[file.id] = content;
          //console.log("Docs:", docs);
        }

        dispatch(workspace.setLoaded({status: true}))
        //dispatch(workspace.setEdit({file}))
      } catch(err) {
        console.log("ERROR: workspace.open:", err)
      }
    }
  },
}
