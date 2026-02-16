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
import windowStateKeeper from "electron-window-state"
import {initIpcDispatch} from "./backend/ipcdispatch.js";
import localShortcut from "electron-localshortcut";

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
      //sandbox: false, // For electron-better-ipc
      preload: path.join(__dirname, "../preload/index.js")
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

  if(is.dev)
  {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  }
  else{
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    //mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
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

  initIpcDispatch();

  if(is.dev) try {
    console.log("Loading extension:", reactDevToolsPath)
    //await session.defaultSession.loadExtension(reactDevToolsPath)
    //session.defaultSession.loadExtension(reduxDevToolsPath)
  } catch(e) {
    console.log("Error:", e)
  }
  createWindow();
  //localShortcut.register(mainWindow, 'CommandOrControl+Q', () => { app.quit() });
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
