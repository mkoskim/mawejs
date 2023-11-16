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

import { EditHead } from "../common/components";

import { SnackbarProvider } from "notistack";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import {CmdContext} from "./context"
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

import { fileOpenDialog, fileSaveDialog } from "../../system/dialog"
import { appQuit, appLog } from "../../system/host"

//*****************************************************************************
//
// Application main
//
//*****************************************************************************

export default function App(props) {
  useEffect(() => addHotkeys([
    [IsKey.CtrlQ,  (e) => appQuit()],
  ]));

  return <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <AppSettings />
    </SnackbarProvider>
  </ThemeProvider>
}

//*****************************************************************************
//
// Handling settings: The main thing here is not to render anything before
// settings are loaded.
//
//*****************************************************************************

function AppSettings(props) {

  /*
  // Testing, sketching...
  const [settings, setSettings] = useImmer(null)

  useEffect(() => {
    console.log("Loading settings...")
    loadSettings()
    .then(s => setSettings(() => s))
    .catch(err => setSettings(() => getDefaultSettings()))
  }, [])
  */

  /*
  const dispatch = useDispatch()

  //---------------------------------------------------------------------------
  // Run initializes & wait them to finish

  useEffect(() => {
    console.log("Initializing...")
    dispatch(action.CWD.resolve("./local"))
    //dispatch(CWD.location("home"))
    //dispatch(onOpen({id: "./local/Beltane.A.mawe.gz", name: "Beltane.A.mawe.gz"}))
    dispatch(action.workspace.init())
    dispatch(action.doc.init())
  }, [])

  const status = [
    useSelector(state => state.workspace.status),
    useSelector(state => state.doc.status),
  ]

  console.log("Status:", status)

  if(!status.every(s => s))
  {
    return <View.Starting />
  }
  */

  const [loaded, setLoaded] = useSetting("loaded")

  const settings = {
    loaded, setLoaded,
  }

  //if(!settings) return null

  return <SettingsContext.Provider value={settings}>
    <AppCommand/>
  </SettingsContext.Provider>
}

//*****************************************************************************
//
// App command (load, save, ...) interface
//
//*****************************************************************************

