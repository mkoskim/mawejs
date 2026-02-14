//*****************************************************************************
//*****************************************************************************
//
// Application main
//
//*****************************************************************************
//*****************************************************************************

import "./app.css"

/* eslint-disable no-unused-vars */

import React, {
  useEffect, useState, useCallback,
  useMemo, useContext,
  useDeferredValue,
} from "react"

import {
  VBox, Filler,
  ToolBox, Button, Icon, IconButton,
  IsKey, addHotkeys,
  Separator,
  Menu, MenuItem,
  Inform,
} from "../common/factory";

import {
  OpenFolderButton,
  HeadInfo, CharInfo, WordsToday, ActualWords, TargetWords, MissingWords
} from "../common/components";

//import { WorkspaceBar } from "../sketches/workspacebar/workspacebar";

import PopupState, {
  bindTrigger,
  bindMenu
} from 'material-ui-popup-state';

import {
  CmdContext,
  cmdCloseFile,
  cmdLoadFile,
  cmdNewFile, cmdOpenFile,
  cmdOpenImportFile,
  cmdRenameFile,
  cmdSaveFile, cmdSaveFileAs,
  cmdImportClipboard,
  cmdOpenResource
} from "./context"

import {
  SettingsContext,
  useSetting, recentRemove, recentAdd
} from "./settings"

import { ViewSelectButtons, ViewSwitch } from "./views";
import { useImmer } from "use-immer"

import { mawe } from "../../document"

import { appQuit, appInfo } from "../../system/host"
import { createDateStamp } from "../../document/util";
import { ImportDialog } from "../import/import";

const fs = require("../../system/localfs")

//*****************************************************************************
//
// Application main
//
//*****************************************************************************

