//*****************************************************************************
//*****************************************************************************
//
// Current working directory
//
//*****************************************************************************
//*****************************************************************************

import { createSlice } from "@reduxjs/toolkit";

const fs = require("../../../storage/localfs")

export const cwdSlice = createSlice({
  name: "cwd",
  initialState: {
    path: null,
    search: null,
    showHidden: false,
  },
  reducers: {
    chdir: (state, action) => {
      const path = action.payload
      state.path = path
      state.search = null
    },
    search: (state, action) => {
      state.search = action.payload
    },
    hidden: (state, action) => {
      state.showHidden = action.payload
    }
  }
})

export default cwdSlice.reducer

export const CWDAction = {
  ...cwdSlice.actions,

  resolve: (directory) => {
    return async (dispatch, getState) => {
      const dir = await fs.fstat(directory)
      console.log("Dir:", directory, "->", dir.id);
      dispatch(CWDAction.chdir(dir.id))
    }
  },
  location: (location) => {
    return async (dispatch, getState) => {
      const dir = await fs.getlocation(location ?? "home");
      console.log("Location:", location, "->", dir);
      dispatch(CWDAction.chdir(dir))
    }
  },
}
