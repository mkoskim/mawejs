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
const windowStateKeeper = require('electron-window-state');

const url = require('url') 
const path = require('path')
const isDev = require("electron-is-dev");

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

    if(isDev)
    {
        // TODO: Custom menu for developing
        mainWindow.webContents.openDevTools();
        mainWindow.loadURL('http://localhost:3000');
    }
    else{
        mainWindow.setMenu(null);
        mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
    }
}

//-----------------------------------------------------------------------------
// Application
//-----------------------------------------------------------------------------

const {app} = electron;

app.on("ready", createWindow);

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

//-----------------------------------------------------------------------------
// IPC interface
//-----------------------------------------------------------------------------

const ipcmain = require("./backend/ipcmain");
