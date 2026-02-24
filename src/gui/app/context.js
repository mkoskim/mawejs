//*****************************************************************************
//
// Application React Contexts to be imported and used
//
//*****************************************************************************

import {
  createContext
} from "react"

import { fileOpenDialog, fileSaveDialog } from "../../system/dialog"
import fs from "../../system/localfs"

import {
  loadDocument, createDocument,
  saveDocument, saveDocumentAs,
  renameDocument,
  decodeBuffer, documentInfo
} from "../slatejs/slateDocument";
import { createDateStamp } from "../../document/util";
import { confirmUnsavedDlg } from "../../system/dialog";
import { appQuit } from "../../system/host"
import { recentRemove, recentAdd } from "./settings"


//-----------------------------------------------------------------------------
// "Command" Context is meant for subcomponents to trigger top level components
// to perform certain operations (loading & saving files, and so on)
//-----------------------------------------------------------------------------

export const CmdContext = createContext(null)

//-----------------------------------------------------------------------------

const filters = [
  { name: 'Mawe Files', extensions: ['moe', 'moex', 'mawe', 'mawe.gz'] },
  { name: 'All Files', extensions: ['*'] }
]

const importFilters = [
  { name: 'Known Files', extensions: ['txt', 'md', "docx"] },
  { name: 'All Files', extensions: ['*'] }
]

//-----------------------------------------------------------------------------
// If we have file, give its path. Otherwise give CWD. System dialogs usually
// have sidebar where you can choose directories like home, documents and so
// on.
//-----------------------------------------------------------------------------

async function getPathForOpen(file) {
  return file?.id ? fs.dirname(file?.id) : fs.getlocation("cwd")
}

async function getPathForSave(file) {
  return file?.id ?? getPathForNew("NewDoc.mawe")
}

async function getPathForNew(filename) {
  return await fs.makepath(await fs.getlocation("cwd"), filename)
}

//-----------------------------------------------------------------------------

export async function askFileToLoad(file) {
  return fileOpenDialog({
    filters,
    defaultPath: await getPathForOpen(file),
    properties: ["OpenFile"],
  })
}

export async function askFileToImport(file) {
  return fileOpenDialog({
    title: "Import File",
    filters: importFilters,
    defaultPath: await getPathForOpen(file),
    properties: ["OpenFile"],
  })
}

