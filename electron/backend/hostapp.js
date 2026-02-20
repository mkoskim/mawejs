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
  zoomIn,
  zoomOut,
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

function zoomIn(window) {
  console.log("Zoom in")
  const currentZoom = window.webContents.getZoomFactor();
  window.webContents.setZoomFactor(currentZoom + 0.1);
}

function zoomOut(window) {
  console.log("Zoom out")
  const currentZoom = window.webContents.getZoomFactor();
  window.webContents.setZoomFactor(currentZoom - 0.1);
}
