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


import {SingleEditView} from "../editor/editor";
import {Organizer} from "../outliner/outliner";
import {Export} from "../export/export"

import {docLoad, docSave, docUpdate} from "../editor/doc"
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
          padding: "8px",
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

  console.log("App")

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

  const [id, setId] = useState(
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

  //---------------------------------------------------------------------------
  // TODO: Improve doc architecture!!!

  const [file, setFile] = useState()

  useEffect(() => {
    fs.fstat(id).then(file => setFile(file))
  }, [id])

  const [doc, _setDoc] = useState(undefined)

  function setDoc(value) {
    _setDoc(value)
    docUpdate(value)
  }

  useEffect(() => {
    if(id) docLoad(id)
      .then(content => setDoc(content))
  }, [id])

  if(!doc || doc.file.id !== file.id) return <Loading/>

  //---------------------------------------------------------------------------

  const props2 = {mode, id, setId, doc, setDoc}

  return (
    <ThemeProvider theme={myTheme}>
    <VBox className="ViewPort">
      <WorkspaceTab {...props2}/>
      <ChooseView {...props2}/>
      </VBox>
    </ThemeProvider>
  )
}

function ChooseView({mode, id, setId, doc, setDoc}) {
  const props={id, setId, doc, setDoc}

  switch(mode.value) {
    case "editor": return <SingleEditView {...props}/>
    case "outliner": return <Organizer {...props}/>
    case "export": return <Export {...props}/>
    default: break;
  }
  return null;
}

//-----------------------------------------------------------------------------

function WorkspaceTab({mode, id, doc, setId}) {
  console.log("Workspace:", doc)

  useEffect(() => addHotkeys({
    //"mod+o": (e) => onClose(e, dispatch),
    //"mod+w": (e) => onClose(e, dispatch),
    //"mod+s": (e) => mawe.saveas(docByID(id), path.join(cwd, "/testwrite.mawe")),
    "mod+s": (e) => docSave(doc),
  }));

  const filters = [
    { name: 'Mawe Files', extensions: ['moe', 'mawe', 'mawe.gz'] },
    { name: 'All Files', extensions: ['*'] }
  ]

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => { setAnchorEl(event.currentTarget); };
  const handleClose = () => { setAnchorEl(null); };

  return <ToolBox>
    <Button
      id="basic-button"
      aria-controls={open ? 'basic-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      onClick={handleClick}
    >
      File
    </Button>
    <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClose}>New</MenuItem>
        <MenuItem onClick={onOpenFile}>Open...</MenuItem>
        <MenuItem onClick={handleClose}>Save</MenuItem>
        <MenuItem onClick={onSaveFileAs}>Save As...</MenuItem>
        <MenuItem onClick={handleClose}>Revert</MenuItem>
        <MenuItem onClick={onOpenFolder}>Open Folder</MenuItem>
      </Menu>
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
    <Tooltip title="Help"><Button><Icon.Help /></Button></Tooltip>
    <Tooltip title="Settings"><Button><Icon.Settings /></Button></Tooltip>
  </ToolBox>


async function onOpenFile(event) {
  console.log("Open file...")
  //const dirname = await fs.dirname(doc.file.id)
  const {cancelled, filePaths} = await fileOpenDialog({
    filters,
    defaultPath: doc.file.id,
    properties: ["OpenFile"],
  })
  if(!cancelled) {
    const [filePath] = filePaths
    console.log("File", filePath)
    setId(filePath)
  }
  handleClose()
}

  async function onSaveFileAs(event) {
    console.log("Save file as...")
    //const dirname = await fs.dirname(doc.file.id)
    const {cancelled, filePath} = await fileSaveDialog({
      filters,
      defaultPath: doc.file.id,
      properties: ["createDirectory", "showOverwriteConfirmation"],
    })
    if(!cancelled) {
      console.log("File", filePath)
    }
    handleClose()
  }

  async function onOpenFolder(event) {
    console.log("Open folder...")
    const dirname = await fs.dirname(doc.file.id)
    fs.openexternal(dirname)
    handleClose()
  }
}
