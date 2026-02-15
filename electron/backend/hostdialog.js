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
}

//-----------------------------------------------------------------------------

async function openFile(browserWindow, options) {
  return dialog.showOpenDialog(browserWindow, options)
}

async function saveFile(browserWindow, options) {
  return dialog.showSaveDialog(browserWindow, options)
}
