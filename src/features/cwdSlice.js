//*****************************************************************************
//*****************************************************************************
//
// Current working directory
//
//*****************************************************************************
//*****************************************************************************

import { createSlice } from "@reduxjs/toolkit";

const fs = require("../storage/localfs")

/* Set by location (home, root, ...) or from favorites */
/*
useEffect(() => {
  if(dir !== directory) resolvedir();

  async function resolvedir() {
    console.log("set dir:", directory, location);
    const d = directory
      ? (await fs.fstat(directory)).id
      : await fs.getlocation(location ? location : "home");
    console.log("dir", d);
    setState(state => ({...state, dir: d}));
  }
}, [directory, location]);
*/

export const cwdSlice = createSlice({
  name: "cwd",
  initialState: {
    path: ".",
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

export const CWD = {
  ...cwdSlice.actions
}

export default cwdSlice.reducer
