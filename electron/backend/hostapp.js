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
  beep
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
