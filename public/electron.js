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

//-----------------------------------------------------------------------------

ipcMain.on("fs-getpath-sync", (event, arg) =>
{
    var name = arg.name;
    var pathid;

    if(name == "appPath")
    {
        pathid = app.getAppPath();
    }
    else if(name == "root")
    {
        pathid = "/";
    }
    else
    {
        try {
            pathid = app.getPath(name);
        } catch(error)
        {
            pathid = null;
        }
    }
    event.returnValue = pathid;
});

//-----------------------------------------------------------------------------

function filetype(dirent)
{
    if(dirent.isDirectory()) return "folder";
    return "file";
}

ipcMain.on("fs-readdir-sync", (event, arg) => 
{
    console.log("readdir:", arg.path);

    var dirent;
    
    try
    {
        dirent = fs.lstatSync(arg.path);
    } catch(error)
    {
        event.returnValue = null;
        return;
    }
    
    var files = [];

    if(dirent.isDirectory())
    {
        files = fs.readdirSync(arg.path, {withFileTypes: true});
        event.returnValue = files.map(dirent => { return { name: dirent.name, type: filetype(dirent)}; });
    }
    else
    {
        console.log(dirent);
        event.returnValue = [ { name: path.basename(arg.path), type: filetype(dirent) } ];
    }
});
