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
  useEffect, useState, useReducer, useCallback
} from "react"

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
  Menu, MenuItem, MakeToggleGroup,
} from "../common/factory";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import {SingleEditView} from "../editor/editor";
import {Organizer} from "../outliner/outliner";
import {Export} from "../export/export"

import {mawe} from "../../document"

import { fileOpenDialog, fileSaveDialog } from "../../system/dialog"

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs")

//-----------------------------------------------------------------------------

const myTheme = createTheme({
  palette: {
    primary: {
      main: "#222",
    },
  },
  /*
  typography: {
    fontSize: 12,
  },
  */
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 0,
          fontSize: "12pt",
          lineHeight: 1.0,
          padding: "8px 8px",
          margin: 0,
        },
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
        },
      }
    },
    MuiBreadcrumbs: {
      styleOverrides: {
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "11pt",
        }
      }
    },
  },
});

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
    //"export"
  );

  const mode = {
    choices: ["editor", "outliner", "export"],
    value: _mode,
    setValue: _setMode,
  }

  //---------------------------------------------------------------------------
  // TODO: Improve doc architecture!!!

  const [doc, setDoc] = useState({
    //load: "./local/TestDoc1.mawe"
    load: "./local/UserGuide.mawe",
    //load: "./local/mawe2/JazramonGjerta.mawe"
    //load: "./local/mawe2/JazraGjertaViidakossa.mawe"
    //load: "./local/mawe2/NeljaBarnaa.mawe",
  })

  useEffect(() => {
    if(!doc.story) {
      if(doc.load) {
        console.log("Loading:", doc.load)
        mawe.load(doc.load).then(content => setDoc(content))
      }
      else if(doc.buffer) {
        setDoc(mawe.create(doc.buffer))
      }
    }
  }, [doc.file?.id, doc.load, doc.buffer])

  if(!doc.story) return <Loading/>

  //---------------------------------------------------------------------------
  // Use key to force editor state reset when file is changed: It won't work
  // for generated docs (user guide, new doc), but we fix that later.

  const viewprops = {mode, doc, setDoc}

  return (
    <ThemeProvider theme={myTheme}>
    <VBox className="ViewPort">
      <WorkspaceTab {...viewprops}/>
      <ChooseView key={doc.file?.id} {...viewprops}/>
      </VBox>
    </ThemeProvider>
  )
}

function ChooseView({mode, doc, setDoc}) {
  const props={doc, setDoc}

  switch(mode.value) {
    case "editor": return <SingleEditView {...props}/>
    case "outliner": return <Organizer {...props}/>
    case "export": return <Export {...props}/>
    default: break;
  }
  return null;
}

//-----------------------------------------------------------------------------

function WorkspaceTab({mode, doc, setDoc}) {
  //console.log("Workspace: id=", id)
  //console.log("Workspace: doc=", doc)

  const cbprops = {doc, setDoc}

  useEffect(() => addHotkeys({
    "mod+o": (e) => onOpenFile(cbprops),
    "mod+s": (e) => onSaveFile(cbprops),
  }));

  return <ToolBox>
    <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
      <Button {...bindTrigger(popupState)}><Icon.Menu/></Button>
      <Menu {...bindMenu(popupState)}>
        <MenuItem onClick={e => {onNewFile(cbprops); popupState.close(e); }}>New</MenuItem>
        <MenuItem onClick={e => {onOpenFile(cbprops); popupState.close(e); }}>Open...</MenuItem>
        <MenuItem onClick={e => {onSaveFile(cbprops); popupState.close(e); }}>Save</MenuItem>
        <MenuItem onClick={e => {onSaveFileAs(cbprops); popupState.close(e); }}>Save As...</MenuItem>
        <MenuItem onClick={popupState.close}>Revert</MenuItem>
        <MenuItem onClick={e => {onOpenFolder(cbprops); popupState.close(e); }}>Open Folder</MenuItem>
      </Menu>
      </React.Fragment>
    }</PopupState>

    <Separator/>
    {MakeToggleGroup({
      "editor": {tooltip: "Editor", icon: <Icon.Action.Edit/>},
      "outliner": {tooltip: "Outline", icon: <Icon.Action.Cards/>},
      "export": {tooltip: "Export", icon: <Icon.Action.Print/>},
    }, mode, true)}

    <Separator/>
    <Label text={doc.file?.name ?? "<Unnamed>"}/>
    <Separator/>

    <Filler/>

    <Separator/>
    <Button tooltip="Open Folder" onClick={e => onOpenFolder(cbprops)}><Icon.Action.Folder /></Button>
    <Button tooltip="Help"><Icon.Help /></Button>
    <Button tooltip="Settings"><Icon.Settings /></Button>
  </ToolBox>
}

//-----------------------------------------------------------------------------

const filters = [
  { name: 'Mawe Files', extensions: ['moe', 'mawe', 'mawe.gz'] },
  { name: 'All Files', extensions: ['*'] }
]

async function onNewFile({doc, setDoc}) {
  setDoc({
    buffer: '<story format="mawe"><body><part/></body><notes><part/></notes></story>'
  })
}

async function onOpenFile({doc, setDoc}) {
  //const dirname = await fs.dirname(doc.file.id)
  const {canceled, filePaths} = await fileOpenDialog({
    filters,
    defaultPath: doc.file?.id ?? ".",
    properties: ["OpenFile"],
  })
  if(!canceled) {
    const [filePath] = filePaths

    console.log("Load file:", filePath)
    setDoc(await mawe.load(filePath))
  }
}

async function onSaveFile({doc, setDoc}) {
  if(doc.file) {
    mawe.save(doc)
    return;
  }
  onSaveFileAs({doc, setDoc})
}

async function onSaveFileAs({doc, setDoc}) {
  const {canceled, filePath} = await fileSaveDialog({
    filters,
    defaultPath: doc.file?.id ?? "./NewDoc.mawe",
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
  if(!canceled) {
    console.log("Save File As", filePath)
    mawe.saveas(doc, filePath)
      .then(() => fs.fstat(filePath))
      .then(file => setDoc(doc => ({...doc, file})))
  }
}

async function onOpenFolder({doc}) {
  const dirname = doc.file ? await fs.dirname(doc.file.id) : "."
  console.log("Open folder:", dirname)
  fs.openexternal(dirname)
}
