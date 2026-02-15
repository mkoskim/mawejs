//-----------------------------------------------------------------------------
// Create bridge from React app running in browser to Electron
//-----------------------------------------------------------------------------

const {contextBridge, ipcRenderer} = require("electron");

//-----------------------------------------------------------------------------
// Exposing full interfaces
//-----------------------------------------------------------------------------

contextBridge.exposeInMainWorld("ipc", {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
});
