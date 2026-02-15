//*****************************************************************************
//*****************************************************************************
//
// Electron Main process
//
//*****************************************************************************
//*****************************************************************************

import electron from "electron";
import { app, session, BrowserWindow, globalShortcut } from "electron";
import isDev from "electron-is-dev";
import debug from "electron-debug"
import os from "os"
import path from "path"
import windowStateKeeper from "electron-window-state"
import {ipcDispatch} from "./backend/ipcdispatch.js";
import { ipcMain as ipc } from "electron-better-ipc";

const __dirname = import.meta.dirname;

//-----------------------------------------------------------------------------
// Print out things for debugging purposes
//-----------------------------------------------------------------------------

console.log("Debug info:")
console.log("- Dirname.:", __dirname)
console.log("- NODE_ENV:", process.env.node)
console.log("- isDev...:", isDev)
console.log("Versions:")
console.log("- Electron:", process.versions.electron)
console.log("- Chrome..:", process.versions.chrome)
console.log("- Node....:", process.versions.node)

//-----------------------------------------------------------------------------
// Main Window
//-----------------------------------------------------------------------------

var mainWindow = null;

async function createWindow()
{
  var mainWindowState = windowStateKeeper({
    minWidth: 400,
    minHeight: 300
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,

    icon: path.join(__dirname, "./favicon.png"),

    webPreferences: {
        nodeIntegration: false,
        sandbox: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "./preload/services.js")
    },

    /*
    // remove the default titlebar
    titleBarStyle: 'hidden',
    // expose window controlls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    titleBarOverlay: {
      //color: "rgba(200, 0, 0, 0)",
      //symbolColor: "#808080",
      height: 32
    },
    /**/
  });

  mainWindowState.manage(mainWindow);

  mainWindow.on("closed", () => (mainWindow = null));

  mainWindow.setMenu(null);
  //console.log("Languages:", mainWindow.webContents.session.availableSpellCheckerLanguages)
  //mainWindow.webContents.session.setSpellCheckerLanguages(['fi'])

  if(isDev)
  {
    debug();
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('http://localhost:3000');
  }
  else{
    mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
  }
}

//-----------------------------------------------------------------------------
// Chrome extensions
//-----------------------------------------------------------------------------

const reactDevToolsPath = path.resolve(".", "local/ReactDevTools")

/*
const reactDevToolsPath = path.join(
  os.homedir(),
  //"/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.24.7_0"
  // "/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.27.8_0"
  //"/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.28.0_0"
  )
*/

/*
const reduxDevToolsPath = path.join(
  os.homedir(),
  "/.config/google-chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/3.0.11_0"
)
*/

//-----------------------------------------------------------------------------
// Application
//-----------------------------------------------------------------------------

app.whenReady().then(async () => {
  if(isDev) try {
    console.log("Loading extension:", reactDevToolsPath)
    //await session.defaultSession.loadExtension(reactDevToolsPath)
    //session.defaultSession.loadExtension(reduxDevToolsPath)
  } catch(e) {
    console.log("Error:", e)
  }
  createWindow();
  //globalShortcut.register('CommandOrControl+Q', () => { app.quit() });

  if(!isDev) {
    globalShortcut.register('F12', () => {
      mainWindow.webContents.openDevTools();
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
  {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null)
  {
    createWindow();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll()
})

//-----------------------------------------------------------------------------
// IPC interface
//-----------------------------------------------------------------------------

// HACK for https://github.com/sindresorhus/electron-better-ipc/issues/35
//require("electron").ipcMain.addListener("fix-event-798e09ad-0ec6-5877-a214-d552934468ff", () => {});

ipc.answerRenderer("app", (params, browserWindow) => { return ipcDispatch("app", params, browserWindow)})
ipc.answerRenderer("hostfs", (params, browserWindow) => { return ipcDispatch("hostfs", params, browserWindow)})
ipc.answerRenderer("dialog", (params, browserWindow) => { return ipcDispatch("dialog", params, browserWindow)})
//ipc.answerRenderer("compress", (params) => { return ipcDispatch("compress", params)})
//ipc.answerRenderer("xml", (params) => { return ipcDispatch("xml", params)})
