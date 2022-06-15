//*****************************************************************************
//*****************************************************************************
//
// Application state
//
//*****************************************************************************
//*****************************************************************************

import { configureStore } from "@reduxjs/toolkit";
import cwdReducer from "./cwd/cwdSlice"
import docReducer from "./doc/docSlice"

export default configureStore({
  reducer: {
    cwd: cwdReducer,
    doc: docReducer,
  }
})

export var docs = {

}
