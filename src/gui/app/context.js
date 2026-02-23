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

export function askFileToLoad(defaultPath) {
  return fileOpenDialog({
    filters,
    defaultPath,
    properties: ["OpenFile"],
  })
}

export function askFileToImport(defaultPath) {
  return fileOpenDialog({
    title: "Import File",
    filters: importFilters,
    defaultPath,
    properties: ["OpenFile"],
  })
}

export function askFileToSaveAs(file) {
  return fileSaveDialog({
    filters,
    defaultPath: file?.id ?? "./NewDoc.mawe",
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
}

export function askFileToRename(file) {
  return fileSaveDialog({
    title: "Rename File",
    buttonLabel: "Rename",
    filters,
    defaultPath: file.id,
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
}

//-----------------------------------------------------------------------------

function getDefaultPath(file) {
  return fs.dirname(file?.id ?? ".")
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
    case "req-new": { reqNew(command); break; }
    case "req-open": { reqOpen(command); break; }
    case "req-load": { reqLoad(command); break; }
    case "req-resource": { reqResource(command); break; }
    case "req-import-clipboard": { reqImportClipboard(command); break; }
    case "req-import-file": { reqImportFile(command); break; }
    case "req-save": { reqSave(command); break; }
    case "req-saveas": { reqSaveAs(command); break; }
    case "req-rename": { reqRename(command); break; }
    case "req-close": { reqClose(command); break; }
    case "req-quit": { reqQuit(command); break; }

    // Low level actions

    //case "do-set": { docFromBuffer(command); break; }
    case "do-load": { docFromFile(command); break; }
    //case "do-resource": { docFromResource(command); break; }
    case "do-import": { docImportTree(command); break; }
    //case "clipboard": { importFromClipboard(command); break; }
    //case "do-save": { docSave(command); break; }
    //case "do-saveas": { docSaveAs(command); break; }
    case "do-rename": { docRename(command); break; }
    //case "do-close": { docClose(command); break; }
  }

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
    const defaultPath = await getDefaultPath(file)
    console.log("Open path:", defaultPath)
    const { canceled, filePaths } = await askFileToLoad(defaultPath)
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

    const defaultPath = await getDefaultPath(file)
    console.log("Import path:", defaultPath)
    const { canceled, filePaths } = await askFileToImport(defaultPath)
    if (!canceled) {
      const [filename] = filePaths
      const file = await fs.fstat(filename)
      const ext  = await fs.extname(file.id)
      setImporting({ file, ext })
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
