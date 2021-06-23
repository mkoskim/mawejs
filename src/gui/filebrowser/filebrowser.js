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

DONE:

- Infinite scroll box seems good to show search results.
- Paginated view seems good to show contents of large directories.

-------------------------------------------------------------------------------
*/

import "./filebrowser.css"

/* eslint-disable no-unused-vars */

import React, {useState, useEffect} from 'react'

import isHotkey from "is-hotkey";

import {
  Icon,
  Box, FlexBox, VBox, HBox, Filler, Separator,
  Button, ButtonGroup, Input, SearchBox,
  Breadcrumb,
  ToolBox, Inform,
  Label,
  addClass,
  addHotkeys,
  InfiniteScroll,
  Breadcrumbs,
  isEmpty, isNotEmpty,
} from "../component/factory";

import { makeStyles } from '@material-ui/core/styles';

import SplitButton from "../component/splitbutton";

//-----------------------------------------------------------------------------

const fs = require("../../storage/localfs")
const mawe = require("../../document")
const {suffix2format} = require('../../document/util');

//-----------------------------------------------------------------------------

export function FileBrowser({directory, location, contains, hooks}) {
  const [state, setState] = useState({dir: directory, search: isNotEmpty(contains)})

  const inform = Inform();

  console.log("render: FileBrowser:", state.dir, directory, location, contains);

  useEffect(() => {
    if(state.dir !== directory) resolvedir();

    async function resolvedir() {
      console.log("set dir:", directory, location);
      const d = directory
        ? (await fs.fstat(directory)).id
        : await fs.getlocation(location ? location : "home");
      console.log("dir", d);
      setState(state => ({...state, dir: d}));
    }  
  }, [directory, location]);

  const _hooks = {
    setSearch: search => setState(state => ({...state, search: search})),
    error: inform.error,
    chdir: dirid => setState({dir: dirid, search: false}),
    open: open,
    excludeHidden: true,
  }

  //---------------------------------------------------------------------------

  if(state.search) {
    return <SearchDir directory={state.dir} contains={contains ? contains : ""} hooks={_hooks}/>
  } else {
    return <ListDir directory={state.dir} hooks={_hooks}/>
  }

  //---------------------------------------------------------------------------

  async function open(f) {
    console.log("Open:", f.name);

    if(f.type === "folder") return _hooks.chdir(f.id);

    if(suffix2format(f)) {
      // TODO: Implement something to show that we are doing something
      //const key = inform.process(`Loading ${f.name}`);
      try {
        const doc = await mawe.load(f.id);
        hooks.openFile(doc);
        inform.success(`Loaded ${f.name}`)
      } catch(err) {
        inform.error(`Open '${f.name}': ${err}`);
      } finally {
        //inform.dismiss(key)
      }
      return;
    }
    fs.openexternal(f.id)
    .then(err => {
      if(!err) {
        inform.success(`Open '${f.name}': ok`)
      } else {
        inform.error(`Open '${f.name}': ${err}`);
      }
    })    
  }
}

//-----------------------------------------------------------------------------

function FileItemConfig(file, hooks) {
  switch(file.type) {
    case "folder": return {
      icon: (<Icon.FileType.Folder fontSize="small" style={{color: "#88c4f2"}}/>),
      disabled: !file.access,
    }
    case "file": return {
      icon: (<Icon.FileType.File fontSize="small" style={{color: "#51585b"}}/>),
      disabled: !file.access,
    }
    default: return {
      icon: (<Icon.FileType.Unknown fontSize="small"/>),
      disabled: true,
    }
  }
}

//*****************************************************************************
//*****************************************************************************
//
// Directory listing
//
//*****************************************************************************
//*****************************************************************************

