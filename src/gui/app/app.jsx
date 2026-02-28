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
  useEffect, useState, useCallback,
  useMemo, useContext,
  useDeferredValue,
} from "react"

import {
  VBox, Filler,
  ToolBox, Button, Icon, IconButton,
  IsKey, addHotkeys,
  Separator,
  Menu, MenuItem,
  Inform, Snackbar,
} from "../common/factory";

import {
  OpenFolderButton,
  HeadInfo, CharInfo, WordsToday, ActualWords, TargetWords, MissingWords
} from "../common/components";

//import { WorkspaceBar } from "../sketches/workspacebar/workspacebar";

import {
  CmdContext, cmdDispatch,
  reqNew,
  reqOpenFile,
  reqLoadFile, reqLoadResource,
  reqImportFile, reqImportClipboard,
  reqRenameFile,
  reqSaveFile, reqSaveFileAs,
  reqCloseFile, reqQuit,
  doRename, doLoadFile,
  reqOpenRecentDlg,
} from "./context"

import {
  documentInfo
} from "../slatejs/slateDocument";

import { SettingsContext, useSetting } from "./settings"
import { ViewSelectButtons, ViewSwitch } from "./views";
import { useImmer } from "use-immer"

import { appInfo, appLog, appZoomIn, appZoomOut, appZoomReset } from "../../system/host"
import { ImportDialog } from "../import/import";

import { peekKeys } from "../common/hotkeys";
import { RecentDialog } from "./recent";

//*****************************************************************************
//
// Application main
//
//*****************************************************************************

export function App(props) {

  //---------------------------------------------------------------------------
  // Get application info (name & version)
  //---------------------------------------------------------------------------

  const [app, setAppInfo] = useState()

  useEffect(() => {
    console.clear()
    appInfo().then(info => {
      console.log("Application:", info)
      console.log("React:", React.version)
      setAppInfo(info)
    })
  }, [])

  //---------------------------------------------------------------------------
  // External settings
  //---------------------------------------------------------------------------

  const [recent, setRecent] = useSetting("recent", [])

  const settings = useMemo(() => ({
    recent, setRecent,
  }), [recent, setRecent])

  //---------------------------------------------------------------------------
  // Loaded story
  //---------------------------------------------------------------------------

  const [doc, updateDoc] = useImmer(null)

  //---------------------------------------------------------------------------
  // Simple dirty logic. We use shallow compare to see, what elements have
  // been touched. Exclude ui & exports elements, even that they are stored
  // within the file.
  //---------------------------------------------------------------------------

  const [saved, setSaved] = useState(null)

  const dirty = !(
    doc?.head === saved?.head
    && doc?.draft === saved?.draft
    && doc?.storybook === saved?.storybook
    && doc?.notes === saved?.notes
  )

  //---------------------------------------------------------------------------
  // Dialog rendering
  //---------------------------------------------------------------------------

  const [dialogs, setDialogs] = useImmer({})

  //---------------------------------------------------------------------------
  // Simple command structure for deeper level components to ask Application
  // to perform operations
  //---------------------------------------------------------------------------

  const [command, setCommand] = useState()
  const dispatchArgs = {dirty, doc, updateDoc, setSaved, recent, setRecent, setCommand, setDialogs}

  useEffect(() => {
    if (!command) return
    const {action} = command
    switch(action) {
      case "success": { Inform.success(command.message); break; }
      case "info": { Inform.info(command.message); break; }
      case "warning": { Inform.warning(command.message); break; }
      case "error": { Inform.error(command.message); break; }
      default: {
        cmdDispatch(command, dispatchArgs);
        break;
      }
    }
  }, [command])

  /*
  //---------------------------------------------------------------------------
  // Prevent window from closing when there are unsaved changes. We will ask
  // user, if they want to save changes before closing.
  //---------------------------------------------------------------------------

  window.onbeforeunload = async (event) => {
    appLog("onbeforeunload");
    const response = await cmdDispatch({action: "do-confirm"}, dispatchArgs)
    appLog(`Confirm response: ${response}`)
    //if(!response) event.preventDefault();
  }
  */

  //---------------------------------------------------------------------------
  // Startup command
  //---------------------------------------------------------------------------

  useEffect(() => {
     //*
    //console.log("Recent:", recent)
    if (recent?.length) doLoadFile({ setCommand, filename: recent[0].id })
    //doLoadFile({ setCommand, filename: "./examples/import/Frankenstein.mawe.gz" })
    /*/
    setCommand({
      action: "import",
      file: {id: "./examples/import/lorem.txt", name: "lorem.txt" }, ext: ".txt",
      //file: {id: "./examples/import/Frankenstein.txt", name: "Frankenstein.txt" }, ext: ".txt",
      //file: {id: "./examples/import/Frankenstein.md", name: "Frankenstein.md" }, ext: ".md",
    })
    /**/
  }, [])

  //---------------------------------------------------------------------------
  // Add application hotkeys common to all views
  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys([
    //[IsKey.CtrlQ, (e) => appQuit()],
    [IsKey.CtrlNumAdd, (e) => appZoomIn().then(factor => setDialogs(d => { d.zoom = {factor}; }))],
    [IsKey.CtrlNumSub, (e) => appZoomOut().then(factor => setDialogs(d => { d.zoom = {factor}; }))],
    [IsKey.Ctrl0, (e) => appZoomReset().then(factor => setDialogs(d => { d.zoom = {factor}; }))],
  ]), []);

  //useEffect(() => peekKeys(), []);

  //---------------------------------------------------------------------------
  // Set window title
  //---------------------------------------------------------------------------

  useEffect(() => {
    const name = app ? `${app.name} (v${app.version})` : ""
    if (doc?.head) {
      document.title = (dirty ? "* " : "") + documentInfo(doc.head).title + " - " + name
    } else {
      document.title = name
    }
  }, [doc?.head, dirty, app])

  //---------------------------------------------------------------------------
  // Render
  //---------------------------------------------------------------------------

  return (
    <SettingsContext value={settings}>
      <CmdContext value={setCommand}>
        <View key={doc?.key} doc={doc} updateDoc={updateDoc}/>
        <RenderDialogs dialogs={dialogs} setDialogs={setDialogs} setRecent={setRecent} />
      </CmdContext>
    </SettingsContext>
  )
}

