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
  useEffect, useState, useReducer, useCallback,
  useMemo, useContext,
} from "react"

import { ThemeProvider } from '@mui/material/styles';

import {
  theme,
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip, IconButton,
  IsKey, addHotkeys,
  Label,
  Separator, Loading, addClass,
  Menu, MenuItem, MenuList, ListSubheader,
  Inform,
  ListItemText,
  Typography,
  DeferredRender,
} from "../common/factory";

import { OpenFolderButton, HeadInfo, WordInfo, CharInfo, WordsToday, ActualWords, TargetWords, MissingWords } from "../common/components";

import { SnackbarProvider } from "notistack";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import {
  CmdContext,
  cmdCloseFile,
  cmdLoadFile,
  cmdNewFile, cmdOpenFile, cmdOpenFolder, cmdOpenHelp,
  cmdOpenImportFile, cmdImportFile,
  cmdSaveFile, cmdSaveFileAs,
  cmdImportClipboard
} from "./context"

import {
  SettingsContext,
  getViewDefaults,
  getStartupCommand, useSetting, recentRemove, recentAdd
} from "./settings"

import { ViewSelectButtons, ViewSwitch } from "./views";
import {useImmer} from "use-immer"

import { mawe } from "../../document"

import { appQuit, appLog } from "../../system/host"
import { createDateStamp } from "../../document/util";
import { Dialog } from "@mui/material";
import {ImportView} from "../import/import";

const fs = require("../../system/localfs")

//*****************************************************************************
//
// Application main
//
//*****************************************************************************

