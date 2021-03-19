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

const fs = require("fs");
console.log("fs", fs);
contextBridge.exposeInMainWorld("fs", fs);

//const app = electron.app || electron.remote.app;
//console.log("app", app);
//contextBridge.exposeInMainWorld("app", app);

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
