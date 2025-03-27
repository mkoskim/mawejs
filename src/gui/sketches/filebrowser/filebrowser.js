//*****************************************************************************
//*****************************************************************************
//
// File browser
//
//*****************************************************************************
//*****************************************************************************

import "./filebrowser.css"

/* eslint-disable no-unused-vars */

import React from "react"
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { action } from "../../app/store"

import {
  Box, FlexBox, VBox, HBox, HFiller, VFiller,
  Filler, Separator,
  Button, IconButton, Icon, ButtonGroup,
  Input, SearchBox,
  Breadcrumbs, Chip,
  ToolBox,
  Label,
  addClass,
  addHotkeys,
  InfiniteScroll,
} from "../../common/factory";

import { FileEntry } from "./file"

//-----------------------------------------------------------------------------

const fs = require("../../storage/localfs")

//-----------------------------------------------------------------------------

export function PickFiles({ selected }) {
  return <FileBrowser selected={selected} />
}

//-----------------------------------------------------------------------------

function FileBrowser({ selected, ...props }) {
  const dir = useSelector((state) => state.cwd.path)
  const search = useSelector((state) => state.cwd.search)

  //const inform = Inform()

  console.log("FileBrowser:", dir, search);

  //---------------------------------------------------------------------------

  const options = {
    selected: selected.reduce((lookup, file) => ({ [file.id]: file, ...lookup }), {}),
    //inform,
  }

  if (search !== null) {
    return <SearchDir directory={dir} search={search} options={options} />
  } else {
    return <ListDir directory={dir} options={options} />
  }
}

//*****************************************************************************
//*****************************************************************************
//
// Directory listing
//
//*****************************************************************************
//*****************************************************************************

function ListDir({ directory, options }) {
  const dispatch = useDispatch()

  useEffect(() => addHotkeys([
    [IsKey.CtrlF, () => dispatch(action.CWD.search(""))],
  ]), []);

  const [state, setState] = useState({
    fetched: undefined,
    splitted: undefined,
    files: undefined,
    folders: undefined,
  })

  useEffect(() => {
    if (directory) getContent();

    async function getContent() {
      const [splitted, entries] = await Promise.all([
        fs.splitpath(directory),
        fs.readdir(directory)
      ])

      const folders = sortFiles(entries.filter(f => f.type === "folder"));
      const files = sortFiles(entries.filter(f => f.type !== "folder"));

      console.log("Fetched:", directory)

      setState({
        splitted,
        files,
        folders,
        fetched: directory
      })

      function sortFiles(files) {
        return files.sort((a, b) => a.name.localeCompare(b.name, { sensitivity: 'base' }))
      }
    }
  }, [directory])

  const { fetched } = state;
  const { splitted, files, folders } = (fetched === directory) ? state : {}

  return <VFiller>
    <ToolBar />
      <SplitList directory={directory} content={{ files, folders }} options={options} />
    </VFiller>

  function ToolBar() {
    return <ToolBox>
      <PathButtons path={splitted} options={options} />
      <Button variant="text"><Icon.Star/></Button>
      <Filler />
      <Button variant="text" startIcon={<Icon.Location.Favorites />}>Favorites</Button>
      <Button variant="text" startIcon={<Icon.Location.Home />} onClick={() => dispatch(action.CWD.location("home"))}>Home</Button>
    </ToolBox>
  }
}

//---------------------------------------------------------------------------

function PathButtons({ path, options }) {
  const dispatch = useDispatch();

  if (!path) return null;

  const last = path[path.length - 1];
  const head = path.slice(0, path.length - 1)

  return <React.Fragment>
    <Breadcrumbs
      maxItems={6}
      itemsBeforeCollapse={1}
      itemsAfterCollapse={5}
    >
      {head.map(file => (
        <Button
          style={{ textTransform: "unset" }}
          key={file.id}
          onClick={(e) => onOpen(e, file)}
          variant="text"
        >
          {file.name ? file.name : "Local:"}
        </Button>)
      )}
      <Button
        style={{ textTransform: "unset" }}
        key={last.id}
        variant="text"
        onClick={(e) => onMenu(e, last)}
      >
        {last.name ? last.name : "Local:"}
      </Button>
    </Breadcrumbs>
  </React.Fragment>

  function onOpen(e, f) {
    e.preventDefault()
    dispatch(action.CWD.chdir(f.id))
  }

  // TODO: Last button (current directory) should open "context" menu.
  function onMenu(e, f) {
    e.preventDefault()
    console.log("Open menu:", f.name);
  }
}

//---------------------------------------------------------------------------
// Full lists are not very efficient for large directories. Although most
// directories are small, if user goes to large directory, the app freezes
// for notably long time - that's bad...
//---------------------------------------------------------------------------

function SplitList({ directory, content, options }) {

  console.log("SplitList:", content);

  const { files, folders } = content;

  if (!files && !folders) return null;

  return (
    <VBox style={{ padding: 4, overflowY: "auto" }}>
      <Section name="Folders" items={folders} />
      <Section name="Files" items={files} />
    </VBox>
  )

  function Section({ name, items }) {
    const visible = items.filter(f => !f.hidden)
    if (!visible.length) {
      return null;
    }

    return (
      <React.Fragment>
        <Label style={{paddingLeft: 4, paddingTop: 16, paddingBottom: 8 }} text={name}/>
        {visible ? <Grid entries={visible} options={options} /> : null}
      </React.Fragment>
    )
  }

  function Grid({ entries, options }) {
    const style = {
      flexWrap: "wrap",
    };

    return <HBox style={style}>
      {entries.map(f => <Entry key={f.id} id={f.id} file={f} options={options} />)}
    </HBox>
  }

  function Entry({ file, options }) {
    return <FileEntry file={file} options={{ ...options, type: "card" }} />
  }
}