function ListDir({directory, hooks}) {

  const [path, setPath] = useState()
  const [state, setState] = useState();
  
  async function getContent() {
    const splitted = await fs.splitpath(directory);
    setPath(splitted)

    const entries = await fs.readdir(directory);
    const folders = sortFiles(entries.filter(f => f.type === "folder"));
    const files   = sortFiles(entries.filter(f => f.type !== "folder"));

    setState({
      folders: folders,
      files: files,
    })

    function sortFiles(files) {
      return files.sort((a, b) => a.name.localeCompare(b.name, {sensitivity: 'base'}))
    }
  }

  useEffect(() => { getContent(); }, [directory]);

  useEffect(() => addHotkeys({
    "mod+f": () => hooks.setSearch(true),
  }));

  return (
    <React.Fragment>
      <ToolBox>
        <PathButtons path={path}/>
        <Filler/>
        <ButtonGroup>
          <Button tooltip="Add to favorites"><Icon.Star /></Button>
          <Button tooltip="Create new folder"><Icon.CreateFolder /></Button>
          <Button tooltip="Search files"><Icon.Search onClick={() => hooks.setSearch(true)}/></Button>
          </ButtonGroup>
        </ToolBox>
      <SplitList directory={directory} state={state}/>
    </React.Fragment>
  )

  //---------------------------------------------------------------------------

  function PathButtons({path, style})
  {
    // TODO: Last button (current directory) should open "context" menu.
    if(!path) return null;

    return (
      <React.Fragment>
        {path.map((f, i) => entry(i, f))}
      </React.Fragment>
    );

    function open(f) { hooks.open(f); }

    function menu(f) {
      console.log("Open menu:", f.name);
    }

    function entry(index, file) {
      const name = index ? (file.name + "/") : "xxx@local:/";
      const callback = (index < path.length - 1) ? (() => open(file)) : (() => menu(file));
      return (
        <Button
        key={index}
        onClick={callback}
        style={{paddingLeft: 4, paddingRight: 6}}
        >
          {name}
        </Button>
      )
    }
  }

  //---------------------------------------------------------------------------
  // Full lists are not very efficient for large directories. Although most
  // directories are small, if user goes to large directory, the app freezes
  // for notably long time - that's bad...
  //---------------------------------------------------------------------------

  function SplitList({directory, state}) {

    //console.log("render: SplitList");

    if(!state) return null;

    return (
        <Box style={{padding: 4, overflowY: "auto"}}>
          <Section name="Folders" items={state.folders}/>
          <Section name="Files" items={state.files}/>
        </Box>
    )

    function Section({name, items}) {
      const visible = items.filter(f => !f.hidden)
      if(!visible.length) {
        return null;
      } else {
        return (
          <React.Fragment>
            <Label style={{paddingLeft: 4, paddingTop: 16, paddingBottom: 8}}>{name}</Label>
            <Grid files={visible} hooks={hooks} />
            </React.Fragment>
        )
      }
    }
  }

  //---------------------------------------------------------------------------
  // File grid
  //---------------------------------------------------------------------------

  function Grid({files, hooks}) {
    if(files === undefined) return null;
    return (
      <HBox style={{overflowY: "auto", flexWrap: "wrap"}}>
      {files.map(f => <Cell key={f.id} file={f} hooks={hooks} />)}
      </HBox>
    )

    function Cell({file, hooks}) {
      const config = FileItemConfig(file, hooks);
      const callback = getCallbacks(file, hooks);
      const color = (config.disabled) ? "grey" : undefined;

      return (
        <HBox className="FileCard" onClick={callback.onClick} onDoubleClick={callback.onDoubleClick}>
          <span style={{marginRight: 8}}>{config.icon}</span>
          <span style={{color: color}}>{file.name}</span>
        </HBox>
      );

      /*
      return (
        <ListItem id="FileCard" button disabled={config.disabled} onClick={callback.onClick} onDoubleClick={callback.onDoubleClick}>
        <ListItemAvatar id="FileAvatar">{config.icon}</ListItemAvatar>
        <Typography>{file.name}</Typography>
        </ListItem>
      );
*/

      function getCallbacks(file, hooks) {
        switch(file.type) {
          case "folder": return {
            onClick: () => hooks.open(file),
            onDoubleClick: undefined,
          }
          case "file": return {
            onClick: undefined,
            onDoubleClick: () => hooks.open(file),
          }
          default: return {}
        }
      }      
    }    
  }  
}

