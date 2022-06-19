//*****************************************************************************
//*****************************************************************************
//
// Application state
//
//*****************************************************************************
//*****************************************************************************

import { configureStore } from "@reduxjs/toolkit";

import cwdReducer, {CWDAction} from "./cwdSlice"
import docReducer, {docAction} from "./docSlice"
import workspaceReducer, {workspaceAction, docByID} from "./workspaceSlice"

export{docByID}

//-----------------------------------------------------------------------------
// Export store

export const store = configureStore({
  reducer: {
    cwd: cwdReducer,
    doc: docReducer,
    workspace: workspaceReducer,
  }
})

//-----------------------------------------------------------------------------
// Export actions

export const action = {
  workspace: workspaceAction,
  CWD: CWDAction,
  doc: docAction,
}
