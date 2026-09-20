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

// Force only after confirming unsaved changes and finishing any save.
export function appQuit(forced = false) {
  return syscall("quit", forced);
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
  return syscall("zoom", factor);
}

export async function appZoomIn() {
  const zoom = await appZoomGet();
  return appZoomTo(zoom + 0.101);
}

export async function appZoomOut() {
  const zoom = await appZoomGet();
  return appZoomTo(zoom - 0.099);
}

export function appZoomReset() {
  return appZoomTo(1);
}

export function getSpellcheckLanguages() {
  return syscall("getSpellcheckLanguages");
}

export function setSpellcheck(lang, enabled) {
  return syscall("setSpellcheck", lang, enabled);
}

export function getUpdateStatus() {
  return syscall("getUpdateStatus");
}

export function downloadUpdate() {
  return syscall("downloadUpdate");
}

// Finish saving documents before calling this function.
export function quitAndInstall() {
  return syscall("quitAndInstall");
}

// Returns an unsubscribe function. Only status data crosses the preload bridge.
export function onUpdateStatus(callback) {
  return window.ipc.onUpdateStatus(callback);
}
