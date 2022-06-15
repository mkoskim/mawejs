//*****************************************************************************
//*****************************************************************************
//
// Current working directory
//
//*****************************************************************************
//*****************************************************************************

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

export const document = {
  ...docSlice.actions
}

export default docSlice.reducer
