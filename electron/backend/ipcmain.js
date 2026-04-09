//*****************************************************************************
//*****************************************************************************
//
// Electron IPC bindings
//
//*****************************************************************************
//*****************************************************************************

import { ipcMain, BrowserWindow } from "electron";

import { ipcDispatch } from "./ipcdispatch.js";

export function initIpcDispatch() {
  ipcMain.handle("app", async (event, cmd, ...args) => {
    return await ipcDispatch(BrowserWindow.fromWebContents(event.sender), "app", cmd, ...args);
  });
  ipcMain.handle("hostfs", async (event, cmd, ...args) => {
    return await ipcDispatch(BrowserWindow.fromWebContents(event.sender), "hostfs", cmd, ...args);
  });
  ipcMain.handle("dialog", async (event, cmd, ...args) => {
    return await ipcDispatch(BrowserWindow.fromWebContents(event.sender), "dialog", cmd, ...args);
  });
}
