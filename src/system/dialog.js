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

function dlgcall(cmd, ...args) {
  return ipcCall("dialog", cmd, ...args);
  //return window.ipc.invoke("dialog", cmd, ...args);
}

//-----------------------------------------------------------------------------
// System dialogs
//-----------------------------------------------------------------------------

export function fileOpenDialog(options) {
  return dlgcall("openfile", options);
}

export function fileSaveDialog(options) {
  return dlgcall("savefile", options);
}

export function messageBox(options) {
  return dlgcall("messagebox", options);
}

export async function confirmUnsavedDlg(file) {
  const filename = file?.id ?? "<Untitled>";
  const {response} = await messageBox({
    type: "warning",
    title: "Unsaved changes",
    message: `The file "${filename}" has unsaved changes. Do you want to save them?`,
    buttons: ["Save", "Don't Save", "Cancel"],
    defaultId: 0,
    cancelId: 2,
  });
  switch(response) {
    case 0: return "save";
    case 1: return "skip";
  }
  return "cancel"
}