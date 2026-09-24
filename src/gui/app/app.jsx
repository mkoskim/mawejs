//*****************************************************************************
//*****************************************************************************
//
// Application main
//
//*****************************************************************************
//*****************************************************************************

import "../common/theme/theme.css"

import React, {
  useEffect, useState, useCallback, useRef,
  useMemo, useContext,
  useDeferredValue,
} from "react"

import {
  VBox, Filler,
  ToolBox, Button, Icon, IconButton,
  IsKey, addHotkeys,
  Separator,
  Menu, Submenu, MenuItem,
  Inform,
} from "../common/factory";

import {
  OpenFolderButton,
  HeadInfo, CharInfo, WordsToday, ActualWords, TargetWords, MissingWords
} from "../common/components";

import { UpdateMenuItem } from "../common/autoupdate.jsx";

//import { WorkspaceBar } from "../sketches/workspacebar/workspacebar";

import {
  CmdContext, CommandStateContext, cmdDispatch,
  reqNew,
  reqOpenFile,
  reqLoadFile, reqLoadResource,
  reqImportFile, reqImportClipboard,
  reqRenameFile,
  reqSaveFile, reqSaveFileAs,
  reqCloseFile, reqQuit,
  doRename, doLoadFile,
  reqOpenRecentDlg,
  doNew,
} from "./context"

import {
  documentInfo
} from "../../slatejs/slateDocument";

import { SettingsContext, useSetting } from "./settings"
import { ViewSelectButtons, ViewSwitch } from "./views";
import { SpellcheckContext, useSpellcheck } from "./spellcheck";
import { useImmer } from "use-immer"

import { appQuit, appZoomIn, appZoomOut, appZoomReset } from "../../system/host"
import { ImportDialog } from "../import/import";

import { peekKeys } from "../common/hotkeys";
import { RecentDialog } from "./recentdlg.jsx";
import { useAppInfo } from "./appinfo.jsx";

//*****************************************************************************
//
// Application main
//
//*****************************************************************************