//*****************************************************************************
//*****************************************************************************
//
// File search view
//
//*****************************************************************************
//*****************************************************************************

function SearchDir({directory, contains, hooks, style}) {
  const [scanner, setScanner] = useState(undefined);
  const [search, setSearch] = useState(undefined);

  //console.log("render: SearchDir")

  useEffect(() => {
    return addHotkeys({
      "escape": cancelSearch,
    })
  })

  useEffect(() => {
    setScanner(new DirScanner(directory, { excludeFolders: true, ...hooks}))
  }, [directory]);
  
  useEffect(() => {
    setSearch(contains)
  }, [scanner, contains])

  const [matches, setMatches] = useState({
    files: [],
    hasMore: undefined,
  })

  useEffect(() => {
    if(scanner)
    {
      fetch(30);
      return () => scanner.stop();
    }
  }, [search]);

  function cancelSearch() {
    hooks.setSearch(false)
  }

  function fetch(num) {
    console.log("Fetch:", search, num)
    scanner.fetch(setMatches, search, num);
  }

  function fetchMore() {
    fetch(matches.files.length + 20);
  }

  return (<React.Fragment>
    <ToolBox>
      <SearchBox
      value={search}
      onChange={e => setSearch(e.target.value)}
      onCancel={cancelSearch}
      autoFocus
      />
      <Status style={{marginLeft: 16}}/>
    </ToolBox>
    <Box id="scrollbox" style={{overflowY: "auto"}}>
    <InfiniteScroll
      scrollableTarget="scrollbox"
      scrollThreshold={0.95}
      dataLength={matches.files.length}
      next={fetchMore}
      hasMore={matches.hasMore}
    >
      <FileTable files={matches.files} hooks={hooks} />
    </InfiniteScroll>
    </Box>
  </React.Fragment>)

  //---------------------------------------------------------------------------

  function Status({style}) {
    if(!scanner) return null;
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
  
  function FileTable({files, hooks}) {
    return (
      <table className="File"><tbody>
      {files.map(f => <Row key={f.id} file={f} hooks={hooks}/>)}
      </tbody></table>
    )
  }

  // We keep the row simple, so that it will be rendered fast enough to retain
  // responsiveness.

  function Row({file, hooks}) {
    const config = FileItemConfig(file, hooks);
    const folder = fs.dirname(file.id);

    return <tr
      className={addClass("File", config.disabled ? "disabled" : undefined)}
      onDoubleClick={() => (config.disabled) ? undefined : hooks.open(file)}
      >
      <td className="FileIcon">{config.icon}</td>
      <td className="FileName">{file.name}</td>
      <td className="FileDir">{file.relpath}</td>
      </tr>;
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

const {Scanner} = require("../../storage/scanner")

class DirScanner extends Scanner {
  constructor(directory, hooks) {
    console.log("Creating FileScanner:", directory);
    super(directory);

    this.hooks = hooks;

    this.files = [];
    this.contains = undefined;      // Pattern to match
    this.report = undefined;    // Function to report maches
    this.requested  = undefined;    // Amount of matches requested
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

  stop()
  {
    clearInterval(this.timer);
    this.timer = undefined;
    this.report = undefined;
  }

  tryresolve() {
    if(!this.report) return;

    const matched = this.matches(this.contains);
    //console.log("Files:", this.files.length, "Scan", this.scan.length, "Contains", this.contains)

    if(matched.length >= this.requested || this.isfinished()) {
      this.resolve(matched, this.requested);
    } else {
      this.getmore();
    }
  }

  // Report progression
  progress()
  {
    if(!this.report) return;

    const matched = this.matches(this.contains);
    if(matched.length > this.reported.matched || this.files.length > this.reported.files) {
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
    if(this.report) {
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
