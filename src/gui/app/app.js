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

import { SnackbarProvider, enqueueSnackbar } from "notistack";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { SingleEditView } from "../editor/editor";
import { Organizer } from "../outliner/outliner";
import { Export } from "../export/export"
import { Chart } from "../chart/chart"

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

  const [_mode, _setMode] = useState(
    "editor"
    //"outliner"
    //"chart"
    //"export"
  );

  const mode = {
    selected: _mode,
    setSelected: _setMode,
  }

  const [focusTo, _setFocusTo] = useState(undefined)

  const setFocusTo = useCallback(value => {
    _setMode("editor")
    _setFocusTo(value)
  }, [])

  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys({
    "mod+q": (e) => appQuit(),
  }));

  //---------------------------------------------------------------------------
  // TODO: Improve doc architecture!!!

  const [doc, setDoc] = useState({
    //load: "./local/EmptyDoc.mawe",
    //load: "./local/TestDoc1.mawe"
    //load: "./local/UserGuide.mawe",
    //load: "./local/mawe2/GjertaAvaruudessa.2.mawe"
    //load: "./local/mawe2/GjertaAvaruudessa.3.mawe"
    //load: "./local/mawe2/GjertaViidakossa.mawe"
    //load: "./local/mawe2/NeljaBarnaa.mawe",
    //buffer: '<story format="mawe"><body><part/></body><notes><part/></notes></story>'
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

  const viewprops = { mode, doc, setDoc, focusTo, setFocusTo }

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
      <VBox className="ViewPort">
        <WorkspaceTab {...viewprops} />
        <ChooseView key={doc.file?.id} {...viewprops} />
      </VBox>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

function ChooseView({ mode, doc, setDoc, focusTo, setFocusTo }) {
  const props = { doc, setDoc, focusTo, setFocusTo }

  switch (mode.selected) {
    case "editor": return <SingleEditView {...props} />
    case "outliner": return <Organizer {...props} />
    case "export": return <Export {...props} />
    case "chart": return <Chart {...props} />
    default: break;
  }
  return null;
}

//-----------------------------------------------------------------------------

function WorkspaceTab({ mode, doc, setDoc }) {
  //console.log("Workspace: id=", id)
  //console.log("Workspace: doc=", doc)

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
    <SelectViewButtons selected={mode.selected} setSelected={mode.setSelected}/>

    <Separator />
    <Label text={doc.file?.name ?? "<Unnamed>"} />
    <Separator />

    <Filler />

    <Separator />
    <OpenFolderButton filename={doc.file?.id}/>
    <HelpButton setDoc={setDoc}/>
    <SettingsButton />
  </ToolBox>
}

class SelectViewButtons extends React.PureComponent {

  choices = ["editor", "outliner", "chart", "export"]
  viewbuttons = {
    "editor": { tooltip: "Editor", icon: <Icon.View.Edit /> },
    "outliner": { tooltip: "Outline", icon: <Icon.View.Outline /> },
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
  const buffer = await mawe.file2buf({ id: "./local/UserGuide.mawe" })
  //const tree = mawe.buf2tree(buffer)
  //const story = mawe.fromXML(tree)
  setDoc({ buffer })
}

//-----------------------------------------------------------------------------

async function onNewFile({ doc, setDoc }) {
  setDoc({
    buffer: '<story format="mawe"><body><part/></body><notes><part/></notes></story>'
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
