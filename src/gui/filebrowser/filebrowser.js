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

TODO:
- Handle access right problems
- Handle errors
- Keyboard not working on react-window list:
    https://github.com/bvaughn/react-window/issues/46
    https://sung.codes/blog/2019/05/07/scrolling-with-page-up-down-keys-in-react-window/

-------------------------------------------------------------------------------
*/

import React, {useState, useEffect} from 'react'

import {
    Dialog,
    Card, CardContent,
    Button, Checkbox, Icon,
    Switch,
    Breadcrumbs,
    Paper, Box,
    Divider,
    Chip, Link,
    Grid, GridList, GridListTile,
    List, ListItem, ListItemAvatar, ListItemText, ListItemIcon, ListItemSecondaryAction,
    Table, 
    Avatar,
    AppBar, Drawer,
    Toolbar, IconButton, Typography, ButtonGroup,
    TextField, InputBase,
    CircularProgress, LinearProgress,
} from "@material-ui/core";

import { DataGrid } from "@material-ui/data-grid";


//import { FixedSizeList, FixedSizeGrid } from "react-window";
//import { AutoSizer } from "react-virtualized";
//import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteScroll from "react-infinite-scroll-component";

import MenuIcon from '@material-ui/icons/Menu';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/Description';
import StarIcon from '@material-ui/icons/StarOutline';
import HomeIcon from  '@material-ui/icons/Home';
import SearchIcon from  '@material-ui/icons/Search';
import BlockIcon from '@material-ui/icons/Block';
import WarnIcon from '@material-ui/icons/Warning';

import TypeFolder from '@material-ui/icons/Folder';
import TypeFile from '@material-ui/icons/Description';
import TypeUnknown from '@material-ui/icons/Close';
//import TypeUnknown from '@material-ui/icons/Help';
//import TypeUnknown from '@material-ui/icons/BrokenImage';
//import TypeUnknown from '@material-ui/icons/CancelPresentationOutlined';

import { makeStyles } from '@material-ui/core/styles';

import SplitButton from "../components/splitbutton";

import SearchBar from "material-ui-search-bar";

//-----------------------------------------------------------------------------

const fs = require("../../storage/localfs")
const path = require("path")

export function FileBrowser({directory, location, contains}) {
  const [dir, setDir] = useState(undefined);
  const [search, setSearch] = useState(".txt");

  console.log("FileBrowser:", dir, directory, location, contains);

  const hooks = {
    setSearch: setSearch,
    chdir: (fid) => {
      console.log("chdir:", fid);
      setSearch(undefined);
      setDir(fid);
    },
  }

  useEffect(() => {
    (async() => {
      setDir(directory ? (await fs.fstat(directory)).id : await fs.getfileid(location ? location : "home"));
    })()
  }, [directory, location]);

  if(!dir) {
    return <div/>;
  } else if(search !== undefined) {
    return <SearchDir directory={dir} contains={search} hooks={hooks}/>
  } else {
    return <ListDir directory={dir} hooks={hooks}/>
  }
}

//-----------------------------------------------------------------------------

function sortFiles(files) {
  return files.sort((a, b) => a.name.localeCompare(b.name, {sensitivity: 'base'}))
}

function filterFiles(files, contains) {
  return files.filter(f => f.name.toLowerCase().includes(contains.toLowerCase()));
  /*
  const keywords = contains.toLowerCase().split(" ").filter(k => k.length)

  if(keywords.length) {
    return files.filter(f => keywords.some(k => f.name.toLowerCase().includes(k)));
  } else {
    return files;
  }
  */
}

function addRelPaths(directory, files) {
  function relpath(f) {
    const p = path.dirname(path.relative(directory, f.id));
    if(p === ".") return undefined;
    return p;
  }

  return files.map(f => ({...f, relpath: relpath(f)}));
}

//-----------------------------------------------------------------------------

function ListDir({directory, hooks}) {

  const [state, setState] = useState({
    path: [],
    files: undefined,
  });

  useEffect(() => {
    setState({path: undefined, files: undefined});
    (async() => {
        const path    = await fs.splitpath(directory);
        const entries = await fs.readdir(directory);
        const folders = sortFiles(entries.filter(f => f.type === "folder"))
        const files   = sortFiles(entries.filter(f => f.type !== "folder"))
        setState({path: path, files: folders.concat(files)});
    })();
  }, [directory]);

  if(state.files !== undefined) {
    return (
      <FlexFull style={{flexDirection: "column"}}>
        <PathButtons />
        <List />
      </FlexFull>
    )
  } else {
    return <div/>
  }

  function List()
  {
    //return <RenderFileList files={state.files} hooks={hooks}/>;
    return <RenderFileGrid files={state.files} hooks={hooks}/>;
  }

  function PathButtons()
  {
    return (
      <Box>
      <ButtonGroup>
      {state.path.map(f =>
        <Button
          key={f.id}
          style={{textTransform: "none"}}
          onClick={() => (hooks.chdir(f.id))}
        >
        {f.name ? f.name : "/"}
        </Button>
      )}
      </ButtonGroup>
      </Box>
    );
  }
}

//-----------------------------------------------------------------------------

