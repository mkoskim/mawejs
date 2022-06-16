//*****************************************************************************
//*****************************************************************************
//
// Application state
//
//*****************************************************************************
//*****************************************************************************

import { configureStore } from "@reduxjs/toolkit";
import cwdReducer from "./cwdSlice"
import docReducer from "./docSlice"
import stashReducer from "./stashSlice"

export default configureStore({
  reducer: {
    cwd: cwdReducer,
    doc: docReducer,
    stash: stashReducer,
  }
})

export var docs = {

}
