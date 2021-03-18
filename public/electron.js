/* Imports */

const {app, BrowserWindow} = require('electron') 
const url = require('url') 
const path = require('path')  
const isDev = require("electron-is-dev");

var windowStateKeeper = require('electron-window-state');

var mainWindow = null;

function createWindow()
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
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
        }
    });

    mainWindowState.manage(mainWindow);

    mainWindow.on("closed", () => (mainWindow = null));

    /*
    if(DEBUG)
    {
        mainWindow.webContents.openDevTools();
    }
    */

    if(isDev)
    {
        mainWindow.loadURL('http://localhost:3000');
    }
    else
    {
        mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
    }

}

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