//*****************************************************************************
//
// Document view
//
//*****************************************************************************

function View({ doc, updateDoc }) {

  //const [view, setView] = useSetting(doc?.file?.id, getViewDefaults(null))
  //const [view, setView] = useState(() => getViewDefaults())

  return (
    <VBox className="ViewPort">
      {/* <WorkspaceBar doc={doc}/> /**/}
      {//*
      <DocBar doc={doc} updateDoc={updateDoc} />
      /**/}
      <ViewSwitch doc={doc} updateDoc={updateDoc} />
    </VBox>
  )
}

//*****************************************************************************
//
// Dialogs and popups
//
//*****************************************************************************

function RenderDialogs({ dialogs, setDialogs, setRecent }) {
  return <>
    {dialogs.importing && <ImportDialog setDialogs={setDialogs} {...dialogs.importing}/>}
    {dialogs.recent && <RecentDialog setDialogs={setDialogs} setRecent={setRecent} {...dialogs.recent}/>}
    {dialogs.zoom && <ZoomSnackbar setDialogs={setDialogs} {...dialogs.zoom} />}
  </>

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------

function ZoomSnackbar({ factor, setDialogs }) {

  const zoomAnchor = useMemo(() => ({vertical: "top", horizontal: "right" }), [])
  const close = useCallback(() => setDialogs(d => { delete d.zoom; }), [])

  return <Snackbar
    open={true}
    message={`Zoom: ${Math.round(factor * 100)}%`}
    autoHideDuration={1500}
    anchorOrigin={zoomAnchor}
    onClose={close}
  />
  }
}

