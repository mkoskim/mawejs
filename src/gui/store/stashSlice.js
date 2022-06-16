//*****************************************************************************
//*****************************************************************************
//
// Stashing files for later use
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import { createSlice } from "@reduxjs/toolkit";

const fs = require("../../storage/localfs")

export const stashSlice = createSlice({
  name: "stash",
  initialState: {
    stashed: [],
  },
  reducers: {
    push: (state, action) => {
      state.stashed.push(action.payload)
    },
  }
})

export default stashSlice.reducer

export const stash = {
  ...stashSlice.actions,

  /*
  load: (fileid) => {
    return async (dispatch, getState) => {
      console.log("Loading:", fileid)
      //const dir = await fs.fstat(directory)
      //console.log("Dir:", directory, "->", dir.id);
      //dispatch(CWD.chdir(dir.id))
    }
  },
  */
}
