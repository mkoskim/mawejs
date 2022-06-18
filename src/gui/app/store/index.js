//*****************************************************************************
//*****************************************************************************
//
// Application state
//
//*****************************************************************************
//*****************************************************************************

import { configureStore } from "@reduxjs/toolkit";

import cwdReducer, {CWD} from "./cwdSlice"
import docReducer, {document} from "./docSlice"
import stashReducer, {stash} from "./stashSlice"
import workspaceReducer, {workspace, docByID} from "./workspaceSlice"

//-----------------------------------------------------------------------------
// Export store

export default configureStore({
  reducer: {
    cwd: cwdReducer,
    doc: docReducer,
    stash: stashReducer,
    workspace: workspaceReducer,
  }
})

//-----------------------------------------------------------------------------
// Export actions

export {
  CWD,
  document,
  stash,
  workspace, docByID,
}
