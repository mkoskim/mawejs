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
  useEffect, useState, useReducer
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

import {docLoad, docSave, docSaveAs, docUpdate} from "./doc"
import {mawe} from "../../document"

import { fileOpenDialog, fileSaveDialog } from "../../system/dialog"

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs");

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
    //mode: "outliner"
    //mode: "export"
  );

  const mode = {
    choices: ["editor", "outliner", "export"],
    value: _mode,
    setValue: _setMode,
  }

  //---------------------------------------------------------------------------
  // TODO: Improve doc architecture!!!

  /*
  const [id, _setId] = useState(
    "./local/UserGuide.mawe"
    //const id = "./local/EmptyDoc.mawe";
    //const id = "./local/TestDoc1.mawe";
    //const id = "./local/TestDoc2.mawe";
    //const id = "./local/Lorem30k.mawe";

    //"./local/mawe2/NeljaBarnaa.mawe"
    //const id = "./local/mawe2/JazramonGjerta.mawe";
    //const id = "./local/mawe2/LammenHirvio.mawe";
    //const id = "./local/mawe2/CasaMagda.mawe";
  )

  function setId(id) {
    _setId(id)
    _setDoc()
  }

  */

  const [doc, _setDoc] = useState({
    load: "./local/UserGuide.mawe",
  })

  function setDoc(value) {
    _setDoc(value)
    docUpdate(value)
  }

  useEffect(() => {
    if(!doc.story) {
      if(doc.load) {
        console.log("Loading:", doc.load)
        docLoad(doc.load).then(content => setDoc(content))
      }
      else if(doc.buffer) {
        setDoc(mawe.create(doc.buffer))
      }
    }
  }, [doc.file?.id, doc.load, doc.buffer])

  if(!doc.story) return <Loading/>

  //---------------------------------------------------------------------------

  const props2 = {mode, doc, setDoc}

  return (
    <ThemeProvider theme={myTheme}>
    <VBox className="ViewPort">
      <WorkspaceTab {...props2}/>
      <ChooseView {...props2}/>
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
        <MenuItem onClick={e => {onRename(cbprops); popupState.close(e); }}>Rename</MenuItem>
        <MenuItem onClick={e => {popupState.close(e); }}>Make a copy</MenuItem>
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
    <Label text={doc.story.name}/>
    <Separator/>
    <Filler/>
    <Separator/>
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
  const {cancelled, filePaths} = await fileOpenDialog({
    filters,
    defaultPath: doc.file?.id ?? ".",
    properties: ["OpenFile"],
  })
  if(!cancelled) {
    const [filePath] = filePaths
    console.log("Load file:", filePath)
    setDoc({load: filePath})
  }
}

async function onSaveFile({doc, setDoc}) {
  if(doc.file) {
    docSave(doc)
    return;
  }

  const {cancelled, filePath} = await fileSaveDialog({
    filters,
    defaultPath: ".",
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
  if(!cancelled) {
    console.log("Save File", filePath)
    docSaveAs(doc, filePath)
    setDoc({
      ...doc,
      file: await fs.fstat(filePath)
    })
  }
}

async function onRename({doc}) {
  //const dirname = await fs.dirname(doc.file.id)
  const {cancelled, filePath} = await fileSaveDialog({
    filters,
    defaultPath: doc.file.id,
    properties: ["createDirectory", "showOverwriteConfirmation"],
  })
  if(!cancelled) {
    console.log("File", filePath)
  }
}

async function onOpenFolder({doc}) {
  const dirname = await doc.file ? fs.dirname(doc.file.if) : "."
  console.log("Open folder:", dirname)
  fs.openexternal(dirname)
}