export default function App(props) {

  //---------------------------------------------------------------------------
  // Get application info (name & version)
  //---------------------------------------------------------------------------

  const [app, setAppInfo] = useState()

  useEffect(() => {
    appInfo().then(info => {
      console.log("Application:", info)
      console.log("React:", React.version)
      setAppInfo(info)
    })
  }, [])

  //---------------------------------------------------------------------------
  // External settings
  //---------------------------------------------------------------------------

  const [recent, setRecent] = useSetting("recent", [])

  const settings = useMemo(() => ({
    recent, setRecent,
  }), [recent, setRecent])

  //---------------------------------------------------------------------------
  // Loaded story
  //---------------------------------------------------------------------------

  const [doc, updateDoc] = useImmer(null)

  //---------------------------------------------------------------------------
  // Simple dirty logic. We use shallow compare to see, what elements have
  // been touched. Exclude ui & exports elements, even that they are stored
  // within the file.
  //---------------------------------------------------------------------------

  const [saved, setSaved] = useState(null)

  const dirty = !(
    doc?.head === saved?.head
    && doc?.draft === saved?.draft
    && doc?.storybook === saved?.storybook
    && doc?.notes === saved?.notes
  )

  //---------------------------------------------------------------------------
  // Data we are trying to import (open in a dialog)
  //---------------------------------------------------------------------------

  const [importing, setImporting] = useState()

  //---------------------------------------------------------------------------
  // Simple command structure for deeper level components to ask Application
  // to perform operations
  //---------------------------------------------------------------------------

  const [command, setCommand] = useState()
  //console.log("Doc:", doc)
  //console.log("Command:", command)

  useEffect(() => {
    if (!command) return
    const { action } = command
    switch (action) {
      case "load": { docFromFile(command); break; }
      case "import": { importFromFile(command); break; }
      case "clipboard": { importFromClipboard(command); break; }
      case "save": { docSave(command); break; }
      case "set": { docFromBuffer(command); break; }
      case "resource": { docFromResource(command); break; }
      case "saveas": { docSaveAs(command); break; }
      case "rename": { docRename(command); break; }
      case "close": { docClose(command); break; }
      case "error": { Inform.error(command.message); break; }
    }
  }, [command])

  //---------------------------------------------------------------------------
  // Startup command
  //---------------------------------------------------------------------------

  useEffect(() => {
    //*
    //console.log("Recent:", recent)
    if (recent?.length) cmdLoadFile({ setCommand, filename: recent[0].id })
    /*/
    setCommand({
      action: "import",
      file: {id: "./examples/import/lorem.txt", name: "lorem.txt" }, ext: ".txt",
      //file: {id: "./examples/import/Frankenstein.txt", name: "Frankenstein.txt" }, ext: ".txt",
      //file: {id: "./examples/import/Frankenstein.md", name: "Frankenstein.md" }, ext: ".md",
    })
    /**/
  }, [])

  //---------------------------------------------------------------------------
  // Set window title
  //---------------------------------------------------------------------------

  useEffect(() => {
    const name = app ? `${app.name} (v${app.version})` : ""
    if (doc?.head) {
      document.title = (dirty ? "* " : "") + mawe.info(doc.head).title + " - " + name
    } else {
      document.title = name
    }
  }, [doc?.head, dirty, app])

  //---------------------------------------------------------------------------
  // Add application hotkeys common to all views
  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys([
    //[IsKey.CtrlQ, (e) => appQuit()],
  ]), []);

  //---------------------------------------------------------------------------
  // Render
  //---------------------------------------------------------------------------

  return (
    <SettingsContext value={settings}>
      <CmdContext value={setCommand}>
        <View key={doc?.key} doc={doc} updateDoc={updateDoc} buffer={importing} setBuffer={setImporting} />
      </CmdContext>
    </SettingsContext>
  )

  //---------------------------------------------------------------------------

  function docFromFile({ filename }) {
    mawe.load(filename)
      .then(content => {
        updateDoc(content)
        setSaved(content)
        setRecent(recentAdd(recent, content.file))
        console.log("Loaded:", content.file)
        Inform.success(`Loaded: ${content.file.name}`);
      })
      .catch(err => {
        setRecent(recentRemove(recent, { id: filename }))
        Inform.error(err)
      })
  }

  function importFromFile({ file, ext }) {
    setImporting({ file, ext })
  }

  function importFromClipboard() {
    setImporting({ file: undefined, ext: undefined })
  }

  function docFromBuffer({ buffer }) {
    const content = mawe.create(buffer)
    setSaved(content)
    updateDoc(content)
  }

  function docFromResource({ filename }) {
    fs.readResource(filename)
      .then(buffer => docFromBuffer({ buffer: mawe.decodebuf(buffer) }))
      .catch(err => Inform.error(err))
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

  function docSave() {
    mawe.save(insertHistory(doc))
      .then(file => {
        setSaved(doc)
        Inform.success(`Saved ${file.name}`)
      })
      .catch(err => Inform.error(err))
  }

  function docSaveAs({ filename }) {
    mawe.saveas(insertHistory(doc), filename)
      .then(file => {
        setSaved(doc)
        updateDoc(doc => { doc.file = file })
        setRecent(recentAdd(recent, file))
        Inform.success(`Saved ${file.name}`)
      })
      .catch(err => Inform.error(err))
  }

  function docRename({ filename }) {
    mawe.rename(doc.file, filename)
      .then(file => {
        //setSaved(doc)
        setRecent(recentAdd(recentRemove(recent, doc.file), file))
        updateDoc(doc => { doc.file = file })
        Inform.success(`Renamed: ${file.name}`)
      })
      .catch(err => Inform.error(err))
  }

  function docClose() {
    updateDoc(null)
  }
}

//*****************************************************************************
//
// Document view
//
//*****************************************************************************

function View({ doc, updateDoc, buffer, setBuffer }) {

  //const [view, setView] = useSetting(doc?.file?.id, getViewDefaults(null))
  //const [view, setView] = useState(() => getViewDefaults())

  return (
    <VBox className="ViewPort">
      {/* <WorkspaceBar doc={doc}/> /**/}
      {//*
      <DocBar doc={doc} updateDoc={updateDoc} />
      /**/}
      <ViewSwitch doc={doc} updateDoc={updateDoc} />
      <RenderDialogs doc={doc} updateDoc={updateDoc} buffer={buffer} setBuffer={setBuffer} />
    </VBox>
  )
}

//-----------------------------------------------------------------------------

function RenderDialogs({ doc, updateDoc, buffer, setBuffer }) {
  if (buffer) {
    return <ImportDialog
      updateDoc={updateDoc}
      buffer={buffer}
      setBuffer={setBuffer}
    ></ImportDialog>
  }
}

