//*****************************************************************************
//*****************************************************************************
//
// Electron Main process
//
//*****************************************************************************
//*****************************************************************************

//-----------------------------------------------------------------------------
// Main Window
//-----------------------------------------------------------------------------

const electron = require('electron');
const {BrowserWindow} = electron;
const {globalShortcut} = electron;
const windowStateKeeper = require('electron-window-state');

const url = require('url') 
const path = require('path')
const isDev = require("electron-is-dev");
const debug = require("electron-debug")

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
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "./backend/services.js")
    },
  });

  mainWindowState.manage(mainWindow);

  mainWindow.on("closed", () => (mainWindow = null));

  mainWindow.setMenu(null);

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
// Application
//-----------------------------------------------------------------------------

const {app} = electron;

app.on("ready", () => {
  createWindow();
  globalShortcut.register('CommandOrControl+Q', () => { app.quit() });
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
