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
            preload: path.join(__dirname, "preload.js")
        },
    });

    home = app.getPath("home");
    console.log(home);

    mainWindowState.manage(mainWindow);

    mainWindow.on("closed", () => (mainWindow = null));
    mainWindow.webContents.openDevTools();

    const url = isDev ?
        'http://localhost:3000' :
        `file://${path.join(__dirname, '../build/index.html')}`
    ;

    console.log("Loading:", url);
    mainWindow.loadURL(url);
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

const {ipcMain} = electron;

const fs = require("fs")

ipcMain.on("readdir", (event, arg) => 
{
    console.log("readdir");
    //root = fs.readdirSync("");
    //event.returnValue = fs.readdirSync("");
    event.returnValue = "done"
});