//*****************************************************************************
//
// Document toolbar
//
//*****************************************************************************

function DocBar({ doc, updateDoc }) {
  //console.log("Workspace:id=", id)
  //console.log("Workspace:doc=", doc)

  const { recent } = useContext(SettingsContext)
  const setCommand = useContext(CmdContext)
  const file = doc?.file

  useEffect(() => addHotkeys([
    [IsKey.CtrlN, (e) => cmdNewFile({ setCommand })],
    [IsKey.CtrlO, (e) => cmdOpenFile({ setCommand, file })],
  ]), [file]);

  //console.log("Recent:", recent)
  if (!doc) return <WithoutDoc setCommand={setCommand} recent={recent} />
  return <WithDoc setCommand={setCommand} recent={recent} doc={doc} updateDoc={updateDoc} />
}

function WithoutDoc({ setCommand, recent }) {
  return <ToolBox>
    <FileMenu setCommand={setCommand} recent={recent} />
    <Separator />
    <Filler />
    <Separator />
    <HelpButton setCommand={setCommand} />
    {/* <SettingsButton /> */}
  </ToolBox>
}

function WithDoc({ setCommand, doc, updateDoc, recent }) {
  const file = doc?.file
  const { head, draft } = doc
  const setSelected = useCallback(value => updateDoc(doc => { doc.ui.view.selected = value }), [])

  const { chars, text, missing } = useDeferredValue({
    chars: 0,
    text: 0,
    missing: 0,
    ...(draft.words ?? {})
  })

  useEffect(() => addHotkeys([
    [IsKey.CtrlS, (e) => cmdSaveFile({ setCommand, file })],
  ]), [file])

  return <ToolBox>
    <FileMenu file={file} setCommand={setCommand} recent={recent} hasdoc={true}/>
    <FileOperations file={file} setCommand={setCommand}/>
    <Separator />
    <ViewSelectButtons selected={doc.ui.view.selected} setSelected={setSelected} />
    <Separator />

    <HeadInfo head={head} updateDoc={updateDoc} />

    <Separator />
    <Filler />
    <Separator />

    <ActualWords text={text} />
    <Separator />
    <WordsToday text={text} last={doc.head.last} />
    <Separator />
    <TargetWords text={text} missing={missing} />
    &nbsp;
    <MissingWords missing={missing} />
    <Separator />
    <CharInfo chars={chars} />
    {/* <CloseButton setCommand={setCommand}/> */}

    <Separator />
    <HelpButton setCommand={setCommand} />
    {/* <SettingsButton /> */}
  </ToolBox>
}

//-----------------------------------------------------------------------------

class FileOperations extends React.PureComponent {
  static gzip_style = {
    fontSize: "10pt",
    border: "2px solid",
    //paddingLeft: "2px",
    //paddingRight: "2px",
    //paddingTop: "2px",
    paddingBottom: "2px",
    borderRadius: "3px",
  }
  static gunzip_style = {
    ...this.gzip_style,
    textDecorationLine: "line-through",
    textDecorationThickness: "2px",
    textDecorationColor: "rgb(240, 80, 40)",
  }

  toggleCompress(file, setCommand) {
    const compressed = file.id.endsWith(".gz")
    const filename = compressed ? file.id.slice(0, -3) : (file.id + ".gz")
    setCommand({action: "rename", filename})
  }

  render() {
    const {file, setCommand} = this.props
    const compressed = file?.id.endsWith(".gz") ?? false
    const {gzip_style, gunzip_style} = this.constructor
    const compress_style = compressed ? gunzip_style : gzip_style
    const compress_tooltip = compressed ? "Uncompress" : "Compress"
    //const filename = file?.name ?? "<Unnamed>"

    return <>
      {/*
      <Label style={{paddingLeft: "4px", paddingRight: "4px"}} text={filename}/>
      <IconButton tooltip="Rename" onClick={e => { cmdRenameFile({ setCommand, file }) }}><Icon.Action.File.Rename/></IconButton>
      */}
      <Button disabled={!file} tooltip={compress_tooltip} onClick={e => this.toggleCompress(file, setCommand) }><span style={compress_style}>&nbsp;gz&nbsp;</span></Button>
      <OpenFolderButton filename={file?.id} />
      </>
  }
}

