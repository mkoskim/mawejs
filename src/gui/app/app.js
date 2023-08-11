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
  useMemo,
} from "react"

import { ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

import {
  theme,
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
  Menu, MenuItem, MakeToggleGroup, Inform,
} from "../common/factory";

import { EditHead } from "../common/components";

import { SnackbarProvider, enqueueSnackbar } from "notistack";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { SingleEditView } from "../editor/editor";
import { Organizer } from "../organizer/organizer";
import { Export } from "../export/export"
import { Chart } from "../chart/chart"
import { Outliner } from "../outliner/outliner"

import { mawe } from "../../document"

import { fileOpenDialog, fileSaveDialog } from "../../system/dialog"
import { appQuit } from "../../system/host"

//-----------------------------------------------------------------------------

export default function App(props) {

  //console.log("App")

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

  const [_mode, setMode] = useState(
    "editor"
    //"organizer"
    //"chart"
    //"export"
  );

  const mode = {
    selected: _mode,
    setSelected: setMode,
  }

  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys({
    "mod+q": (e) => appQuit(),
  }));

  //---------------------------------------------------------------------------
  // TODO: Improve doc architecture!!!

  const [doc, setDoc] = useState({
    //load: "./examples/Empty.mawe",
    //load: "./examples/TestDoc1.mawe"
    //load: "./examples/TestDoc2.mawe"
    //load: "./examples/UserGuide.mawe",
    //load: "./examples/Lorem30k.mawe"
    //load: "./examples/Compressed.mawe.gz"

    //load: "./local/mawe2/GjertaAvaruudessa.2.mawe"
    //load: "./local/mawe2/GjertaAvaruudessa.3.mawe"
    //load: "./local/mawe2/GjertaViidakossa.mawe"
    //load: "./local/mawe2/NeljaBarnaa.mawe",
    buffer: '<story format="mawe" />'
  })

  useEffect(() => {
    if (!doc.story) {
      if (doc.load) {
        console.log("Loading:", doc.load)
        mawe.load(doc.load).then(content => {
          setDoc(content)
          //enqueueSnackbar("Loaded");
        })
      }
      else if (doc.buffer) {
        setDoc(mawe.create(doc.buffer))
      }
    }
  }, [doc.file?.id, doc.load, doc.buffer])

  if (!doc.story) return <Loading />

  //---------------------------------------------------------------------------
  // Use key to force editor state reset when file is changed: It won't work
  // for generated docs (user guide, new doc), but we fix that later.

  const viewprops = { mode, setMode, doc, setDoc }

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
      <VBox className="ViewPort">
        <WorkspaceTab {...viewprops} />
        <WorkArea key={doc.file?.id} {...viewprops} />
      </VBox>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

//-----------------------------------------------------------------------------

const views = {
  choices: ["editor", "organizer", "outliner", "chart", "export"],
  buttons: {
    "editor": { tooltip: "Editor", icon: <Icon.View.Edit /> },
    "organizer": { tooltip: "Organizer", icon: <Icon.View.Organize /> },
    "outliner": { tooltip: "Outliner", icon: <Icon.View.Outline style={{color: "MediumOrchid"}}/>},
    "chart": { tooltip: "Charts", icon: <Icon.View.Chart /> },
    "export": { tooltip: "Export", icon: <Icon.View.Export /> },
  },
}

function WorkArea({ mode, setMode, doc, setDoc }) {

  const [focusTo, _setFocusTo] = useState(undefined)

  const setFocusTo = useCallback(value => {
    setMode("editor")
    _setFocusTo(value)
  }, [])

  const props = { doc, setDoc, focusTo, setFocusTo }

  switch (mode.selected) {
    case "editor": return <SingleEditView {...props} />
    case "organizer": return <Organizer {...props} />
    case "export": return <Export {...props} />
    case "chart": return <Chart {...props} />
    case "outliner": return <Outliner {...props}/>
    default: break;
  }
  return null;
}

class SelectViewButtons extends React.PureComponent {

  choices = ["editor", "organizer", "outliner", "chart", "export"]
  viewbuttons = {
    "editor": { tooltip: "Editor", icon: <Icon.View.Edit /> },
    "organizer": { tooltip: "Organizer", icon: <Icon.View.Organize /> },
    "outliner": { tooltip: "Outliner", icon: <Icon.View.Outline style={{color: "MediumOrchid"}}/>},
    "chart": { tooltip: "Charts", icon: <Icon.View.Chart /> },
    "export": { tooltip: "Export", icon: <Icon.View.Export /> },
  }

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
}

//-----------------------------------------------------------------------------

function WorkspaceTab({ mode, doc, setDoc }) {
  //console.log("Workspace: id=", id)
  //console.log("Workspace: doc=", doc)

  const {body} = doc.story
  const {head} = body

  const cbprops = { doc, setDoc }

  useEffect(() => addHotkeys({
    "mod+o": (e) => onOpenFile(cbprops),
    "mod+s": (e) => onSaveFile(cbprops),
  }));

  return <ToolBox>
    <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button {...bindTrigger(popupState)}><Icon.Menu /></Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem onClick={e => { onNewFile(cbprops); popupState.close(e); }}>New</MenuItem>
          <MenuItem onClick={e => { onOpenFile(cbprops); popupState.close(e); }}>Open...</MenuItem>
          <MenuItem onClick={e => { onSaveFile(cbprops); popupState.close(e); }}>Save</MenuItem>
          <MenuItem onClick={e => { onSaveFileAs(cbprops); popupState.close(e); }}>Save As...</MenuItem>
          <MenuItem onClick={popupState.close}>Revert</MenuItem>
          <MenuItem onClick={e => { onOpenFolder(cbprops); popupState.close(e); }}>Open Folder</MenuItem>
          <MenuItem onClick={e => { appQuit(); popupState.close(e); }}>Exit</MenuItem>
        </Menu>
      </React.Fragment>
      }</PopupState>

    <Separator />
    <SelectViewButtons selected={mode.selected} setSelected={mode.setSelected} />
    <Separator />
    <Label text={doc.file?.name ?? "<Unnamed>"} />
    <Separator />
    <EditHeadButton head={head} setDoc={setDoc} />

    <Filler />

    <Separator />
    <OpenFolderButton filename={doc.file?.id}/>
    <HelpButton setDoc={setDoc}/>
    <SettingsButton />
  </ToolBox>
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
    const {setDoc} = this.props
    return <Button tooltip="Help" onClick={e => onHelp(setDoc)}>
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

async function onHelp(setDoc) {
  //setDoc({})
  const utf8decoder = new TextDecoder();
  const buffer = utf8decoder.decode(await fs.readResource("examples/UserGuide.mawe"))
  //console.log(buffer)
  //const tree = mawe.buf2tree(buffer)
  //const story = mawe.fromXML(tree)
  setDoc({ buffer })
}

//-----------------------------------------------------------------------------

async function onNewFile({ doc, setDoc }) {
  setDoc({
    buffer: '<story format="mawe" />'
  })
}

async function onOpenFile({ doc, setDoc }) {
  //const dirname = await fs.dirname(doc.file.id)
  const { canceled, filePaths } = await fileOpenDialog({
    filters,
    defaultPath: doc.file?.id ?? ".",
    properties: ["OpenFile"],
  })
  if (!canceled) {
    const [filePath] = filePaths

    console.log("Load file:", filePath)
    setDoc(await mawe.load(filePath))
    //enqueueSnackbar("Loaded", {variant: "success"});
  }
}

async function onSaveFile({ doc, setDoc }) {
  if (doc.file) {
    mawe.save(doc)
    return;
  }
  onSaveFileAs({ doc, setDoc })
}

async function onSaveFileAs({ doc, setDoc }) {
  const { canceled, filePath } = await fileSaveDialog({
    filters,
    defaultPath: doc.file?.id ?? "./NewDoc.mawe",
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
  if (!canceled) {
    console.log("Save File As", filePath)
    mawe.saveas(doc, filePath)
      .then(() => fs.fstat(filePath))
      .then(file => setDoc(doc => ({ ...doc, file })))
  }
}
