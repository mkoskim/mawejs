//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host system dialogs
//
//*****************************************************************************
//*****************************************************************************

module.exports = {
  openFile, saveFile,
}

//-----------------------------------------------------------------------------

const { dialog } = require('electron')

//-----------------------------------------------------------------------------

async function openFile(browserWindow, options) {
  console.log("Open File", options)
  return dialog.showOpenDialog(browserWindow, options)
}

async function saveFile(browserWindow, options) {
  console.log("Open File", options)
  return dialog.showSaveDialog(browserWindow, options)
}
