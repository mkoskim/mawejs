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
import { styled } from '@mui/material/styles';

import {
  theme,
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  IsKey, addHotkeys,
  Label,
  Separator, Loading, addClass,
  Menu, MenuItem, Inform,
} from "../common/factory";

import { EditHeadButton, OpenFolderButton } from "../common/components";

import { SnackbarProvider } from "notistack";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import {
  CmdContext,
  cmdCloseFile,
  cmdLoadFile,
  cmdNewFile, cmdOpenFile, cmdOpenFolder, cmdOpenHelp,
  cmdSaveFile, cmdSaveFileAs
} from "./context"

import {
  SettingsContext,
  getViewDefaults,
  getStartupCommand, useSetting, recentRemove, recentAdd
} from "./settings"

import { ViewSelectButtons, ViewSwitch } from "./views";
import {produce} from "immer"
import {useImmer} from "use-immer"

import { mawe } from "../../document"
import { nanoid, sleep } from '../../util';

import { appQuit, appLog } from "../../system/host"

const fs = require("../../system/localfs")

//*****************************************************************************
//
// Application main
//
//*****************************************************************************

export default function App(props) {
  useEffect(() => addHotkeys([
    [IsKey.CtrlQ,  (e) => appQuit()],
  ]));

  const [recent, setRecent] = useSetting("recent", [])

  const settings = useMemo(() => ({
    recent, setRecent,
  }), [recent, setRecent])

  const [doc, setDoc] = useState(null)
  const [command, setCommand] = useState()

  useEffect(() => {
    if(!command) return
    const {action} = command
    switch(action) {
      case "load": { docFromFile(command); break; }
      case "save": { docSave(command); break; }
      case "set": { docFromBuffer(command); break; }
      case "resource": { docFromResource(command); break; }
      case "saveas": { docSaveAs(command); break; }
      case "close": { docClose(command); break; }
      case "error": { Inform.error(command.message); break; }
    }
  }, [command])

  useEffect(() => {
    //console.log("Recent:", recent)
    if(recent?.length) cmdLoadFile({setCommand, filename: recent[0].id})
  }, [])

  return <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <SettingsContext.Provider value={settings}>
        <CmdContext.Provider value={setCommand}>
          <View key={doc?.key} doc={doc} setDoc={setDoc}/>
        </CmdContext.Provider>
      </SettingsContext.Provider>
    </SnackbarProvider>
  </ThemeProvider>

  //---------------------------------------------------------------------------

  function docFromFile({filename}) {
    recentRemove({id: filename}, recent, setRecent)
    mawe.load(filename)
    .then(content => {
      setDoc({
        ...content,
        key: nanoid(),
      })
      recentAdd(content.file, recent, setRecent)
      Inform.success(`Loaded: ${content.file.name}`);
    })
    .catch(err => Inform.error(err))
  }

  function docFromBuffer({buffer}) {
    setDoc({
      ...mawe.create(buffer),
      key: nanoid(),
    })
  }

  function docFromResource({filename}) {
    fs.readResource(filename)
    .then(buffer => docFromBuffer({buffer: mawe.decodebuf(buffer)}))
    .catch(err => Inform.error(err))
  }

  function docSave() {
    mawe.save(doc)
    .then(file => Inform.success(`Saved ${file.name}`))
    .catch(err => Inform.error(err))
  }

  function docSaveAs({filename}) {
    recentRemove(doc.file, recent, setRecent)
    mawe.saveas(doc, filename)
    .then(file => {
      setDoc(doc => ({ ...doc, file }))
      recentAdd(file, recent, setRecent)
      Inform.success(`Saved ${file.name}`)
    })
    .catch(err => Inform.error(err))
  }

  function docClose() {
    setDoc(null)
  }
}

//*****************************************************************************
//
// Document view
//
//*****************************************************************************