//*****************************************************************************
//
// Document toolbar
//
//*****************************************************************************

function DocBar({ doc, updateDoc }) {
  const { recent } = useContext(SettingsContext)
  const setCommand = useContext(CmdContext)
  const file = doc?.file

  useEffect(() => addHotkeys([
    [IsKey.CtrlN, (e) => reqNew({ setCommand })],
    [IsKey.CtrlO, (e) => reqOpenFile({ setCommand, file })],
  ]), [file]);

  //console.log("Recent:", recent)
  if (!doc) return <WithoutDoc setCommand={setCommand} recent={recent} />
  return <WithDoc setCommand={setCommand} recent={recent} doc={doc} updateDoc={updateDoc} />
}

function WithoutDoc({ setCommand, recent }) {
  return <ToolBox>
    <FileMenu setCommand={setCommand} recent={recent} />
    <Separator />
    <Filler />
    <Separator />
    <HelpButton setCommand={setCommand} />
    {/* <SettingsButton /> */}
  </ToolBox>
}

function WithDoc({ setCommand, doc, updateDoc, recent }) {
  const file = doc?.file
  const { head, draft } = doc
  const setSelected = useCallback(value => updateDoc(doc => { doc.ui.view.selected = value }), [])

  const { chars, text, missing } = useDeferredValue({
    chars: 0,
    text: 0,
    missing: 0,
    ...(draft.words ?? {})
  })

  useEffect(() => addHotkeys([
    [IsKey.CtrlS, (e) => reqSaveFile({setCommand})],
    [IsKey.CtrlW, (e) => reqCloseFile({setCommand})],
  ]), [file])

  return <ToolBox>
    <FileMenu file={file} setCommand={setCommand} recent={recent} hasdoc={true}/>
    <FileOperations file={file} setCommand={setCommand}/>
    <Separator />
    <ViewSelectButtons selected={doc.ui.view.selected} setSelected={setSelected} />
    <Separator />

    <HeadInfo head={head} updateDoc={updateDoc} />

    <Separator />
    <Filler />
    <Separator />

    <ActualWords text={text} />
    <Separator />
    <WordsToday text={text} last={doc.head.last} />
    <Separator />
    <TargetWords text={text} missing={missing} />
    &nbsp;
    <MissingWords missing={missing} />
    <Separator />
    <CharInfo chars={chars} />
    {/* <CloseButton setCommand={setCommand}/> */}

    <Separator />
    <HelpButton setCommand={setCommand} />
    {/* <SettingsButton /> */}
  </ToolBox>
}

//-----------------------------------------------------------------------------

class FileOperations extends React.PureComponent {
  static gzip_style = {
    fontSize: "10pt",
    border: "2px solid",
    //paddingLeft: "2px",
    //paddingRight: "2px",
    //paddingTop: "2px",
    paddingBottom: "2px",
    borderRadius: "3px",
  }
  static gunzip_style = {
    ...this.gzip_style,
    textDecorationLine: "line-through",
    textDecorationThickness: "2px",
    textDecorationColor: "rgb(240, 80, 40)",
  }

  toggleCompress(file, setCommand) {
    const compressed = file.id.endsWith(".gz")
    const filename = compressed ? file.id.slice(0, -3) : (file.id + ".gz")
    //setCommand({action: "rename", filename})
    doRename({setCommand, filename})
  }

  render() {
    const {file, setCommand} = this.props
    const compressed = file?.id.endsWith(".gz") ?? false
    const {gzip_style, gunzip_style} = this.constructor
    const compress_style = compressed ? gunzip_style : gzip_style
    const compress_tooltip = compressed ? "Uncompress" : "Compress"
    //const filename = file?.name ?? "<Unnamed>"

    return <>
      <Button disabled={!file} tooltip={compress_tooltip} onClick={e => this.toggleCompress(file, setCommand) }><span style={compress_style}>&nbsp;gz&nbsp;</span></Button>
      <OpenFolderButton filename={file?.id} />
      </>
  }
}