export function App(props) {

  //---------------------------------------------------------------------------
  // Application info
  //---------------------------------------------------------------------------

  const app = useAppInfo()

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

  const command = useContext(CommandStateContext)
  const setCommand = useContext(CmdContext)
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

  //---------------------------------------------------------------------------
  // Prevent window from closing when there are unsaved changes. We will ask
  // user, if they want to save changes before closing.
  //---------------------------------------------------------------------------

  const confirmingClose = useRef(false)

  useEffect(() => {
    window.onbeforeunload = (event) => {
      if (!dirty) return
      event.preventDefault()
      if (confirmingClose.current) return
      confirmingClose.current = true
      cmdDispatch({action: "do-confirm"}, dispatchArgs)
        .then(confirmed => { if (confirmed) return appQuit(true) })
        .catch(error => Inform.error(error.message))
        .finally(() => { confirmingClose.current = false })
    }
    return () => { window.onbeforeunload = null }
  })

  //---------------------------------------------------------------------------
  // Startup command
  //---------------------------------------------------------------------------

  useEffect(() => {
    //*
    //doNew({setCommand})
    //console.log("Recent:", recent)
    if (recent?.length) doLoadFile({ setCommand, filename: recent[0].id }); else doNew({setCommand});
    //doLoadFile({ setCommand, filename: "./examples/import/Frankenstein.mawe.gz" })
    /*/
    setCommand({
      action: "import",
      file: {id: "./examples/import/lorem.txt", name: "lorem.txt" }, ext: ".txt",
      //file: {id: "./examples/import/Frankenstein.txt", name: "Frankenstein.txt" }, ext: ".txt",
      //file: {id: "./examples/import/Frankenstein.md", name: "Frankenstein.md" }, ext: ".md",
    })
    /**/
    //setDialogs(d => { d.recent = true; }) // Open recent dialog at startup
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
        <View key={doc?.key} doc={doc} updateDoc={updateDoc}/>
        <RenderDialogs dialogs={dialogs} setDialogs={setDialogs} setRecent={setRecent} />
    </SettingsContext>
  )
}

//*****************************************************************************
//
// Document view
//
//*****************************************************************************

function View({ doc, updateDoc }) {
  const spellcheck = useSpellcheck(doc?.head?.lang, doc?.head?.spellcheck === true)

  //const [view, setView] = useSetting(doc?.file?.id, getViewDefaults(null))
  //const [view, setView] = useState(() => getViewDefaults())

  return (
    <SpellcheckContext.Provider value={spellcheck}>
    <VBox className="ViewPort">
      {/* <WorkspaceBar doc={doc}/> /**/}
      {//*
      <DocBar doc={doc} updateDoc={updateDoc} />
      /**/}
      <ViewSwitch doc={doc} updateDoc={updateDoc} />
    </VBox>
    </SpellcheckContext.Provider>
  )
}

//*****************************************************************************
//
// Dialogs and popups
//
//*****************************************************************************

class RenderDialogs extends React.PureComponent {
  render() {
    const {dialogs, setDialogs, setRecent} = this.props
    return <>
      {dialogs.importing && <ImportDialog setDialogs={setDialogs} {...dialogs.importing}/>}
      {dialogs.recent && <RecentDialog setDialogs={setDialogs} setRecent={setRecent} {...dialogs.recent}/>}
      {dialogs.zoom && <ZoomSnackbar setDialogs={setDialogs} {...dialogs.zoom} />}
    </>
  }
}

//-----------------------------------------------------------------------------

function ZoomSnackbar({ factor, setDialogs }) {
  useEffect(() => setDialogs(d => { delete d.zoom; }), []);
  return
  /*
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
  */
}

//*****************************************************************************
//
// Document toolbar
//
//*****************************************************************************

function DocBar({ doc, updateDoc }) {
  const setCommand = useContext(CmdContext)
  const file = doc?.file

  useEffect(() => addHotkeys([
    [IsKey.CtrlN, (e) => reqNew({ setCommand })],
    [IsKey.CtrlO, (e) => reqOpenFile({ setCommand, file })],
  ]), [file]);

  //console.log("Recent:", recent)
  if (!doc) return <WithoutDoc/>
  return <WithDoc doc={doc} updateDoc={updateDoc} />
}

function WithoutDoc({}) {
  const setCommand = useContext(CmdContext)
  const { recent } = useContext(SettingsContext)

  return <ToolBox side="top">
    <FileMenu setCommand={setCommand} recent={recent} />
    <Separator />
    <Filler />
    <Separator />
    <HelpButton setCommand={setCommand} />
    {/* <SettingsButton /> */}
  </ToolBox>
}

function WithDoc({doc, updateDoc}) {
  const setCommand = useContext(CmdContext)
  const { recent } = useContext(SettingsContext)
  const file = doc?.file
  const { head, draft } = doc
  const setSelected = useCallback(value => updateDoc(doc => { doc.ui.view.selected = value }), [])

  useEffect(() => addHotkeys([
    [IsKey.CtrlS, (e) => reqSaveFile({setCommand})],
    [IsKey.CtrlW, (e) => reqCloseFile({setCommand})],
  ]), [file])

  return <ToolBox side="top">
    <FileMenu file={file} setCommand={setCommand} recent={recent} hasdoc={true}/>
    <Separator />
    <ViewSelectButtons selected={doc.ui.view.selected} setSelected={setSelected} />
    <OpenFolderButton filename={file?.id} />
    <Separator />

    <HeadInfo head={head} updateDoc={updateDoc} />

    <Separator />
    <Filler />
    <Separator />

    <DeferredWordCounts words={draft.words} last={head.last} />
    {/* <CloseButton setCommand={setCommand}/> */}

    <Separator />
    <HelpButton setCommand={setCommand} />
    {/* <SettingsButton /> */}
  </ToolBox>
}

//-----------------------------------------------------------------------------

const DeferredWordCounts = React.memo(function DeferredWordCounts({words, last}) {
  const deferredWords = useDeferredValue(words)
  return <WordCounts words={deferredWords} last={last} />
})

class WordCounts extends React.PureComponent {
  render() {
    const {words, last} = this.props
    const {chars = 0, text = 0, missing = 0} = words ?? {}

    return <>
      <ActualWords text={text} />
      <Separator />
      <WordsToday text={text} last={last} />
      <Separator />
      <TargetWords text={text} missing={missing} />
      &nbsp;
      <MissingWords missing={missing} />
      <Separator />
      <CharInfo chars={chars} />
    </>
  }
}

//-----------------------------------------------------------------------------

class FileMenu extends React.PureComponent {
  render() {
    const { setCommand, file, recent, hasdoc } = this.props
    const filename = file?.name ?? "<Unnamed>"
    const compressed = file?.id.endsWith(".gz") ?? false
    const trigger = hasdoc
      ? <Button tooltip="File menu">{filename}</Button>
      : <IconButton tooltip="File menu"><Icon.Menu/></IconButton>;

    //return <Button>{name}</Button>
    return <Menu trigger={trigger}>
      <MenuItem
        title="New" endAdornment="Ctrl+N"
        onClick={e => { reqNew({ setCommand }); }}
        />
      <MenuItem
        title="Open" endAdornment="Ctrl+O"
        onClick={e => { reqOpenFile({ setCommand, file }); }}
        />
      <RecentItems recent={recent} setCommand={setCommand}/>
      <Separator />
      <MenuItem
        title="Import File..."
        onClick={e => { reqImportFile({ setCommand, file }); }}
        />
      <MenuItem
        title="Import From Clipboard"
        onClick={e => { reqImportClipboard({ setCommand }); }}
        />
      <Separator />
      <MenuItem
        title="Save" endAdornment="Ctrl+S"
        disabled={!file} onClick={e => { reqSaveFile({ setCommand, file }); }}
        />
      <MenuItem
        title="Save as..."
        disabled={!hasdoc} onClick={e => { reqSaveFileAs({ setCommand, file }); }}
        />
      <MenuItem
        title="Rename..."
        disabled={!file} onClick={e => { reqRenameFile({ setCommand, file }); }}
        />
      <MenuItem
        title={compressed ? "Uncompress" : "Compress (gzip)"}
        startIcon={compressed && <Icon.Checked/>}
        disabled={!file} onClick={e => { this.toggleCompress(setCommand, file); }}
        />
      <MenuItem
        title="Close" endAdornment="Ctrl+W"
        disabled={!hasdoc} onClick={e => { reqCloseFile({ setCommand, file }); }}
        />
      <Separator />
      <UpdateMenuItem setCommand={setCommand}/>
      <MenuItem
        title="Quit" //endAdornment="Ctrl+Q"
        onClick={e => { reqQuit({setCommand}); }}
      />
    </Menu>
  }

  toggleCompress(setCommand, file) {
    const compressed = file.id.endsWith(".gz")
    const filename = compressed ? file.id.slice(0, -3) : (file.id + ".gz")
    //setCommand({action: "rename", filename})
    doRename({setCommand, filename})
  }
}

//-----------------------------------------------------------------------------

class RecentItems extends React.PureComponent {
  render() {
    const { recent, setCommand } = this.props
    const disabled = !recent?.length
    const trigger = <MenuItem
      disabled={disabled}
      title="Open Recent..."
        endIcon={<Icon.Arrow.Head.Right/>}
      />

    //console.log("Recent:", recent.length)

    if(disabled) return trigger

    const head = recent.slice(0, 5)
    return <Submenu trigger={trigger}>
      {head.map(entry => <MenuItem
        key={entry.id}
        title={entry.name}
        onClick={(e => { reqLoadFile({ setCommand, filename: entry.id }); })}
        />
      )}
      <Separator />
      <MenuItem title="More..."
        onClick={(e => { reqOpenRecentDlg({ setCommand }); })}
      />
    </Submenu>
  }
}

class HelpButton extends React.PureComponent {
  render() {
    const { setCommand } = this.props

    return <Menu trigger={<IconButton tooltip="Help"><Icon.Help/></IconButton>}>
      <MenuItem title="Tutorial (English)"
        onClick={e => { reqLoadResource({setCommand, filename: "examples/tutorial/Tutorial.0.24.0.en.mawe"})}}
        />
      <MenuItem title="Tutorial (Finnish)"
        onClick={e => { reqLoadResource({setCommand, filename: "examples/tutorial/Tutorial.0.24.0.fi.mawe"})}}
        />
    </Menu>
  }
}
