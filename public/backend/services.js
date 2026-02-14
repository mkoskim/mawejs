//-----------------------------------------------------------------------------
// Create bridge from React app running in browser to Electron
//-----------------------------------------------------------------------------

const electron = require("electron");
const {contextBridge} = electron;

// HACK for https://github.com/sindresorhus/electron-better-ipc/issues/35
//require("electron").ipcRenderer.addListener("fix-event-79558e00-29ef-5c7f-84bd-0bcd9a0c5cf3", () => {});

//-----------------------------------------------------------------------------
// Exposing full interfaces
//-----------------------------------------------------------------------------

const {ipcRenderer} = require('electron-better-ipc');
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
