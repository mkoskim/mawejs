//-----------------------------------------------------------------------------
// Create bridge from React app running in browser to Electron
//-----------------------------------------------------------------------------

const electron = require("electron");
const {contextBridge} = electron;

//-----------------------------------------------------------------------------
// Exposing full interfaces
//-----------------------------------------------------------------------------

const {ipcRenderer} = electron;
contextBridge.exposeInMainWorld("ipc", ipcRenderer);

//-----------------------------------------------------------------------------
// More controlled way to expose interfaces
//-----------------------------------------------------------------------------

// const {ipcRenderer} = electron;

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
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
