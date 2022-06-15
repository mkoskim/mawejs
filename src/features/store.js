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

export default configureStore({
  reducer: {
    cwd: cwdReducer,
    doc: docReducer,
  }
})

export var docs = {

}