function SearchDir({directory, contains, hooks}) {
  const [scanner, setScanner] = useState(undefined);

  useEffect(() => { setScanner(new FileScanner(directory, 100))}, [directory]);

  return (
    <FlexFull style={{flexDirection: "column"}}>
      <SearchBar
        value={contains}
        onChange={hooks.setSearch}
        onCancelSearch={() => hooks.setSearch(undefined)}
        cancelOnEscape
        autoFocus
      />
      <InfiniteFileList scanner={scanner} contains={contains} hooks={hooks}/>
      </FlexFull>
  )
}

class FileScanner {
  constructor(directory, num) {
    console.log("FileScanner:", directory);

    this.directory = directory;
    this.scan  = [directory];
    this.files = [];

    this.setState = undefined;
    this.contains = undefined;
    this.amount  = undefined;
    this.partial = undefined;
  }

  matches(contains) {
    return filterFiles(this.files, contains);
  }

  progress()
  {
    const matched = this.matches(this.contains);
    if(matched.length > this.partial) {
      const state = {
        files: matched.slice(0, this.amount),
        hasMore: true,
      }
      console.log("Partial:", state);
      this.partial = state.files.length;
      this.setState(state);
    }
  }

  reject()
  {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.setState = undefined;
    this.running = false;
  }

  resolve(files, num) {
    const send = this.setState;
    this.reject();

    const state = {
      files: files.slice(0, num),
      hasMore: files.length > num,
    }
    console.log("Resolve:", state);
    if(send) send(state);
  }

  tryresolve() {
    const matched = this.matches(this.contains);

    if(!this.scan.length || matched.length > this.amount) {
      this.resolve(matched, this.amount);
    } else {
      this.walk(100);
    }
  }

  fetch(setState, contains, num) {
    //console.log("Fetch:", contains, num);
    this.setState = setState;
    this.amount = num;
    this.contains = contains;
    this.partial = 0;
    this.running = true;

    this.tryresolve();
  }

  walk(num) {

    if(!this.timer) {
      this.timer = setTimeout(() => {
        this.progress();
        this.timer = undefined;
      }, 250);
    }

    const head = this.scan.splice(0, num);

    const processing = head.map(f => fs.readdir(f));

    Promise.all(processing).then(results => {
      //const batch = results.flat();
      const batch = addRelPaths(this.directory, results.flat());

      if(batch.length) {

        const folders = batch
          .filter(f => !f.hidden)
          .filter(f => !f.symlink)
          .filter(f => f.access)
          .filter(f => f.type === "folder")
          .map(f => f.id)
        ;

        this.scan.push(...folders)
        this.files.push(...batch)
      }
      //console.log("Files", this.files.length, "Scan:", this.scan.length);

      this.tryresolve();
    })
  }
}

//-----------------------------------------------------------------------------

function RenderFileGrid({files, hooks}) {
  return (
    <Box display="flex" style={{overflowY: "auto"}} flexWrap="wrap">
    {files.map(f => <Cell key={f.id} file={f} hooks={hooks} />)}
    </Box>
  )

  function Cell({file, hooks}) {
    return (
      <Box width={300} m={"2px"}><Card variant="outlined">
        <RenderFileEntry file={file} disabled={false} hooks={hooks}/>
      </Card></Box>
    )
  }
}

//-----------------------------------------------------------------------------
// These helpers make AutoSizer working: Autosizer needs parent container
// with dimensions. See:
// https://github.com/bvaughn/react-window/issues/249#issuecomment-747412706
//-----------------------------------------------------------------------------

function FlexFull({style, children}) {
  return (
    <div style={{height: "100vh", width: "100vw", display: "flex", ...style}}>
      {children}
    </div>
  )
}

//-----------------------------------------------------------------------------

function InfiniteFileList({scanner, contains, hooks}) {

  const [state, setState] = useState({
    files: [],
    hasMore: undefined,
  })

  useEffect(() => {
    if(scanner)
    {
      fetch(20);
      return () => scanner.reject();
    }
  }, [scanner, contains])

  const fetchMore = () => { fetch(state.files.length + 20); }

  function fetch(num) {
    scanner.fetch(setState, contains, num);
  }

  console.log("FileList", state.hasMore)

  return [
    (scanner && scanner.running) ? <LinearProgress/> : <div/>,
    <Box id="scrollbox" style={{overflowY: "auto"}}>
    <InfiniteScroll
    scrollableTarget="scrollbox"
    scrollThreshold={0.95}
    dataLength={state.files.length}
    next={fetchMore}
    hasMore={state.hasMore}
    //loader={<LinearProgress />}
    //endMessage={<p>Yay! You have seen it all</p>}
    >
    {state.files
      .map(f => <RenderFileEntry key={f.id} file={f} hooks={hooks}/>)
    }
  </InfiniteScroll>
  </Box>
  ]
}

//-----------------------------------------------------------------------------

function RenderFileEntry({file, style, hooks}) {
  const config = {
    "folder": {
      icon: (<TypeFolder />),
      onClick: () => hooks.chdir(file.id),
    },
    "file": {
      icon: (<TypeFile />),
    },
  }[file.type] || {
    icon: (<TypeUnknown />)
  };

  return (        
    <ListItem button disabled={!file.access} style={style} onClick={config.onClick}>
    <ListItemAvatar>{config.icon}</ListItemAvatar>
    <ListItemText primary={file.name} secondary={file.relpath}/>
    </ListItem>
  );
}