export default function App(props) {

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
  // Simple dirty logic. Use shallow compare to elements stored to disk (but
  // not ui element)
  //---------------------------------------------------------------------------

  const [saved, setSaved] = useState(null)

  const dirty = !(
    doc?.body === saved?.body
    && doc?.notes === saved?.notes
    && doc?.head === saved?.head
    && doc?.exports === saved?.exports
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
    if(!command) return
    const {action} = command
    switch(action) {
      case "load": { docFromFile(command); break; }
      case "import": { importFromFile(command); break; }
      case "clipboard": { importFromClipboard(command); break; }
      case "save": { docSave(command); break; }
      case "set": { docFromBuffer(command); break; }
      case "resource": { docFromResource(command); break; }
      case "saveas": { docSaveAs(command); break; }
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
    if(recent?.length) cmdLoadFile({setCommand, filename: recent[0].id})
    /*/
    setCommand({
      action: "import",
      //file: {id: "./examples/Frankenstein.txt", name: "Frankenstein.txt" }, ext: ".txt",
      //file: {id: "./examples/Frankenstein.md", name: "Frankenstein.md" }, ext: ".md",
      file: {id: "./local/Maankutsuja/Maankutsuja2.docx", name: "Maankutsuja2.docx" }, ext: ".docx",
    })
    /**/
  }, [])

  //---------------------------------------------------------------------------
  // Set title
  //---------------------------------------------------------------------------

  useEffect(() => {
    if(doc?.head) {
      document.title = (dirty ? "* ": "") + mawe.info(doc.head).title + " - MaweJS"
    } else {
      document.title = "MaweJS"
    }
  }, [doc?.head, dirty])

  //---------------------------------------------------------------------------
  // Add application hotkeys common to all views
  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys([
    [IsKey.CtrlQ, (e) => appQuit()],
  ]));

  //---------------------------------------------------------------------------
  // Render
  //---------------------------------------------------------------------------

  return <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <SettingsContext.Provider value={settings}>
        <CmdContext.Provider value={setCommand}>
          <View key={doc?.key} doc={doc} updateDoc={updateDoc} buffer={importing} setBuffer={setImporting}/>
        </CmdContext.Provider>
      </SettingsContext.Provider>
    </SnackbarProvider>
  </ThemeProvider>

  //---------------------------------------------------------------------------

  function docFromFile({filename}) {
    mawe.load(filename)
    .then(content => {
      updateDoc(content)
      setSaved(content)
      recentAdd(content.file, recent, setRecent)
      Inform.success(`Loaded: ${content.file.name}`);
    })
    .catch(err => {
      recentRemove({id: filename}, recent, setRecent)
      Inform.error(err)
    })
  }

  function importFromFile({file, ext}) {
    setImporting({file, ext})
  }

  function importFromClipboard() {
    setImporting({file: undefined, ext: undefined})
  }

  function docFromBuffer({buffer}) {
    const content = mawe.create(buffer)
    setSaved(content)
    updateDoc(content)
  }

  function docFromResource({filename}) {
    fs.readResource(filename)
    .then(buffer => docFromBuffer({buffer: mawe.decodebuf(buffer)}))
    .catch(err => Inform.error(err))
  }

  function insertHistory(doc) {
    const date = createDateStamp()
    const history = [
      ...doc.history.filter(e => e.type === "words" && e.date !== date),
      {type: "words", date, ...doc.body.words},
    ]
    //console.log("History:", history)
    updateDoc(doc => {doc.history = history})
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

  function docSaveAs({filename}) {
    mawe.saveas(insertHistory(doc), filename)
    .then(file => {
      setSaved(doc)
      updateDoc(doc => { doc.file = file })
      //recentRemove(doc.file, recent, setRecent)
      recentAdd(file, recent, setRecent)
      Inform.success(`Saved ${file.name}`)
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

function View({doc, updateDoc, buffer, setBuffer}) {

  //const [view, setView] = useSetting(doc?.file?.id, getViewDefaults(null))
  //const [view, setView] = useState(() => getViewDefaults())

  return (
    <VBox className="ViewPort">
      <WorkspaceTab doc={doc} updateDoc={updateDoc}/>
      <ViewSwitch doc={doc} updateDoc={updateDoc}/>
      <RenderDialogs doc={doc} updateDoc={updateDoc} buffer={buffer} setBuffer={setBuffer}/>
    </VBox>
  )
}

//-----------------------------------------------------------------------------

function RenderDialogs({doc, updateDoc, buffer, setBuffer}) {
  if(buffer) {
    return <Dialog open={true} fullWidth={true} maxWidth="xl">
      <ImportView doc={doc} updateDoc={updateDoc} buffer={buffer} setBuffer={setBuffer}/>
    </Dialog>
  }
}

//-----------------------------------------------------------------------------

function WorkspaceTab({doc, updateDoc}) {
  //console.log("Workspace: id=", id)
  //console.log("Workspace: doc=", doc)

  const {recent} = useContext(SettingsContext)
  const setCommand = useContext(CmdContext)
  const file = doc?.file

  useEffect(() => addHotkeys([
    [IsKey.CtrlN, (e) => cmdNewFile({setCommand})],
    [IsKey.CtrlO, (e) => cmdOpenFile({setCommand, file})],
  ]));

  //console.log("Recent:", recent)
  if(!doc) return <WithoutDoc setCommand={setCommand} recent={recent}/>
  return <WithDoc setCommand={setCommand} recent={recent} doc={doc} updateDoc={updateDoc}/>
}

function WithoutDoc({setCommand, recent}) {
  return <ToolBox>
    <FileMenu setCommand={setCommand} recent={recent}/>
    <Separator/>
    <Filler />
    <Separator />
    <HelpButton setCommand={setCommand}/>
    <SettingsButton />
  </ToolBox>
}

function WithDoc({setCommand, doc, updateDoc, recent}) {
  const file = doc?.file
  const filename = file?.name ?? "<Unnamed>"
  const {head, body} = doc
  const setSelected = useCallback(value => updateDoc(doc => {doc.ui.view.selected = value}), [])

  const {chars, text, missing} = {
    chars: 0,
    text: 0,
    missing: 0,
    ...(body.words ?? {})
  }

  useEffect(() => addHotkeys([
    [IsKey.CtrlS, (e) => cmdSaveFile({setCommand, file})],
  ]))

  return <ToolBox>
    <FileMenu hasdoc={true} setCommand={setCommand} file={file} text={filename} recent={recent}/>
    <OpenFolderButton filename={file?.id}/>
    <Separator />
    <ViewSelectButtons selected={doc.ui.view.selected} setSelected={setSelected}/>
    <Separator/>
    {/* No need for real time rendering */}

    <HeadInfo head={head} updateDoc={updateDoc}/>

    <Separator />
    <Filler />
    <Separator/>

    <ActualWords text={text}/>
    <Separator/>
    <WordsToday text={text} last={doc.head.last}/>
    <Separator/>
    <TargetWords text={text} missing={missing}/>
    &nbsp;
    <MissingWords missing={missing}/>
    <Separator/>
    <CharInfo chars={chars}/>

    {/* <CloseButton setCommand={setCommand}/> */}

    <Separator />
    <HelpButton setCommand={setCommand}/>
    <SettingsButton />
  </ToolBox>
}

//-----------------------------------------------------------------------------

class FileMenu extends React.PureComponent {
  render() {
    const {setCommand, file, text, recent, hasdoc} = this.props

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button tooltip="File menu" {...bindTrigger(popupState)}>{text ?? <Icon.Menu />}</Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem onClick={e => { cmdNewFile({setCommand}); popupState.close(e); }}>
            <ListItemText>New</ListItemText>
            <Typography sx={{ color: 'text.secondary' }}>Ctrl-N</Typography>
            </MenuItem>
          <MenuItem onClick={e => { cmdOpenFile({setCommand, file}); popupState.close(e); }}>
            <ListItemText>Open</ListItemText>
            <Typography sx={{ color: 'text.secondary' }}>Ctrl-O</Typography>
            </MenuItem>
          <RecentItems recent={recent} setCommand={setCommand} popupState={popupState}/>
          <Separator/>
          <MenuItem onClick={e => { cmdOpenImportFile({setCommand, file}); popupState.close(e); }}>
            <ListItemText>Import File...</ListItemText>
            </MenuItem>
          <MenuItem onClick={e => { cmdImportClipboard({setCommand}); popupState.close(e); }}>
            <ListItemText>Import From Clipboard</ListItemText>
            </MenuItem>
          <Separator/>
          <MenuItem disabled={!file} onClick={e => { cmdSaveFile({setCommand, file}); popupState.close(e); }}>
            <ListItemText>Save</ListItemText>
            <Typography sx={{ color: 'text.secondary' }}>Ctrl-S</Typography>
            </MenuItem>
          <MenuItem disabled={!hasdoc} onClick={e => { cmdSaveFileAs({setCommand, file}); popupState.close(e); }}>
            <ListItemText>Save as...</ListItemText>
            </MenuItem>
          <MenuItem disabled={!hasdoc} onClick={e => { cmdCloseFile({setCommand, file}); popupState.close(e); }}>
            <ListItemText>Close</ListItemText>
            <Typography sx={{ color: 'text.secondary' }}>Ctrl-W</Typography>
            </MenuItem>
          {/*
          <MenuItem onClick={popupState.close}>Revert</MenuItem>
          <MenuItem onClick={e => { popupState.close(e); }}>Open Folder</MenuItem>
          */}
          <Separator/>
          <MenuItem onClick={e => { appQuit(); popupState.close(e); }}>
            <ListItemText>Quit</ListItemText>
            <Typography sx={{ color: 'text.secondary' }}>Ctrl-Q</Typography>
            </MenuItem>
        </Menu>
      </React.Fragment>
      }
    </PopupState>
  }
}

class RecentItems extends React.PureComponent {
  render() {
    const {recent, setCommand, popupState} = this.props
    if(!recent?.length) return null
    return <>
      <Separator />
      {/* <MenuItem>Recent:</MenuItem> */}
      {recent.slice(0, 5).map(entry => <MenuItem key={entry.id} onClick={(e => { cmdLoadFile({setCommand, filename: entry.id}); popupState.close(e); })}>{entry.name}</MenuItem>)}
    </>
  }
}

class HelpButton extends React.PureComponent {
  render() {
    const {setCommand} = this.props
    return <IconButton tooltip="Help" onClick={e => cmdOpenHelp(setCommand)}>
      <Icon.Help />
      </IconButton>
  }
}

class SettingsButton extends React.PureComponent {
  render() {
    return <IconButton tooltip="Settings"><Icon.Settings /></IconButton>
  }
}

class CloseButton extends React.PureComponent {
  render() {
    const {setCommand} = this.props
    return <IconButton tooltip="Close" onClick={e => cmdCloseFile({setCommand})}>
      <Icon.Close />
      </IconButton>
  }
}
