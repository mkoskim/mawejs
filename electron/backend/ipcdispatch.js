//*****************************************************************************
//*****************************************************************************
//
// IPC dispatcher
//
//*****************************************************************************
//*****************************************************************************

import { ipcMain, BrowserWindow } from "electron";

import hostapp from "./hostapp.js";
import hostfs from "./hostfs.js";
import dialog from "./hostdialog.js";

export function initIpcDispatch() {
  ipcMain.handle("app", async (event, cmd, ...args) => { return await ipcDispatch(event.sender, "app", cmd, ...args) })
  ipcMain.handle("hostfs", async (event, cmd, ...args) => { return await ipcDispatch(event.sender, "hostfs", cmd, ...args) })
  ipcMain.handle("dialog", async (event, cmd, ...args) => { return await ipcDispatch(event.sender, "dialog", cmd, ...args) })
}

async function ipcDispatch(sender, channel, cmd, ...args) {
  try {
    const browserWindow = BrowserWindow.fromWebContents(sender);
    return {result: await dispatch(browserWindow, channel, cmd, ...args)}
  } catch(e) {
    return {error: {
      name: e.name,
      message: e.message,
      extra: {...e}
    }}
  }
}

function dispatch(browserWindow, channel, cmd, ...args) {
  //console.log("IPC:", channel, cmd, args)

  switch(channel) {
    case "app": {
      switch(cmd) {
        case "info": return hostapp.info(...args)
        case "quit": return hostapp.quit(...args)
        case "log": return hostapp.log(...args)
        case "beep": return hostapp.beep(...args)
        case "zoomin": return hostapp.zoomIn(browserWindow, ...args)
        case "zoomout": return hostapp.zoomOut(browserWindow, ...args)
        default: break;
      }
      throw Error(`IPC: ${channel}/${cmd}: Not implemented.`);
    }
    case "hostfs": {
      switch(cmd) {
        case "fstat": return hostfs.fsGetFileEntry(...args);
        case "parent": return hostfs.fsGetParentDir(...args);
        case "getlocation": return hostfs.fsGetLocation(...args);
        case "read": return hostfs.fsRead(...args);
        case "write": return hostfs.fsWrite(...args);
        case "settingsread": return hostfs.fsSettingsRead(...args);
        case "settingswrite": return hostfs.fsSettingsWrite(...args);
        case "readdir": return hostfs.fsReadDir(...args);
        case "rename": return hostfs.fsRename(...args);
        case "openexternal": return hostfs.fsOpenExternal(...args);
        case "readresource": return hostfs.fsReadResource(...args);
        case "dirname": return hostfs.fsDirname(...args);
        case "relpath": return hostfs.fsRelpath(...args);
        case "basename": return hostfs.fsBasename(...args);
        case "extname": return hostfs.fsExtname(...args);
        case "makepath": return hostfs.fsMakepath(...args);
        default: break;
      }
      throw Error(`IPC: ${channel}/${cmd}: Not implemented.`);
    }
    case "dialog": {
      console.log(cmd, ...args)
      switch(cmd) {
        case "openfile": return dialog.openFile(browserWindow, ...args);
        case "savefile": return dialog.saveFile(browserWindow, ...args);
        default: break;
      }
      throw Error(`IPC: ${channel}/${cmd}: Not implemented.`);
    }
    default: throw Error(`Invalid IPC channel: ${channel}`);
  }
}
