//*****************************************************************************
//
// Application React Contexts to be imported and used
//
//*****************************************************************************

import {
  createContext
} from "react"

import { fileOpenDialog, fileSaveDialog } from "../../system/dialog"

//-----------------------------------------------------------------------------
// "Command" Context is meant for subcomponents to trigger top level components
// to perform certain operations (loading & saving files, and so on)
//-----------------------------------------------------------------------------

export const CmdContext = createContext(null)

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs")

//-----------------------------------------------------------------------------

const filters = [
  { name: 'Mawe Files', extensions: ['moe', 'mawe', 'mawe.gz'] },
  { name: 'All Files', extensions: ['*'] }
]

const importFilters = [
  { name: 'Known Files', extensions: ['txt', 'md', "docx"] },
  { name: 'All Files', extensions: ['*'] }
]

//-----------------------------------------------------------------------------

export async function cmdOpenFolder(file) {
  const dirname = file ? await fs.dirname(file) : "."
  console.log("Open folder:", dirname)
  fs.openexternal(dirname)
}

export async function cmdNewFile({ setCommand }) {
  setCommand({
    action: "set",
    buffer: '<story format="mawe" />'
  })
}

export async function cmdOpenResource(setCommand, filename) {
  // setCommand({action: "resource", filename: "examples/UserGuide.mawe"})
  setCommand({action: "resource", filename})
}

//-----------------------------------------------------------------------------

export function cmdLoadFile({setCommand, filename}) {
  console.log("Load file:", filename)
  setCommand({action: "load", filename})
}

export async function cmdOpenFile({ setCommand, file }) {
  //const dirname = await fs.dirname(doc.file.id)
  const { canceled, filePaths } = await fileOpenDialog({
    filters,
    defaultPath: file?.id ?? ".",
    properties: ["OpenFile"],
  })
  if (!canceled) {
    const [filename] = filePaths
    cmdLoadFile({setCommand, filename})
  }
}

//-----------------------------------------------------------------------------

export function cmdImportClipboard({setCommand}) {
  console.log("Import clipboard")
  setCommand({action: "clipboard"})
}

export function cmdImportFile({setCommand, file, ext}) {
  console.log("Import file:", file.name)
  setCommand({action: "import", file, ext})
}

export async function cmdOpenImportFile({setCommand, file}) {
  const { canceled, filePaths } = await fileOpenDialog({
    title: "Import File",
    filters: importFilters,
    defaultPath: file?.id ?? ".",
    properties: ["OpenFile"],
  })
  if (!canceled) {
    const [filename] = filePaths
    const file = await fs.fstat(filename)
    const ext  = await fs.extname(file.id)
    cmdImportFile({setCommand, file, ext})
  }
}

//-----------------------------------------------------------------------------

export async function cmdSaveFile({ setCommand, file }) {
  if (file) {
    setCommand({action: "save"})
    return;
  }
  cmdSaveFileAs({ setCommand, file })
}

export async function cmdSaveFileAs({ setCommand, file }) {
  const { canceled, filePath } = await fileSaveDialog({
    filters,
    defaultPath: file?.id ?? "./NewDoc.mawe",
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
  if (!canceled) {
    setCommand({action: "saveas", filename: filePath})
  }
}

export function cmdCloseFile({setCommand}) {
  setCommand({action: "close"})
}

