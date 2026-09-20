//-----------------------------------------------------------------------------
// Create bridge from React app running in browser to Electron
//-----------------------------------------------------------------------------

const {contextBridge, ipcRenderer} = require("electron");

//-----------------------------------------------------------------------------
// Exposing full interfaces
//-----------------------------------------------------------------------------

contextBridge.exposeInMainWorld("ipc", {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  onUpdateStatus: callback => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on("app:update-status", listener);
    return () => ipcRenderer.removeListener("app:update-status", listener);
  },
});
