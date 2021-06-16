//-----------------------------------------------------------------------------
// Create fake environment for API calls
//-----------------------------------------------------------------------------

global.window = {
  ipc: {
    callMain: require("../public/backend/ipcdispatch").ipcDispatch,
  },
}
