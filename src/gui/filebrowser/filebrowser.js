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

import isHotkey from "is-hotkey";

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
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Avatar,
    AppBar, Drawer,
    Toolbar, IconButton, Typography, ButtonGroup,
    TextField, InputBase,
    CircularProgress, LinearProgress,
    Tooltip,
} from "@material-ui/core";

import { DataGrid } from "@material-ui/data-grid";
import {Pagination} from "@material-ui/lab";

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
import OpenFolderIcon from '@material-ui/icons/FolderOpenOutlined';

import TypeFolder from '@material-ui/icons/Folder';
import TypeFile from '@material-ui/icons/DescriptionOutlined';
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
  const [search, setSearch] = useState(!!contains);

  console.log("FileBrowser:", dir, directory, location, contains);

  const hooks = {
    setSearch: setSearch,
    chdir: fid => {
      setSearch(undefined);
      setDir(fid);
    },
    open: f => {
      if(f.type == "folder") {
        hooks.chdir(f.id);
      } else {
        console.log("Open:", f.name);
      }
    },

    excludeHidden: true,
  }

  useEffect(() => {
    (async() => {
      setDir(directory ? (await fs.fstat(directory)).id : await fs.getfileid(location ? location : "home"));
    })()
  }, [directory, location]);

  return <View />;

  function View() {
    if(!dir) {
      return <div/>;
    } else if(!search) {
      return <ListDir directory={dir} hooks={hooks}/>
    } else {
      return <SearchDir directory={dir} contains={contains === undefined ? "" : contains} hooks={hooks}/>
    }
  }
}

//-----------------------------------------------------------------------------

function sortFiles(files) {
  return files.sort((a, b) => a.name.localeCompare(b.name, {sensitivity: 'base'}))
}

function excludeFiles(files, hooks) {
  return files.filter(f =>
    (!f.hidden || !hooks.excludeHidden) &&
    (f.type !== "folder" || !hooks.excludeFolders)
  );
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
    return (p === ".") ? undefined : p;
  }

  return files.map(f => ({...f, relpath: relpath(f)}));
}

function FileItemConfig(file, hooks) {
  return {
    "folder": {
      icon: (<TypeFolder />),
      disabled: !file.access,
    },
    "file": {
      icon: (<TypeFile />),
      disabled: !file.access,
    },
  }[file.type] || {
    icon: (<TypeUnknown />),
    disabled: true,
  };
}

function FlexFull({style, children}) {
  return (
    <div style={{height: "100vh", width: "100vw", display: "flex", ...style}}>
      {children}
    </div>
  )
}

//-----------------------------------------------------------------------------

