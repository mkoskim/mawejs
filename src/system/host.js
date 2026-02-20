//*****************************************************************************
//*****************************************************************************
//
// Accessing system dialogs
//
//*****************************************************************************
//*****************************************************************************

import { ipcCall } from "./ipc";

//-----------------------------------------------------------------------------
// Bridge
//-----------------------------------------------------------------------------

function syscall(cmd, ...args) {
  return ipcCall("app", cmd, ...args);
  //return window.ipc.invoke("app", cmd, ...args);
}

//-----------------------------------------------------------------------------
// System dialogs
//-----------------------------------------------------------------------------

export function appQuit(options) {
  return syscall("quit", options);
}

export function appLog(message) {
  return syscall("log", message);
}

export function appBeep() {
  return syscall("beep");
}

export function appInfo() {
  return syscall("info");
}

export function appZoomIn() {
  return syscall("zoomin");
}

export function appZoomOut() {
  return syscall("zoomout");
}
