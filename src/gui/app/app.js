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
  ToolBox, Button, Icon, Tooltip, IconButton,
  IsKey, addHotkeys,
  Label,
  Separator, Loading, addClass,
  Menu, MenuItem, MenuList, ListSubheader,
  Inform,
  ListItemText,
  Typography,
} from "../common/factory";

import { OpenFolderButton, HeadInfo, WordInfo, CharInfo, WordsToday } from "../common/components";

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
import {useImmer} from "use-immer"

import { mawe } from "../../document"

import { appQuit, appLog } from "../../system/host"
import { createDateStamp } from "../../document/xmljs/track";

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

  const [doc, updateDoc] = useImmer(null)
  const [command, setCommand] = useState()

  //console.log("Doc:", doc)

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
          <View key={doc?.key} doc={doc} updateDoc={updateDoc}/>
        </CmdContext.Provider>
      </SettingsContext.Provider>
    </SnackbarProvider>
  </ThemeProvider>

  //---------------------------------------------------------------------------

  function docFromFile({filename}) {
    mawe.load(filename)
    .then(content => {
      updateDoc(content)
      recentAdd(content.file, recent, setRecent)
      Inform.success(`Loaded: ${content.file.name}`);
    })
    .catch(err => {
      recentRemove({id: filename}, recent, setRecent)
      Inform.error(err)
    })
  }

  function docFromBuffer({buffer}) {
    updateDoc(mawe.create(buffer))
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
    .then(file => Inform.success(`Saved ${file.name}`))
    .catch(err => Inform.error(err))
  }

  function docSaveAs({filename}) {
    mawe.saveas(insertHistory(doc), filename)
    .then(file => {
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

function View({doc, updateDoc}) {

  //const [view, setView] = useSetting(doc?.file?.id, getViewDefaults(null))
  //const [view, setView] = useState(() => getViewDefaults())

  return (
    <VBox className="ViewPort">
      <WorkspaceTab doc={doc} updateDoc={updateDoc}/>
      <ViewSwitch doc={doc} updateDoc={updateDoc}/>
    </VBox>
  )
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
    <Separator />
    <ViewSelectButtons selected={doc.ui.view.selected} setSelected={setSelected}/>
    <Separator/>
    <HeadInfo head={head} updateDoc={updateDoc}/>

    <Filler />
    <Separator/>
    <WordsToday text={text} last={doc.head.last}/>
    <Separator/>
    <WordInfo text={text} missing={missing}/>
    <Separator/>
    <CharInfo chars={chars}/>
    <Separator/>
    <OpenFolderButton filename={file?.id}/>
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