//-----------------------------------------------------------------------------

class FileMenu extends React.PureComponent {
  render() {
    const { setCommand, file, recent, hasdoc } = this.props
    const filename = file?.name ?? "<Unnamed>"
    const name = hasdoc ? filename : <Icon.Menu />

    return null;
    /*
    return <PopupState variant="popover">
      {(popupState) => <React.Fragment>
        <Button tooltip="File menu" {...bindTrigger(popupState)}>{name}</Button>
        <Menu {...bindMenu(popupState)}>
          <MenuItem
            title="New" endAdornment="Ctrl-N"
            onClick={e => { reqNew({ setCommand }); popupState.close(e); }}
            />
          <MenuItem
            title="Open" endAdornment="Ctrl-O"
            onClick={e => { reqOpenFile({ setCommand, file }); popupState.close(e); }}
            />
          <MenuItem
            title="Open Recent..."
            onClick={(e => { reqOpenRecentDlg({ setCommand }); popupState.close(e); })}
            />
          <Separator />
          <RecentItems recent={recent} setCommand={setCommand} popupState={popupState} />
          <Separator />
          <MenuItem
            title="Import File..."
            onClick={e => { reqImportFile({ setCommand, file }); popupState.close(e); }}
            />
          <MenuItem
            title="Import From Clipboard"
            onClick={e => { reqImportClipboard({ setCommand }); popupState.close(e); }}
            />
          <Separator />
          <MenuItem
            title="Save" endAdornment="Ctrl-S"
            disabled={!file} onClick={e => { reqSaveFile({ setCommand, file }); popupState.close(e); }}
            />
          <MenuItem
            title="Save as..."
            disabled={!hasdoc} onClick={e => { reqSaveFileAs({ setCommand, file }); popupState.close(e); }}
            />
          <MenuItem
            title="Rename..."
            disabled={!file} onClick={e => { reqRenameFile({ setCommand, file }); popupState.close(e); }}
            />
          <MenuItem
            title="Close" endAdornment="Ctrl-W"
            disabled={!hasdoc} onClick={e => { reqCloseFile({ setCommand, file }); popupState.close(e); }}
            />
          {/*
          <MenuItem onClick={popupState.close}>Revert</MenuItem>
          <MenuItem onClick={e => { popupState.close(e); }}>Open Folder</MenuItem>}
          <Separator />
          <MenuItem
            title="Quit" //endAdornment="Ctrl-Q"
            onClick={e => { reqQuit({setCommand}); popupState.close(e); }}
          />
        </Menu>
      </React.Fragment>
      }
    </PopupState>
    */
  }
}

class RecentItems extends React.PureComponent {
  render() {
    const { recent, setCommand, popupState } = this.props
    if (!recent?.length) return null
    //console.log("Recent:", recent.length)
    const head = recent.slice(0, 4)
    return <>
      {head.map(entry => <MenuItem
        key={entry.id}
        title={entry.name}
        onClick={(e => { reqLoadFile({ setCommand, filename: entry.id }); popupState.close(e); })}
        />
      )}
    </>
  }
}

class HelpButton extends React.PureComponent {
  render() {
    const { setCommand } = this.props

    return null;
    /*
    return <PopupState variant="popover" popupId="file-menu">
    {(popupState) => <React.Fragment>
      <IconButton tooltip="Help" {...bindTrigger(popupState)}><Icon.Help/></IconButton>
      <Menu {...bindMenu(popupState)}>
        <MenuItem title="Tutorial (English)"
          onClick={e => { popupState.close(e); reqLoadResource({setCommand, filename: "examples/tutorial/Tutorial.en.mawe"})}}
          />
        <MenuItem title="Tutorial (Finnish)"
          onClick={e => { popupState.close(e); reqLoadResource({setCommand, filename: "examples/tutorial/Tutorial.fi.mawe"})}}
          />
      </Menu>
    </React.Fragment>}
    </PopupState>
    */
  }
}
