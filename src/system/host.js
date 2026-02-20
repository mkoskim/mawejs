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

export function appZoomGet() {
  return syscall("zoom");
}

export function appZoomTo(factor) {
  console.log("Zoom to", factor)
  return syscall("zoom", factor);
}

export async function appZoomIn() {
  const zoom = await appZoomGet();
  return appZoomTo(zoom + 0.1);
}

export async function appZoomOut() {
  const zoom = await appZoomGet();
  return appZoomTo(zoom - 0.1);
}

export function appZoomReset() {
  return appZoomTo(1);
}