function View({doc, setDoc}) {

  // Inject view settings to settings
  const settings = useContext(SettingsContext)

  //const [view, setView] = useSetting(doc?.file?.id, getViewDefaults(null))
  const [view, setView] = useState(() => getViewDefaults())

  const settingsWithView = useMemo(() => ({
    ...settings,
    view, setView,
  }), [settings, view, setView])

  return (
    <SettingsContext.Provider value={settingsWithView}>
      <VBox className="ViewPort">
        <WorkspaceTab doc={doc} setDoc={setDoc}/>
        <ViewSwitch doc={doc} setDoc={setDoc}/>
      </VBox>
    </SettingsContext.Provider>
  )
}

//-----------------------------------------------------------------------------

function WorkspaceTab({doc, setDoc}) {
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
  if(!doc) return <WithoutDoc recent={recent}/>
  return <WithDoc recent={recent} doc={doc} setDoc={setDoc}/>
}

function WithoutDoc({recent}) {
  const setCommand = useContext(CmdContext)

  return <ToolBox>
    <FileMenu setCommand={setCommand} recent={recent}/>
    <Separator/>
    <Filler />
    <Separator />
    <HelpButton setCommand={setCommand}/>
    <SettingsButton />
  </ToolBox>
}

function WithDoc({doc, setDoc, recent}) {
  const setCommand = useContext(CmdContext)
  const file = doc?.file
  const filename = file?.name ?? "<Unnamed>"
  const {head} = doc.story.body
  const {view, setView} = useContext(SettingsContext)
  const setMode = useCallback(value => setView(produce(view => {view.selected = value})), [])

  useEffect(() => addHotkeys([
    [IsKey.CtrlS, (e) => cmdSaveFile({setCommand, file})],
  ]))

  return <ToolBox>
    <FileMenu setCommand={setCommand} file={file} recent={recent}/>
    <Separator/>
    <ViewSelectButtons selected={view.selected} setSelected={setMode}/>
    <Separator/>
    <Label text={filename}/>
    <Separator/>
    <EditHeadButton head={head} setDoc={setDoc} expanded={true}/>
    <OpenFolderButton filename={file?.id}/>
    <CloseButton setCommand={setCommand}/>

    <Filler />
    <Separator />
    <HelpButton setCommand={setCommand}/>
    <SettingsButton />
  </ToolBox>
}

//-----------------------------------------------------------------------------

class FileMenu extends React.PureComponent {
  render() {
    const {setCommand, file, recent} = this.props
    const nofile = !file

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button {...bindTrigger(popupState)}><Icon.Menu /></Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem onClick={e => { cmdNewFile({setCommand}); popupState.close(e); }}>New</MenuItem>
          <MenuItem onClick={e => { cmdOpenFile({setCommand, file}); popupState.close(e); }}>Open...</MenuItem>
          <RecentItems recent={recent} setCommand={setCommand} popupState={popupState}/>
          <Separator/>
          <MenuItem disabled={nofile} onClick={e => { cmdSaveFile({setCommand, file}); popupState.close(e); }}>Save</MenuItem>
          <MenuItem disabled={nofile} onClick={e => { cmdSaveFileAs({setCommand, file}); popupState.close(e); }}>Save As...</MenuItem>
          <MenuItem disabled={nofile} onClick={e => { cmdCloseFile({setCommand, file}); popupState.close(e); }}>Close</MenuItem>
          {/*
          <MenuItem onClick={popupState.close}>Revert</MenuItem>
          <MenuItem onClick={e => { popupState.close(e); }}>Open Folder</MenuItem>
          */}
          <Separator/>
          <MenuItem onClick={e => { appQuit(); popupState.close(e); }}>Exit</MenuItem>
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
    return <Button tooltip="Help" onClick={e => cmdOpenHelp(setCommand)}>
      <Icon.Help />
      </Button>
  }
}

class SettingsButton extends React.PureComponent {
  render() {
    return <Button tooltip="Settings"><Icon.Settings /></Button>
  }
}

class CloseButton extends React.PureComponent {
  render() {
    const {setCommand} = this.props
    return <Button tooltip="Close" onClick={e => cmdCloseFile({setCommand})}>
      <Icon.Close />
      </Button>
  }
}