function ListDir({directory, hooks}) {

  const [state, setState] = useState({
    folders: undefined,
    files: undefined,
  })

  const [path, setPath] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setState({folders: undefined, files: undefined});
    setPage(1);
    (async() => {
      setPath(await fs.splitpath(directory));
      const entries = excludeFiles(await fs.readdir(directory), hooks);
      const folders = sortFiles(entries.filter(f => f.type === "folder"));
      const files   = sortFiles(entries.filter(f => f.type !== "folder"));
      setState({
        folders: folders,
        files: files,
      })
    })();
  }, [directory]);

  useEffect(() => {
    document.addEventListener("keydown", startSearch);
    return () => document.removeEventListener("keydown", startSearch)

    function startSearch(event) {
      //console.log(event.key);
      if(isHotkey("ctrl+f", event)) {
        hooks.setSearch(true);
        event.preventDefault();
      }
    }  
  });

  const files = ((state.folders !== undefined) ? state.folders.concat(state.files) : []);
  const pagelength = 80;
  const pages = Math.ceil(files.length / pagelength)
  //console.log("Pages:", pages, "Files:", files.length)
  //console.log("Page:", page);

  return (
    <FlexFull style={{flexDirection: "column"}}>
      <Box p={"4pt"} pb={"6pt"} style={{backgroundColor: "#F8F8F8", borderBottom: "1px solid #D8D8D8"}}>
        <PathButtons />
        <PageButtons />
        </Box>
      <Box p={"4pt"} id="scrollbox" style={{overflowY: "auto"}}>
        <Grid files={files.slice((page-1)*pagelength, pagelength*page-1)} hooks={hooks} />
        </Box>
    </FlexFull>
  )

  function PageButtons() {
    if(pages > 1) {
      return (
        <Box mt={"4pt"} pt={"4pt"} style={{borderTop: "1px solid #d8D8D8"}}>
          <Pagination count={pages} page={page} onChange={(e, v) => setPage(v)}/>
          </Box>
      )
    } else {
      return <div/>
    }
  }

  function Grid({files, hooks}) {
    if(files === undefined) return <div/>;
    return (
      <Box display="flex" style={{overflowY: "auto"}} flexWrap="wrap">
      {files.map(f => <Cell key={f.id} file={f} hooks={hooks} />)}
      </Box>
    )
  
    function Cell({file, hooks}) {
      return (
        <Box width={300} m={"2px"}><Card variant="outlined">
          <RenderFileEntry file={file} hooks={hooks}/>
        </Card></Box>
      )
    }

    function RenderFileEntry({file, style, hooks}) {
      const config = FileItemConfig(file, hooks);
      const callback = Callbacks(file, hooks);

      return (        
        <ListItem button disabled={config.disabled} style={style} onClick={callback.onClick} onDoubleClick={callback.onDoubleClick}>
        <ListItemAvatar>{config.icon}</ListItemAvatar>
        <ListItemText primary={file.name} secondary={file.relpath}/>
        </ListItem>
      );

      function Callbacks(file, hooks) {
        return {
          "folder": {
            onClick: () => hooks.open(file),
            onDoubleClick: undefined,
          },
          "file": {
            onClick: undefined,
            onDoubleClick: () => hooks.open(file),
          },
        }[file.type] || {
        };
      }      
    }    
  }
  
  function PathButtons()
  {
    return (
      <ButtonGroup>
      {path.map(f =>
        <Button
          key={f.id}
          onClick={() => (hooks.open(f))}
          style={{textTransform: "none"}}
        >
        {f.name ? f.name : "/"}
        </Button>
      )}
      </ButtonGroup>
    );
  }
}

//-----------------------------------------------------------------------------

class FileScanner {
  constructor(directory, hooks) {
    console.log("Creating FileScanner:", directory);

    this.directory = directory;
    this.scan  = [directory];
    this.files = [];
    this.hooks = hooks;

    this.setState = undefined;
    this.contains = undefined;
    this.amount  = undefined;
    this.partial = undefined;
    this.head = undefined;
  }

  matches(contains) {
    return filterFiles(this.files, contains);
  }

  more2come() {
    return this.head || this.scan.length;
  }

  stop()
  {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.setState = undefined;
  }

  resolve(files, num) {
    const send = this.setState;
    this.stop();

    if(send) {
      const state = {
        files: files.slice(0, num),
        hasMore: files.length > num,
      }
      console.log("Resolve:", state);
      send(state);  
    }
  }

  progress()
  {
    if(!this.setState) return ;

    const matched = this.matches(this.contains);
    if(matched.length > this.partial) {
      const state = {
        files: matched.slice(0, this.amount),
        hasMore: this.more2come(),
      }
      console.log("Partial:", state);
      this.partial = state.files.length;
      this.setState(state);
    }
  }

  tryresolve() {
    if(!this.setState) return;

    const matched = this.matches(this.contains);
    //console.log("Files:", this.files.length, "Scan", this.scan.length, "Contains", this.contains)

    if(matched.length >= this.amount || !this.more2come()) {
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
    this.partial = -1;

    this.tryresolve();
  }

  walk(num) {
    if(this.head) return ;

    this.head = this.scan.splice(0, num)
    if(!this.head.length) this.tryresolve();

    if(!this.timer) {
      this.timer = setTimeout(() => {
        this.progress();
        this.timer = undefined;
      }, 250);
    }

    const processing = this.head.map(f => fs.readdir(f));

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
        this.files.push(...excludeFiles(batch, this.hooks))
      }
      //console.log("Files", this.files.length, "Scan:", this.scan.length);

      this.head = undefined;
      this.tryresolve();
    })
  }
}

