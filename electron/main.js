//-----------------------------------------------------------------------------
// Main Window
//-----------------------------------------------------------------------------

const {BrowserWindow} = require('electron') 
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
        }
    });

    mainWindowState.manage(mainWindow);

    mainWindow.on("closed", () => (mainWindow = null));
    mainWindow.webContents.openDevTools();
    
    if(isDev)
    {
        mainWindow.loadURL('http://localhost:3000');
    }
    else
    {
        mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
    }

}

//-----------------------------------------------------------------------------
// Application
//-----------------------------------------------------------------------------

const {app} = require('electron') 

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

const { ipcMain } = require("electron");

const fs = require("fs")

ipcMain.on("readdir", (event, arg) => 
{
    console.log("readdir");
    //root = fs.readdirSync("");
    //event.returnValue = fs.readdirSync("");
    event.returnValue = "done"
});
