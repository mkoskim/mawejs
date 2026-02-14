//*****************************************************************************
//*****************************************************************************
//
// Application state
//
//*****************************************************************************
//*****************************************************************************

import { configureStore } from "@reduxjs/toolkit";

import cwdReducer, {CWDAction} from "./cwdSlice"
import docReducer, {docAction, docByID, docUpdate} from "./docSlice"
import workspaceReducer, {workspaceAction} from "./workspaceSlice"

export{docByID, docUpdate}

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