//*****************************************************************************
//*****************************************************************************
//
// File search view
//
//*****************************************************************************
//*****************************************************************************

function SearchDir({ directory, search, options, style }) {

  const dispatch = useDispatch()

  //console.log("render: SearchDir")

  function cancelSearch() {
    dispatch(action.CWD.search(null))
  }

  function setSearch(text) {
    dispatch(action.CWD.search(text))
  }

  useEffect(() => {
    return addHotkeys([
      [IsKey.Escape, cancelSearch],
    ])
  }, [])

  const [scanner, setScanner] = useState(undefined);

  useEffect(() => {
    const scanner = new DirScanner(directory, { excludeFolders: true })
    scanner.fetch(setMatches, search, 30);
    setScanner(scanner)
    return () => scanner.stop();
  }, [directory]); // eslint-disable-line react-hooks/exhaustive-deps

  const [matches, setMatches] = useState({
    files: [],
    hasMore: undefined,
  })

  useEffect(() => {
    console.log("Try fetch...", scanner)
    if (scanner) {
      fetch(30);
      //return () => scanner.stop();
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  function fetch(num) {
    console.log(`Fetch: <${search}>`, num)
    scanner.fetch(setMatches, search, num);
  }

  function fetchMore() {
    fetch(matches.files.length + 20);
  }

  return <VFiller>
    <ToolBox>
      <SearchBox
        value={search}
        onChange={e => setSearch(e.target.value)}
        onCancel={cancelSearch}
        autoFocus
      />
      <Status style={{ marginLeft: 16 }} />
    </ToolBox>
    <VFiller id="scrollbox" style={{ overflowY: "auto" }}>
      <InfiniteScroll
        scrollableTarget="scrollbox"
        scrollThreshold={0.95}
        dataLength={matches.files.length}
        next={fetchMore}
        hasMore={matches.hasMore}
      >
        <FileTable files={matches.files} options={options} />
      </InfiniteScroll>
    </VFiller>
  </VFiller>

  //---------------------------------------------------------------------------

  function Status({ style }) {
    if (!scanner) return null;
    return (
      <Label variant="body2" style={style}>Matches: {matches.files.length} (out of {scanner.files.length})</Label>
    )

    /*
    function Running() {
      return (scanner && scanner.more2come()) ? <LinearProgress size={40} thickness={4}/> : null;
    }
    */
  }

  //---------------------------------------------------------------------------

  function FileTable({ files, options }) {
    return (
      <table className="File"><tbody>
        {files.map(f => <FileEntry key={f.id} file={f} options={{ ...options, type: "row" }} />)}
      </tbody></table>
    )
  }
}

//*****************************************************************************
//*****************************************************************************
//
// Directory scanner
//
//*****************************************************************************
//*****************************************************************************

// TODO: We need this scanner for other purposes, too! So, take this to
// storage side and make it generic directory scanner.

const { Scanner } = require("../../storage/scanner")

class DirScanner extends Scanner {
  constructor(directory) {
    console.log("Creating FileScanner:", directory);
    super(directory);

    this.files = [];
    this.contains = undefined;      // Pattern to match
    this.report = undefined;    // Function to report maches
    this.requested = undefined;    // Amount of matches requested
    this.reported = undefined;

    // By default:
    // - we match only on file name, not its path
    // - We search only for files, not for folders
    // - We exclude both hidden files and folders from search
    // - We exclude inaccessible files
    // - We exclude files with unknown types

    this.filter.folder = f => (
      !f.hidden &&
      f.access
    );

    this.filter.file = f => (
      !f.hidden &&
      f.access &&
      ["file", "folder"].includes(f.type)
    )
  }

  //---------------------------------------------------------------------------
  // Inherited methods
  //---------------------------------------------------------------------------

  processbatch(batch) {
    this.files.push(...super.processbatch(batch));
    this.tryresolve();
  }

  //---------------------------------------------------------------------------

  matches(contains) {
    return this.files
      .filter(f => f.name.toLowerCase().includes(contains.toLowerCase()));
  }

  fetch(setMatches, contains, num) {
    //console.log("Fetch:", contains, num);
    this.report = setMatches;
    this.requested = num;
    this.contains = contains;
    this.reported = { matched: -1, files: this.files.length };
    this.timer = setInterval(this.progress.bind(this), 250);
    this.tryresolve();
  }

  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    this.report = undefined;
  }

  tryresolve() {
    if (!this.report) return;

    const matched = this.matches(this.contains);
    //console.log("Files:", this.files.length, "Scan", this.scan.length, "Contains", this.contains)

    if (matched.length >= this.requested || this.isfinished()) {
      this.resolve(matched, this.requested);
    } else {
      this.getmore();
    }
  }

  // Report progression
  progress() {
    if (!this.report) return;

    const matched = this.matches(this.contains);
    if (matched.length > this.reported.matched || this.files.length > this.reported.files) {
      const state = {
        files: matched.slice(0, this.requested),
        hasMore: !this.isfinished(),
      }
      this.report(state);
      this.reported = {
        matched: state.files.length,
        files: this.files.length,
      }
      //console.log("Partial:", state);
    }
  }

  // Resolve request
  resolve(files, num) {
    if (this.report) {
      const state = {
        files: files.slice(0, num),
        hasMore: files.length > num,
      }
      console.log("Resolve:", state);
      this.report(state);
    }
    this.stop();
  }
}
