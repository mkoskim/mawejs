const {app, BrowserWindow} = require('electron') 
const url = require('url') 
const path = require('path')  
const isDev = require("electron-is-dev");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 900, height: 680 });

  const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
 
  mainWindow.loadURL(startURL);

  mainWindow.on("closed", () => (mainWindow = null));
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