function AppCommand() {

  const settings = useContext(SettingsContext)

  //---------------------------------------------------------------------------
  // TODO: Improve doc architecture!!!

  const [doc, setDoc] = useState(null)

  //---------------------------------------------------------------------------
  // Doc command interface: Let's try this, we can send commands here to top
  // level from subcomponents to perform all kinds of things. Maybe there is
  // some similar React design patterns out there?

  const [command, setCommand] = useState(() => getStartupCommand(settings))

  useEffect(() => {
    const {action} = command
    switch(action) {
      case "load": { docFromFile(command); break; }
      case "save": { docSave(command); break; }
      case "set": { docFromBuffer(command); break; }
      case "resource": { docFromResource(command); break; }
      case "saveas": { docSaveAs(command); break; }
      case "error": { Inform.error(command.message); break; }
    }
  }, [command])

  return <CmdContext.Provider value={{setCommand}}>
      <View key={doc?.key} doc={doc} setDoc={setDoc}/>
  </CmdContext.Provider>

  //---------------------------------------------------------------------------

  function docFromFile({filename}) {
    mawe.load(filename)
    .then(content => {
      setDoc({
        ...content,
        key: nanoid(),
      })
      settings.setLoaded(content.file.id)
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
    .then(buffer => docFromBuffer(mawe.decodebuf(buffer)))
    .catch(err => Inform.error(err))
  }

  function docSave() {
    mawe.save(doc)
    .then(() => Inform.success(`Saved ${command.name}`))
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
}

function View({doc, setDoc}) {

  //---------------------------------------------------------------------------
  // Use key to force editor state reset when file is changed: It won't work
  // for generated docs (user guide, new doc), but we fix that later.

  const settings = useContext(SettingsContext)

  //const [view, setView] = useSetting(doc?.file?.id, getViewDefaults(null))
  const [view, setView] = useState(() => getViewDefaults())

  return (
    <SettingsContext.Provider value={{...settings, view, setView}}>
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

  const {view} = useContext(SettingsContext)

  const [focusTo, _setFocusTo] = useState(undefined)

  const setFocusTo = useCallback(value => {
    setDoc(produce(draft => { view.selected = "editor" }))
    _setFocusTo(value)
  }, [])

  const props = { doc, setDoc, focusTo, setFocusTo }

  if(!doc?.story) return <Loading />

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

  const {setCommand} = useContext(CmdContext)
  const file = doc?.file

  useEffect(() => addHotkeys([
    [IsKey.CtrlN, (e) => onNewFile({setCommand, file})],
    [IsKey.CtrlO, (e) => onOpenFile({setCommand, file})],
    [IsKey.CtrlS, (e) => onSaveFile({setCommand, file})],
  ]));

  if(!doc) return <WithoutDoc/>
  return <WithDoc/>

  function WithoutDoc() {
    return <ToolBox>
      <FileMenu setCommand={setCommand} file={file}/>
      <Separator/>
    </ToolBox>
  }

  function WithDoc() {
    const {view, setView} = useContext(SettingsContext)
    const setMode = useCallback(value => setView(produce(view => view.selected = value), []))

    return <ToolBox>
      <FileMenu setCommand={setCommand} file={file}/>
      <Separator/>
      <SelectViewButtons selected={view.selected} setSelected={setMode}/>
      <Separator/>

      <DocInfoBar doc={doc} setDoc={setDoc}/>

      <Filler />
      <Separator />
      <OpenFolderButton filename={doc?.file?.id}/>
      <HelpButton setCommand={setCommand}/>
      <SettingsButton />
    </ToolBox>
  }
}

//-----------------------------------------------------------------------------

class FileMenu extends React.PureComponent {
  render() {
    const {setCommand, file} = this.props

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button {...bindTrigger(popupState)}><Icon.Menu /></Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem onClick={e => { onNewFile({setCommand}); popupState.close(e); }}>New</MenuItem>
          <MenuItem onClick={e => { onOpenFile({setCommand, file}); popupState.close(e); }}>Open...</MenuItem>
          <MenuItem onClick={e => { onSaveFile({setCommand, file}); popupState.close(e); }}>Save</MenuItem>
          <MenuItem onClick={e => { onSaveFileAs({setCommand, file}); popupState.close(e); }}>Save As...</MenuItem>
          <MenuItem onClick={popupState.close}>Revert</MenuItem>
          <MenuItem onClick={e => { popupState.close(e); }}>Open Folder</MenuItem>
          <MenuItem onClick={e => { appQuit(); popupState.close(e); }}>Exit</MenuItem>
        </Menu>
      </React.Fragment>
      }
    </PopupState>
  }
}

class DocInfoBar extends React.PureComponent {
  render() {
    const {doc, setDoc} = this.props

    if(!doc) return null

    const filename = doc.file?.name ?? "<Unnamed>"
    const {body} = doc.story
    const {head} = body

    return <>
      <Label text={filename}/>
      <Separator />
      <EditHeadButton head={head} setDoc={setDoc} />
    </>
  }
}

class EditHeadButton extends React.PureComponent {
  render() {
    const {head, setDoc} = this.props
    return <PopupState variant="popover" popupId="head-edit">
    {(popupState) => <React.Fragment>
      <Button {...bindTrigger(popupState)} tooltip="Edit story info"><Icon.Action.HeadInfo /></Button>
      <Menu {...bindMenu(popupState)}>
        <EditHead head={head} setDoc={setDoc}/>
      </Menu>
    </React.Fragment>
    }</PopupState>
  }
}

class OpenFolderButton extends React.PureComponent {
  render() {
    const {filename} = this.props

    return <Button tooltip="Open Folder" onClick={e => onOpenFolder(filename)}>
      <Icon.Action.Folder />
      </Button>
  }
}

class HelpButton extends React.PureComponent {
  render() {
    const {setCommand} = this.props
    return <Button tooltip="Help" onClick={e => onHelp(setCommand)}>
      <Icon.Help />
      </Button>
  }
}

class SettingsButton extends React.PureComponent {
  render() {
    return <Button tooltip="Settings"><Icon.Settings /></Button>
  }
}

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs")

const filters = [
  { name: 'Mawe Files', extensions: ['moe', 'mawe', 'mawe.gz'] },
  { name: 'All Files', extensions: ['*'] }
]

async function onOpenFolder(file) {
  const dirname = file ? await fs.dirname(file) : "."
  console.log("Open folder:", dirname)
  fs.openexternal(dirname)
}

async function onHelp(setCommand) {
  setCommand({action: "resource", filename: "examples/UserGuide.mawe"})
}

async function onNewFile({ setCommand }) {
  setCommand({
    action: "set",
    buffer: '<story format="mawe" />'
  })
}

async function onOpenFile({ setCommand, file }) {
  //const dirname = await fs.dirname(doc.file.id)
  const { canceled, filePaths } = await fileOpenDialog({
    filters,
    defaultPath: file?.id ?? ".",
    properties: ["OpenFile"],
  })
  if (!canceled) {
    const [filename] = filePaths

    console.log("Load file:", filename)
    setCommand({action: "load", filename})
  }
}

async function onSaveFile({ setCommand, file }) {
  if (file) {
    setCommand({action: "save"})
    return;
  }
  onSaveFileAs({ setCommand, file })
}

async function onSaveFileAs({ setCommand, file }) {
  const { canceled, filePath } = await fileSaveDialog({
    filters,
    defaultPath: file?.id ?? "./NewDoc.mawe",
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
  if (!canceled) {
    setCommand({action: "saveas", filename: filePath})
  }
}
