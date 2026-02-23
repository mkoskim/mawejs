//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host system dialogs
//
//*****************************************************************************
//*****************************************************************************

import { dialog } from 'electron'

export default {
  openFile, saveFile,
  messageBox,
}

//-----------------------------------------------------------------------------

async function openFile(browserWindow, options) {
  return dialog.showOpenDialog(browserWindow, options)
}

async function saveFile(browserWindow, options) {
  return dialog.showSaveDialog(browserWindow, options)
}

async function messageBox(browserWindow, options) {
  return dialog.showMessageBox(browserWindow, options)
}
