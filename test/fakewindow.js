//-----------------------------------------------------------------------------
// Create fake window for API calls
//-----------------------------------------------------------------------------

global.window = {
    ipc: {
      callMain: require("../public/backend/ipcdispatch").ipcDispatch,
    },
  }
  