export async function askFileToSaveAs(file) {
  return fileSaveDialog({
    filters,
    defaultPath: await getPathForSave(file),
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
}

export async function askFileToRename(file) {
  return fileSaveDialog({
    title: "Rename File",
    buttonLabel: "Rename",
    filters,
    defaultPath: file.id,
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
}

//*****************************************************************************
//
// Application action dispatcher
//
//*****************************************************************************

export async function cmdDispatch(command, args) {
  const {
    dirty,
    doc, updateDoc,
    setSaved,
    recent, setRecent,
    setCommand,
    setImporting,
  } = args;

  const { action } = command
  switch (action) {
    // Higher level actions

    case "req-new": return reqNew(command);
    case "req-open": return reqOpen(command);
    case "req-load": return reqLoad(command);
    case "req-resource": return reqResource(command);
    case "req-import-clipboard": return reqImportClipboard(command);
    case "req-import-file": return reqImportFile(command);
    case "req-save": return reqSave(command);
    case "req-saveas": return reqSaveAs(command);
    case "req-rename": return reqRename(command);
    case "req-close": return reqClose(command);
    case "req-quit": return reqQuit(command);

    // Low level actions

    case "do-load": return docFromFile(command);
    case "do-import": return docImportTree(command);
    case "do-rename": return docRename(command);
    case "do-confirm": return confirmUnsaved();

    // User informing

    // case "success": break; // Handled in App.jsx
    // case "error": break; // Handled in App.jsx
  }
  return

  //---------------------------------------------------------------------------
  // Saving files / confirming unsaved files before operations
  //---------------------------------------------------------------------------

  async function confirmUnsaved() {
    if(!doc) return true;
    if(!dirty) return true;

    const response = await confirmUnsavedDlg(doc.file)
    switch(response) {
      default: return false
      case "skip": return true;
      case "save": break;
    }
    return reqSave();
  }

  async function reqSave() {
    if(!doc) return
    const {file} = doc
    if (file) {
      return await docSave()
    }
    return await reqSaveAs()
  }

  async function reqSaveAs() {
    if(!doc) return
    const {file} = doc
    const { canceled, filePath } = await askFileToSaveAs(file)
    if(canceled) return false
    return await docSaveAs({filename: filePath})
  }

  //---------------------------------------------------------------------------
  // Requests that alter doc, and need confirmation
  //---------------------------------------------------------------------------

  async function reqNew() {
    const proceed = await confirmUnsaved()
    if(!proceed) return
    docFromBuffer({buffer: '<story format="mawe"/>'})
  }

  async function reqResource(command) {
    const proceed = await confirmUnsaved()
    if(!proceed) return
    docFromResource(command)
  }

  async function reqLoad(command) {
    const proceed = await confirmUnsaved()
    if(!proceed) return
    docFromFile(command)
  }

  async function reqOpen() {
    const proceed = await confirmUnsaved()
    if(!proceed) return

    const {file} = doc ?? {}
    const { canceled, filePaths } = await askFileToLoad(file)
    if (!canceled) {
      const [filename] = filePaths
      docFromFile({filename})
    }
  }

  //---------------------------------------------------------------------------

  async function reqImportClipboard() {
    const proceed = await confirmUnsaved()
    if(!proceed) return

    setImporting({ file: undefined, ext: undefined })
  }

  async function reqImportFile() {
    const proceed = await confirmUnsaved()
    if(!proceed) return

    const {file} = doc ?? {}

    const { canceled, filePaths } = await askFileToImport(file)
    if (!canceled) {
      const [filename] = filePaths
      setImporting({ filename })
    }
  }

  //---------------------------------------------------------------------------

  async function reqRename() {
    const {file} = doc
    const { canceled, filePath } = await askFileToRename(file)
    if (!canceled) {
      const [filename] = filePath
      docRename({filename})
    }
  }

  //---------------------------------------------------------------------------

  async function reqClose() {
    const proceed = await confirmUnsaved()
    if(!proceed) return
    docClose()
  }

  async function reqQuit() {
    const proceed = await confirmUnsaved()
    if(!proceed) return
    appQuit()
  }

  //---------------------------------------------------------------------------
  // Low level actions
  //---------------------------------------------------------------------------

  function docFromBuffer({ buffer }) {
    const content = createDocument(buffer)
    setSaved(content)
    updateDoc(content)
  }

  function docImportTree({ story }) {
    updateDoc(story)
    setSaved(null)
  }

  function docFromFile({ filename }) {
    loadDocument(filename)
    .then(content => {
      setSaved(content)
      updateDoc(content)
      setRecent(recentAdd(recent, content.file))
      console.log("Loaded:", content.file)
      respSuccess({setCommand, message: `Loaded: ${content.file.name}`});
    })
    .catch(err => {
      setRecent(recentRemove(recent, { id: filename }))
      Inform.error(err)
    })
  }

  function docFromResource({ filename }) {
    fs.readResource(filename)
    .then(buffer => docFromBuffer({ buffer: decodeBuffer(buffer) }))
    .catch(err => respError({setCommand, message: err}))
  }

  function insertHistory(doc) {
    const date = createDateStamp()
    const history = [
      ...doc.history.filter(e => e.type === "words" && e.date !== date),
      { type: "words", date, ...doc.draft.words },
    ]
    //console.log("History:", history)
    updateDoc(doc => { doc.history = history })
    return {
      ...doc,
      history
    }
  }

  async function docSave() {
    try {
      const file = await saveDocument(insertHistory(doc))
      setSaved(doc)
      respSuccess({setCommand, message: `Saved ${file.name}`})
      return true
    } catch(err) {
      respError({setCommand, message: err})
      return false
    }
  }

  async function docSaveAs({ filename }) {
    try {
      const file = await saveDocumentAs(insertHistory(doc), filename)
      setSaved(doc)
      updateDoc(doc => { doc.file = file })
      setRecent(recentAdd(recent, file))
      respSuccess({setCommand, message: `Saved ${file.name}`})
      return true
    } catch(err) {
      respError({setCommand, message: err})
      return false
    }
  }

  function docRename({ filename }) {
    renameDocument(doc.file, filename)
    .then(file => {
      setRecent(recentAdd(recentRemove(recent, doc.file), file))
      updateDoc(doc => { doc.file = file })
      respSuccess({setCommand, message: `Renamed ${file.name}`})
    })
    .catch(err => respError({setCommand, message: err}))
  }

  function docClose() {
    updateDoc(null)
    setSaved(null)
  }
}

//*****************************************************************************
//
// Interface to action dispatcher
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Common requests
//-----------------------------------------------------------------------------

export function reqNew({setCommand}) {
  setCommand({action: "req-new"})
}

export function reqLoadResource({setCommand, filename}) {
  setCommand({action: "req-resource", filename})
}

export function reqLoadFile({setCommand, filename}) {
  setCommand({action: "req-load", filename})
}

export function reqOpenFile({setCommand}) {
  setCommand({action: "req-open"})
}

export function reqImportClipboard({setCommand}) {
  setCommand({action: "req-import-clipboard"})
}

export function reqImportFile({setCommand}) {
  setCommand({action: "req-import-file"})
}

export function reqRenameFile({setCommand}) {
  setCommand({action: "req-rename"})
}

export function reqSaveFile({setCommand}) {
  setCommand({action: "req-save"})
}

export function reqSaveFileAs({setCommand}) {
  setCommand({action: "req-saveas"})
}

export function reqCloseFile({setCommand}) {
  setCommand({action: "req-close"})
}

export function reqQuit({setCommand}) {
  setCommand({action: "req-quit"})
}

//-----------------------------------------------------------------------------
// Requests without action
//-----------------------------------------------------------------------------

export async function reqOpenFolder(filename) {
  const dirname = await fs.dirname(filename ?? ".")
  console.log("Open folder:", dirname)
  fs.openexternal(dirname)
}

//-----------------------------------------------------------------------------
// Low level requests
//-----------------------------------------------------------------------------

export function doRename({setCommand, filename}) {
  setCommand({action: "do-rename", filename})
}

export function doLoadFile({setCommand, filename}) {
  setCommand({action: "do-load", filename})
}

export function doImport({setCommand, story}) {
  setCommand({action: "do-import", story})
}

//-----------------------------------------------------------------------------
// Informing user
//-----------------------------------------------------------------------------

export function respSuccess({setCommand, message}) {
  setCommand({action: "success", message})
}

export function respError({setCommand, message}) {
  setCommand({action: "error", message})
}