//-----------------------------------------------------------------------------

class FileMenu extends React.PureComponent {
  render() {
    const { setCommand, file, recent, hasdoc } = this.props
    const filename = file?.name ?? "<Unnamed>"
    const name = hasdoc ? filename : <Icon.Menu />

    return <PopupState variant="popover">
      {(popupState) => <React.Fragment>
        <Button tooltip="File menu" {...bindTrigger(popupState)}>{name}</Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem
            title="New" endAdornment="Ctrl-N"
            onClick={e => { cmdNewFile({ setCommand }); popupState.close(e); }}
            />
          <MenuItem
            title="Open" endAdornment="Ctrl-O"
            onClick={e => { cmdOpenFile({ setCommand, file }); popupState.close(e); }}
            />
          <Separator />
          <RecentItems recent={recent} setCommand={setCommand} popupState={popupState} />
          <Separator />
          <MenuItem
            title="Import File..."
            onClick={e => { cmdOpenImportFile({ setCommand, file }); popupState.close(e); }}
            />
          <MenuItem
            title="Import From Clipboard"
            onClick={e => { cmdImportClipboard({ setCommand }); popupState.close(e); }}
            />
          <Separator />
          <MenuItem
            title="Save" endAdornment="Ctrl-S"
            disabled={!file} onClick={e => { cmdSaveFile({ setCommand, file }); popupState.close(e); }}
            />
          <MenuItem
            title="Save as..."
            disabled={!hasdoc} onClick={e => { cmdSaveFileAs({ setCommand, file }); popupState.close(e); }}
            />
          <MenuItem
            title="Rename..."
            disabled={!file} onClick={e => { cmdRenameFile({ setCommand, file }); popupState.close(e); }}
            />
          <MenuItem
            title="Close" endAdornment="Ctrl-W"
            disabled={!hasdoc} onClick={e => { cmdCloseFile({ setCommand, file }); popupState.close(e); }}
            />
          {/*
          <MenuItem onClick={popupState.close}>Revert</MenuItem>
          <MenuItem onClick={e => { popupState.close(e); }}>Open Folder</MenuItem>
          */}
          <Separator />
          <MenuItem
            title="Quit" //endAdornment="Ctrl-Q"
            onClick={e => { appQuit(); popupState.close(e); }}
          />
        </Menu>
      </React.Fragment>
      }
    </PopupState>
  }
}

class RecentItems extends React.PureComponent {
  render() {
    const { recent, setCommand, popupState } = this.props
    if (!recent?.length) return null
    return <>
      {recent.slice(0, 5).map(entry => <MenuItem
        key={entry.id}
        title={entry.name}
        onClick={(e => { cmdLoadFile({ setCommand, filename: entry.id }); popupState.close(e); })}
        />
      )}
    </>
  }
}

class HelpButton extends React.PureComponent {
  render() {
    const { setCommand } = this.props

    return <PopupState variant="popover" popupId="file-menu">
    {(popupState) => <React.Fragment>
      <IconButton tooltip="Help" {...bindTrigger(popupState)}><Icon.Help/></IconButton>
      <Menu {...bindMenu(popupState)}>
        <MenuItem title="Tutorial (English)"
          onClick={e => { popupState.close(e); cmdOpenResource(setCommand, "examples/tutorial/Tutorial.en.mawe")}}
          />
        <MenuItem title="Tutorial (Finnish)"
          onClick={e => { popupState.close(e); cmdOpenResource(setCommand, "examples/tutorial/Tutorial.fi.mawe")}}
          />
      </Menu>
    </React.Fragment>}
    </PopupState>
    /*
    return <IconButton tooltip="Help" onClick={e => cmdOpenHelp(setCommand)}>
      <Icon.Help />
    </IconButton>
    */
  }
}

class SettingsButton extends React.PureComponent {
  render() {
    return <IconButton tooltip="Settings"><Icon.Settings /></IconButton>
  }
}

class CloseButton extends React.PureComponent {
  render() {
    const { setCommand } = this.props
    return <IconButton tooltip="Close" onClick={e => cmdCloseFile({ setCommand })}>
      <Icon.Close />
    </IconButton>
  }
}
