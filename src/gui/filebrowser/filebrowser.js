//*****************************************************************************
//*****************************************************************************
//
// File browser
//
//*****************************************************************************
//*****************************************************************************

/*
-------------------------------------------------------------------------------

The aim is to get a component which can be used for various file-related
purposes: opening a file, saving a file, searching files, and performing
basic file related operations like moving, removing and creating folders.

I'm looking for Nautilus file manager look'n'feel to certain extent.

It is intended that the backend for the browser is asynchronous and simple enough
to be used also with network drives (dropbox, gdrive). At the moment, there is
only local file system access provided via electron interface.

NOTES:

- Overall, React/browser rendering seems to be slow, extremely slow in certain
  circumstances. It can be a very difficult problem to solve.
- Keyboard integration: this will be huge problem overall anyways. Web
  interfaces are meant to be used with mouse or finger (phones, tablets), not
  that much on keyboard. On the other hand, it is expected that writers will
  have their hands on keyboard, not mouse.

TODO:

- Handle access right problems
- Handle errors

- Infinite scroll window do not initiate fetching more, if there is no
  scroll bar. So, if we initially return too little amount of search results,
  user can not fetch more.

// Let's examine this: https://stackoverflow.com/questions/4814398/how-can-i-check-if-a-scrollbar-is-visible

// Infinite scrollbar works, if it first gets that scrollbar. So, we might want
// to feed items to window as long as there is no scrollbar.


DONE:

- Infinite scroll box seems good to show search results.
- Paginated view seems good to show contents of large directories.

-------------------------------------------------------------------------------
*/

import "./filebrowser.css"

/* eslint-disable no-unused-vars */

import React from "react"
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { CWD } from "../app/store"

import {
  Box, FlexBox, VBox, HBox, HFiller, VFiller,
  Filler, Separator,
  Button, IconButton, Icon, ButtonGroup,
  Input, SearchBox,
  Breadcrumbs,
  ToolBox,
  Label,
  addClass,
  addHotkeys,
  InfiniteScroll,
} from "../common/factory";

import {FileEntry} from "./file"

//-----------------------------------------------------------------------------

const fs = require("../../storage/localfs")

//-----------------------------------------------------------------------------

export function PickFiles({selected, container}) {
  return <FileBrowser
    dndGroup={container}
    selected={selected}
  />
}

//-----------------------------------------------------------------------------

function FileBrowser({selected, ...props}) {
  const dir = useSelector((state) => state.cwd.path)
  const search = useSelector((state) => state.cwd.search)

  //const inform = Inform()

  console.log("FileBrowser:", dir, search);

  //---------------------------------------------------------------------------

  const options = {
    selected: selected.reduce((lookup, file) => ({[file.id]: file, ...lookup}), {}),
    //inform,
  }

  if (search !== null) {
    return <SearchDir directory={dir} search={search} options={options}/>
  } else {
    return <ListDir directory={dir} options={options}/>
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

  useEffect(() => addHotkeys({
    "mod+f": () => dispatch(CWD.search("")),
  }));

  const [state, setState] = useState({
    fetched: undefined,
    splitted: undefined,
    files: undefined,
    folders: undefined,
  })

  useEffect(() => {
    if(directory) getContent();

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

  return <VBox>
    <ToolBar />
    <SplitList directory={directory} content={{files, folders}} options={options}/>
    </VBox>

  function ToolBar() {
    return <ToolBox>
      <PathButtons path={splitted} options={options} style={{marginRight: "8pt"}}/>
      <IconButton size="small"><Icon.Star fontSize="small"/></IconButton>
      <Filler />
      <Separator/>
      <ButtonGroup>
      <Button startIcon={<Icon.Starred/>}>Favorites</Button>
      <Button startIcon={<Icon.Location.Home />} onClick={() => dispatch(CWD.location("home"))}>Home</Button>
      </ButtonGroup>
    </ToolBox>
  }

  /*
  function ToolBar() {
    return <ToolBox>
      <PathButtons path={splitted} options={options}/>
      <Button tooltip="Add to favorites" icon={Icons.Star} minimal={true} style={{marginLeft: 12}}/>
      <Filler />
      <ButtonGroup>
        <Button tooltip="Create new folder" icon={Icons.CreateFolder} />
        <Button tooltip="Search files" icon={Icons.Search}/>
      </ButtonGroup>
    </ToolBox>
  }
  */
}

//---------------------------------------------------------------------------

function PathButtons({path, options}) {
  const dispatch = useDispatch();

  if (!path) return null;

  /*
  const items = path.map(file => ({
    text: file.name !== "" ? file.name : "xxx@local:/",
    onClick: () => open(file),
  }))
  */

  return <Breadcrumbs>
    {path.map(file => <Label key={file.id}>{file.name}</Label>)}
    </Breadcrumbs>

  function open(f) { dispatch(CWD.chdir(f.id)) }

  // TODO: Last button (current directory) should open "context" menu.
  function menu(f) {
    console.log("Open menu:", f.name);
  }
}

//---------------------------------------------------------------------------
// Full lists are not very efficient for large directories. Although most
// directories are small, if user goes to large directory, the app freezes
// for notably long time - that's bad...
//---------------------------------------------------------------------------

function SplitList({directory, content, options}) {

  console.log("SplitList:", content);

  const { files, folders } = content;

  if (!files && !folders) return null;

  return (
    <Box style={{ padding: 4, overflowY: "auto" }}>
      <Section name="Folders" items={folders} />
      <Section name="Files" items={files} />
    </Box>
  )

  function Section({ name, items }) {
    const visible = items.filter(f => !f.hidden)
    if (!visible.length) {
      return null;
    }

    return (
      <React.Fragment>
        <Label style={{ paddingLeft: 4, paddingTop: 16, paddingBottom: 8 }}>{name}</Label>
        <Grid entries={visible} options={options}/>
      </React.Fragment>
    )
  }

  function Grid({entries, options}) {
    if (entries === undefined) return null;

    return <HBox style={{ overflowY: "auto", flexWrap: "wrap" }}>
      {entries.map(f => <FileEntry key={f.id} file={f} options={{...options, type: "card"}}/>)}
    </HBox>
  }
}

//*****************************************************************************
//*****************************************************************************
//
// File search view
//
//*****************************************************************************
//*****************************************************************************

function SearchDir({directory, search, options, style}) {

  const dispatch = useDispatch()

  //console.log("render: SearchDir")

  function cancelSearch() {
    dispatch(CWD.search(null))
  }

  function setSearch(text) {
    dispatch(CWD.search(text))
  }

  useEffect(() => {
    return addHotkeys({
      "escape": cancelSearch,
    })
  })

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
        <FileTable files={matches.files} options={options}/>
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

  function FileTable({files, options}) {
    return (
      <table className="File"><tbody>
        {files.map(f => <FileEntry key={f.id} file={f} options={{...options, type: "row"}}/>)}
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
