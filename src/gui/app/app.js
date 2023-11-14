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
  SearchBox,
  IsKey, addHotkeys,
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

import { mawe } from "../../document"
import { nanoid } from '../../util';

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

  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys([
    [IsKey.CtrlQ,  (e) => appQuit()],
  ]));

  //---------------------------------------------------------------------------
  // TODO: Improve doc architecture!!!

  const [command, setCommand] = useState({
    //load: "./examples/Empty.mawe",
    //load: "./examples/TestDoc1.mawe"
    //load: "./examples/TestDoc2.mawe"
    //load: "./examples/UserGuide.mawe",
    //load: "./examples/Lorem30k.mawe"
    //load: "./examples/Compressed.mawe.gz"

    //load: "./local/mawe2/GjertaAvaruudessa.2.mawe"
    load: "./local/mawe2/GjertaAvaruudessa.3.mawe"
    //load: "./local/mawe2/GjertaViidakossa.mawe"
    //load: "./local/mawe2/NeljaBarnaa.mawe",
    //load: "./local/cantread.mawe",
    //buffer: '<story format="mawe" />'
  })

  const [doc, setDoc] = useState(null)

  //---------------------------------------------------------------------------
  // Doc command interface: Let's try this, we can give command, which then
  // updates doc/story.

  useEffect(() => {
    if(command?.load) {
      console.log("Loading:", command.load)
      mawe.load(command.load)
        .then(content => {
          setDoc({
            ...content,
            key: nanoid(),
          })
          enqueueSnackbar("Loaded", {variant: "success"});
        })
        .catch(err => enqueueSnackbar(String(err), {variant: "error"}))
    }
    else if(command?.buffer) {
      setDoc({
        ...mawe.create(command.buffer),
        key: nanoid(),
      })
    }
    else if(command?.save) {
      mawe.save(doc)
        .then(() => enqueueSnackbar("Saved", {variant: "success"}))
        .catch(err => enqueueSnackbar(String(err), {variant: "error"}))
    }
    else if(command?.saveas) {
      const filePath = command.saveas
      console.log("Save File As", filePath)
      mawe.saveas(doc, filePath)
        .then(() => {
          setDoc(doc => ({ ...doc, file: { id: filePath } }))
          enqueueSnackbar("Saved", {variant: "success"})
        })
        .catch(err => enqueueSnackbar(String(err), {variant: "error"}))
    }
    if(command?.error) {
      enqueueSnackbar(command.error, {variant: "error"});
    }
  }, [command])

  //---------------------------------------------------------------------------

  const [mode, setMode] = useState(
    "editor"
    //"organizer"
    //"chart"
    //"export"
  );

  //---------------------------------------------------------------------------
  // Use key to force editor state reset when file is changed: It won't work
  // for generated docs (user guide, new doc), but we fix that later.

  const viewprops = { command, setCommand, mode, setMode, doc, setDoc }

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
      <VBox className="ViewPort">
        <WorkspaceTab {...viewprops} />
        <ViewSwitch key={doc?.key} {...viewprops} />
      </VBox>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

//-----------------------------------------------------------------------------

class SelectViewButtons extends React.PureComponent {

  choices = ["editor", "organizer", "chart", "export"]
  viewbuttons = {
    "editor": { tooltip: "Editor", icon: <Icon.View.Edit /> },
    "organizer": { tooltip: "Organizer", icon: <Icon.View.Organize /> },
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

function ViewSwitch({ mode, setMode, doc, setDoc }) {

  const [focusTo, _setFocusTo] = useState(undefined)

  const setFocusTo = useCallback(value => {
    setMode("editor")
    _setFocusTo(value)
  }, [])

  const props = { doc, setDoc, focusTo, setFocusTo }

  if(!doc?.story) return <Loading />

  switch (mode) {
    case "editor": return <SingleEditView {...props} />
    case "organizer": return <Organizer {...props} />
    case "export": return <Export {...props} />
    case "chart": return <Chart {...props} />
    default: break;
  }
  return null;
}

//-----------------------------------------------------------------------------

function WorkspaceTab({ setCommand, mode, setMode, doc, setDoc }) {
  //console.log("Workspace: id=", id)
  //console.log("Workspace: doc=", doc)

  const file = doc?.file

  useEffect(() => addHotkeys([
    [IsKey.CtrlN, (e) => onNewFile({setCommand, file})],
    [IsKey.CtrlO, (e) => onOpenFile({setCommand, file})],
    [IsKey.CtrlS, (e) => onSaveFile({setCommand, file})],
  ]));

  return <ToolBox>
    <FileMenu setCommand={setCommand} file={file}/>
    <Separator/>

    <DocInfoBar mode={mode} setMode={setMode} doc={doc} setDoc={setDoc}/>

    <Filler />
    <Separator />
    <OpenFolderButton filename={doc?.file?.id}/>
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
    const {mode, setMode, doc, setDoc} = this.props

    if(!doc) return null

    const filename = doc.file?.name ?? "<Unnamed>"
    const {body} = doc.story
    const {head} = body

    return <>
      <SelectViewButtons selected={mode} setSelected={setMode}/>

      <Separator />
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
  //setDoc({})
  const utf8decoder = new TextDecoder();
  const buffer = utf8decoder.decode(await fs.readResource("examples/UserGuide.mawe"))
  //console.log(buffer)
  //const tree = mawe.buf2tree(buffer)
  //const story = mawe.fromXML(tree)
  setCommand({ buffer })
}

//-----------------------------------------------------------------------------

async function onNewFile({ setCommand }) {
  setCommand({
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
    const [filePath] = filePaths

    console.log("Load file:", filePath)
    setCommand({load: filePath})
  }
}

async function onSaveFile({ setCommand, file }) {
  if (file) {
    setCommand({save: true})
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
    setCommand({saveas: filePath})
  }
}
