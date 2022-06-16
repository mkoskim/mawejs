//*****************************************************************************
//*****************************************************************************
//
// Current working directory
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import { createSlice } from "@reduxjs/toolkit";

const fs = require("../../storage/localfs")

export const docSlice = createSlice({
  name: "doc",
  initialState: {
    uuid: null,
  },
  reducers: {
    open: (state, action) => {
      state.uuid = action.payload
    },
    close: (state) => {
      state.uuid = null
    },
  }
})

export default docSlice.reducer

export const document = {
  ...docSlice.actions,

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