function SearchDir({directory, contains, hooks}) {
  const [scanner, setScanner] = useState(undefined);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setScanner(new FileScanner(directory, { excludeFolders: true, ...hooks}))
  }, [directory]);
  useEffect(() => { setSearch(contains)}, [contains])
  
  useEffect(() => {
    document.addEventListener("keydown", stopSearch);
    return () => document.removeEventListener("keydown", stopSearch)

    function stopSearch(event) {
      //console.log(event.key);
      if(isHotkey("escape", event)) {
        hooks.setSearch(false);
        event.preventDefault();
      }
    }  
  });

  return (
    <FlexFull style={{flexDirection: "column"}}>
      <SearchBar
        value={search}
        onChange={setSearch}
        onCancelSearch={() => hooks.setSearch(false)}
        autoFocus
      />
      <InfiniteFileList scanner={scanner} contains={search} hooks={hooks}/>
      </FlexFull>
  )
}

function InfiniteFileList({scanner, contains, hooks}) {

  const [state, setState] = useState({
    files: [],
    hasMore: undefined,
  })

  useEffect(() => {
    if(scanner)
    {
      fetch(30);
      return () => scanner.stop();
    }
  }, [scanner, contains])

  const fetchMore = () => {
    fetch(state.files.length + 20);
  }

  function fetch(num) {
    console.log("Fetch:", contains, num)
    scanner.fetch(setState, contains, num);
  }

  return [
    <StatusBar/>,
    <Box id="scrollbox" style={{overflowY: "auto"}}>
    <InfiniteScroll
    scrollableTarget="scrollbox"
    scrollThreshold={0.95}
    dataLength={state.files.length}
    next={fetchMore}
    hasMore={state.hasMore}
    >
      <FileTable files={state.files} hooks={hooks} />
    </InfiniteScroll>
    </Box>,
  ]

  function StatusBar() {
    if(!scanner) return <div/>;
    return (
      <Box align="right" style={{padding: "4px", paddingTop: "8px", backgroundColor: "#F0F0F0"}}>
        <Typography style={{fontSize: 14}}>Match: {state.files.length} Total: {scanner.files.length}</Typography>
      </Box>
    )

    function Running() {
      return (scanner && scanner.more2come()) ? <LinearProgress size={40} thickness={4}/> : <div/>;
    }
  }

  function FileTable({files, hooks}) {
    return (
      <Table><TableBody>
      {files.map(f => <Row key={f.id} file={f} hooks={hooks}/>)}
      </TableBody></Table>
    )
  }

  function Row({file, hooks}) {
    const config = FileItemConfig(file, hooks);
    const folder = path.dirname(file.id);

    /*
    return (
      <Box m={"2px"}><Card variant="outlined">
        <ListItem button disabled={config.disabled} onDoubleClick={() => hooks.open(file)}>
        <ListItemAvatar>{config.icon}</ListItemAvatar>
        <ListItemText primary={file.name} secondary={file.relpath}/>
        </ListItem>
      </Card></Box>
    )
    /*/
    return <TableRow
      hover={true}
      disabled={config.disabled}
      onDoubleClick={() => hooks.open(file)}
      >
      <TableCell>{file.name}</TableCell>
      <TableCell>{file.relpath}</TableCell>
      </TableRow>;
    /**/
  }

      /*
      //<TableCell style={{padding: 0, paddingLeft: 16}}>{config.icon}</TableCell>
      //<TableCell><Link onClick={() => hooks.chdir(folder)}>{file.relpath}</Link></TableCell>
  function Row({file, hooks}) {

    const cellstyle = {padding: "4px"};

    return (
      <TableRow
        hover={true}
        disabled={config.disabled}
        onDoubleClick={() => hooks.open(file)}
        >
        <TableCell style={{paddingLeft: "8pt", ...cellstyle}}>{config.icon}</TableCell>
        <TableCell style={cellstyle}>
          {file.name}
          </TableCell>
        <TableCell style={cellstyle}>{file.relpath}</TableCell>
        <TableCell style={cellstyle}>
          <Tooltip title="Go to folder"><IconButton
            style={{padding: "8px"}}
            onClick={() => hooks.chdir(folder)}
            >
            <OpenFolderIcon width={32}/>
            </IconButton></Tooltip>
          </TableCell>
      </TableRow>
    )
  }
*/
}
