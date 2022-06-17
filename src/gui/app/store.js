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

//-----------------------------------------------------------------------------
// Export store

export default configureStore({
  reducer: {
    cwd: cwdReducer,
    doc: docReducer,
    stash: stashReducer,
  }
})

//-----------------------------------------------------------------------------
// Export actions

export {
  CWD,
  document,
  stash
}

//-----------------------------------------------------------------------------
// Export some common data

// Fetch loaded Document by UUID
export var docByUUID = {

}
