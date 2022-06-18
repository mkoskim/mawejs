//*****************************************************************************
//*****************************************************************************
//
// Application state
//
//*****************************************************************************
//*****************************************************************************

import { configureStore } from "@reduxjs/toolkit";

import cwdReducer, {CWD} from "./slices/cwdSlice"
import docReducer, {document} from "./slices/docSlice"
import stashReducer, {stash} from "./slices/stashSlice"
import workspaceReducer, {workspace, docByID} from "./slices/workspaceSlice"

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
