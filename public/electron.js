//*****************************************************************************
//*****************************************************************************
//
// Electron Main process
//
//*****************************************************************************
//*****************************************************************************

const electron = require('electron');
const isDev = require("electron-is-dev");
const debug = require("electron-debug")

const os = require("os")
const path = require('path')

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
// Electron reloader
//-----------------------------------------------------------------------------

if(isDev) require("electron-reload")(path.join(__dirname, "../src/"))

//-----------------------------------------------------------------------------
// Main Window
//-----------------------------------------------------------------------------

const {BrowserWindow} = electron;
const {globalShortcut} = electron;
const windowStateKeeper = require('electron-window-state');

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
        preload: path.join(__dirname, "./backend/services.js")
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

const {app, session} = electron;

app.whenReady().then(async () => {
  if(isDev) try {
    console.log("Loading extension:", reactDevToolsPath)
    await session.defaultSession.loadExtension(reactDevToolsPath)
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

const ipcmain = require("./backend/ipcmain");
