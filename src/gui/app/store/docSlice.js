//*****************************************************************************
//*****************************************************************************
//
// Current working directory
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import { createSlice } from "@reduxjs/toolkit";
import {mawe} from "../../../document"

const fs = require("../../../storage/localfs")

export const docSlice = createSlice({
  name: "doc",
  initialState: {
    status: false,
  },
  reducers: {
    reset,
    loading: (state, {payload}) => {
      const {file, nosync} = payload
      state.loading = true
      state.edit = file;
    },
    loaded: (state, {payload}) => {
      const {file, nosync} = payload
      state.loading = null
      state.edit = file;
      if(!nosync) sync(state)
    },
    close: (state, {payload}) => {
      const {nosync} = payload
      state.loading = null
      state.edit = null
      if(!nosync) sync(state)
    },
  }
})

export default docSlice.reducer

export const docAction = {
  ...docSlice.actions,
  init,
  open,
}

//-----------------------------------------------------------------------------

function reset(state, {payload}) {
  const {value, nosync} = payload
  if(!nosync) sync(value)
  return value
}

//-----------------------------------------------------------------------------

var docs = {}

export function docByID(id) {
  //console.log("docByID:", id)
  //console.log("Docs:", docs)
  return docs[id]
}

export function docUpdate(id, content) {
  docs[id] = content
}

//-----------------------------------------------------------------------------

function open({file}) {
  return async (dispatch, getState) => {
    console.log("doc.open:", file);
    const {id} = file;

    if(!(id in docs)) {
      console.log("doc.open: Loading:", file)
      dispatch(docAction.loading({file}))
      try {
        const content = await mawe.load(file)
        docs[id] = content;
        dispatch(docAction.loaded({file}))
        console.log("doc.open: Loaded", content)
      }
      catch(err) {
        console.log(err)
      }
    } else {
      dispatch(docAction.loaded({file}))
    }
  }
}

//-----------------------------------------------------------------------------

const settingsfile = "settings_doc.json"

async function sync(state) {
  fs.settingswrite(settingsfile, JSON.stringify(state, null, 2))
}

function init() {
  return async(dispatch, getState) => {
    try {
      const content = await fs.settingsread(settingsfile)
      const {edit, loading, ...parsed} = JSON.parse(content)
      if(edit) {
        const value = {
          ...parsed,
          status: true,
          loading: true,
          edit,
        }
        dispatch(docAction.reset({value, nosync: true}))
        dispatch(docAction.open({file: edit}))
      } else {
        const value = {
          ...parsed,
          status: true,
        }
        dispatch(docAction.reset({value, nosync: true}))
      }
    }
    catch(err) {
      console.log(err)

      dispatch(docAction.reset({value: {
        status: true,
      }}))
    }
    finally {
      console.log("Docs initialized.")
    }
  }
}
