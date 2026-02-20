//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host system dialogs
//
//*****************************************************************************
//*****************************************************************************

import {app, shell} from "electron";

export default {
  info,
  quit,
  log,
  beep,
  zoom,
}

function info() {
  return {
    name: app.getName(),
    version: app.getVersion(),
  }
}

function quit() {
  app.quit();
}

function log(message) {
  console.log(message)
}

function beep() {
  console.log("Beep")
  //shell.beep()
}

function zoom(window, factor) {
  if (factor !== undefined) {
    const limit = Math.trunc(Math.max(80, Math.min(120, 100*factor)))/100
    window.webContents.setZoomFactor(limit);
    return limit;
  }
  return Math.trunc(window.webContents.getZoomFactor() * 100) / 100;
}
