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
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox,
  IsKey, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
  Menu, MenuItem, MakeToggleGroup, Inform,
} from "../common/factory";

import { EditHead, OpenFolderButton } from "../common/components";

import { SnackbarProvider } from "notistack";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import {
  CmdContext,
  cmdCloseFile,
  cmdNewFile, cmdOpenFile, cmdOpenFolder, cmdOpenHelp,
  cmdSaveFile, cmdSaveFileAs
} from "./context"

import {
  SettingsContext,
  getViewDefaults,
  getStartupCommand, useSetting
} from "./settings"

import {produce} from "immer"
import {useImmer} from "use-immer"

import { SingleEditView } from "../editor/editor";
import { Organizer } from "../organizer/organizer";
import { Export } from "../export/export"
import { Chart } from "../chart/chart"

import { mawe } from "../../document"
import { nanoid, sleep } from '../../util';

import { appQuit, appLog } from "../../system/host"
import {Divider} from "@mui/material";

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

  const [loaded, setLoaded] = useSetting("loaded")

  const settings = useMemo(() => ({
    loaded, setLoaded,
  }), [loaded, setLoaded])

  const [doc, setDoc] = useState(null)
  const [command, setCommand] = useState(() => getStartupCommand(loaded))

  useEffect(() => {
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
    mawe.load(filename)
    .then(content => {
      setDoc({
        ...content,
        key: nanoid(),
      })
      setLoaded(content.file.id)
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
    mawe.saveas(doc, filename)
    .then(file => {
      setDoc(doc => ({ ...doc, file }))
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

class SelectViewButtons extends React.PureComponent {

  render() {
    const {selected, setSelected} = this.props
    return <MakeToggleGroup
      exclusive={true}
      choices={this.choices}
      selected={selected}
      setSelected={setSelected}
      buttons={this.viewbuttons}
    />
  }

  choices = ["editor", "organizer", "chart", "export"]

  viewbuttons = {
    "editor": { tooltip: "Editor", icon: <Icon.View.Edit /> },
    "organizer": { tooltip: "Organizer", icon: <Icon.View.Organize /> },
    "chart": { tooltip: "Charts", icon: <Icon.View.Chart /> },
    "export": { tooltip: "Export", icon: <Icon.View.Export /> },
  }
}

function ViewSwitch({doc, setDoc}) {

  const {view, setView} = useContext(SettingsContext)

  const [focusTo, _setFocusTo] = useState(undefined)

  const setFocusTo = useCallback(value => {
    setView(produce(view => {view.selected = "editor"}))
    _setFocusTo(value)
  }, [])

  if(!doc?.story) return null

  const props = { doc, setDoc, focusTo, setFocusTo }

  switch (view.selected) {
    case "editor": return <SingleEditView {...props} />
    case "organizer": return <Organizer {...props} />
    case "export": return <Export {...props} />
    case "chart": return <Chart {...props} />
    default: break;
  }
  return null;
}

//-----------------------------------------------------------------------------

function WorkspaceTab({doc, setDoc}) {
  //console.log("Workspace: id=", id)
  //console.log("Workspace: doc=", doc)

  const setCommand = useContext(CmdContext)
  const file = doc?.file

  useEffect(() => addHotkeys([
    [IsKey.CtrlN, (e) => cmdNewFile({setCommand})],
    [IsKey.CtrlO, (e) => cmdOpenFile({setCommand, file})],
  ]));

  if(!doc) return <WithoutDoc/>
  return <WithDoc doc={doc} setDoc={setDoc}/>
}

function WithoutDoc() {
  const setCommand = useContext(CmdContext)

  return <ToolBox>
    <FileMenu setCommand={setCommand} file={undefined}/>
    <Separator/>
    <Filler />
    <Separator />
    <HelpButton setCommand={setCommand}/>
    <SettingsButton />
  </ToolBox>
}

function WithDoc({doc, setDoc}) {
  const setCommand = useContext(CmdContext)
  const file = doc?.file
  const filename = file?.name ?? "<Unnamed>"
  const {view, setView} = useContext(SettingsContext)
  const setMode = useCallback(value => setView(produce(view => {view.selected = value})), [])

  useEffect(() => addHotkeys([
    [IsKey.CtrlS, (e) => cmdSaveFile({setCommand, file})],
  ]))

  return <ToolBox>
    <FileMenu setCommand={setCommand} file={file}/>
    <Separator/>
    <SelectViewButtons selected={view.selected} setSelected={setMode}/>
    <Separator/>
    <Label text={filename}/>
    <Separator/>
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
    const {setCommand, file} = this.props

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button {...bindTrigger(popupState)}><Icon.Menu /></Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem onClick={e => { cmdNewFile({setCommand}); popupState.close(e); }}>New</MenuItem>
          <MenuItem onClick={e => { cmdOpenFile({setCommand, file}); popupState.close(e); }}>Open...</MenuItem>
          <MenuItem onClick={e => { cmdSaveFile({setCommand, file}); popupState.close(e); }}>Save</MenuItem>
          <MenuItem onClick={e => { cmdSaveFileAs({setCommand, file}); popupState.close(e); }}>Save As...</MenuItem>
          {/*
          <MenuItem onClick={popupState.close}>Revert</MenuItem>
          <MenuItem onClick={e => { popupState.close(e); }}>Open Folder</MenuItem>
          */}
          <Divider/>
          <MenuItem onClick={e => { appQuit(); popupState.close(e); }}>Exit</MenuItem>
        </Menu>
      </React.Fragment>
      }
    </PopupState>
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
