//*****************************************************************************
//*****************************************************************************
//
// Electron Main process
//
//*****************************************************************************
//*****************************************************************************

import { app, session, BrowserWindow } from "electron";
import {is} from '@electron-toolkit/utils'
import path from "path"
import os from "os"
import windowStateKeeper from "electron-window-state"
import {initIpcDispatch} from "./backend/ipcdispatch.js";
import localShortcut from "electron-localshortcut";
import { installExtension, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import hostfs from "./backend/hostfs.js";

const __dirname = import.meta.dirname;

//-----------------------------------------------------------------------------
// Print out things for debugging purposes
//-----------------------------------------------------------------------------

console.log("Debug info:")
console.log("- Dirname.:", __dirname)
console.log("- is.dev..:", is.dev)
console.log("- URL.....:", process.env.ELECTRON_RENDERER_URL)
console.log("Versions:")
console.log("- Electron:", process.versions.electron)
console.log("- Chrome..:", process.versions.chrome)
console.log("- Node....:", process.versions.node)
console.log("Directories:")
console.log("- CWD.....:", hostfs.fsGetLocation("cwd"))
console.log("- Exe.....:", hostfs.fsGetLocation("exe"))
console.log("- Resource:", hostfs.fsGetLocation("resources"))
console.log("- Home....:", hostfs.fsGetLocation("home"))
console.log("- AppData.:", hostfs.fsGetLocation("appData"))
console.log("- userData:", hostfs.fsGetLocation("userData"))

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

    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
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

  localShortcut.register(mainWindow, 'F5', () => { mainWindow.webContents.reloadIgnoringCache(); });
  localShortcut.register(mainWindow, 'F12', () => { mainWindow.webContents.toggleDevTools(); });

  if(is.dev && process.env.ELECTRON_RENDERER_URL)
  {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  }
  else{
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

//-----------------------------------------------------------------------------
// Extensions
//-----------------------------------------------------------------------------

function enableExtensions() {
  const extensions = [
    {name: REACT_DEVELOPER_TOOLS, options: { loadExtensionOptions: { allowFileAccess: true } }},
  ]

  return Promise.all(extensions.map(({name, options}) => installExtension(name, options)))
    .then(results => {
      results.forEach(result => console.log(`Added:  ${result.name} / ${result.version}`))
    })
    .catch(err => console.log('Extension error: ', err))
}

//-----------------------------------------------------------------------------
// Application
//-----------------------------------------------------------------------------

app.whenReady().then(async () => {
  if(is.dev) {
    await enableExtensions();
  }
  initIpcDispatch();
  createWindow();
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

})
