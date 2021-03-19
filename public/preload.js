//-----------------------------------------------------------------------------
// Create bridge from React app running in browser to Electron
//-----------------------------------------------------------------------------

const {
    contextBridge,
    ipcRenderer
} = require("electron");

const fs = require("fs");

//-----------------------------------------------------------------------------
// Exposing full interfaces
//-----------------------------------------------------------------------------

contextBridge.exposeInMainWorld("ipc", ipcRenderer);
contextBridge.exposeInMainWorld("fs", fs);

//-----------------------------------------------------------------------------
// More controlled way to expose interfaces
//-----------------------------------------------------------------------------

    /*
    "api", {
        send: (channel, data) => {
            // whitelist channels
            //let validChannels = ["toMain"];
            //if (validChannels.includes(channel)) {
                return ipcRenderer.sendSync(channel, data);
            //}
        },
        receive: (channel, func) => {
            //let validChannels = ["fromMain"];
            //if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => fn(...args));
            //}
        }
    }
);
*/
