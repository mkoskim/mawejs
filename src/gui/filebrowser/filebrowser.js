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
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Avatar,
    AppBar, Drawer,
    Toolbar, IconButton, Typography, ButtonGroup,
    TextField, InputBase,
    CircularProgress, LinearProgress,
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
  const [search, setSearch] = useState(contains);

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

  return <View />;

  function View() {
    if(!dir) {
      return <div/>;
    } else if(!search) {
      return <ListDir directory={dir} hooks={hooks}/>
    } else {
      return <SearchDir directory={dir} contains={search} hooks={hooks}/>
    }
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

function FileItemConfig(file, hooks) {
  return {
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
      const entries = await fs.readdir(directory);
      const folders = sortFiles(entries.filter(f => f.type === "folder"));
      const files   = sortFiles(entries.filter(f => f.type !== "folder"));
      setState({
        folders: folders,
        files: files,
      })
    })();
  }, [directory]);

  useEffect(() => {
    document.addEventListener("keypress", startSearch);
    return () => document.removeEventListener("keypress", startSearch)
  });

  const files = ((state.folders !== undefined) ? state.folders.concat(state.files) : []);
  const pagelength = 80;
  const pages = Math.ceil(files.length / pagelength)
  console.log("Pages:", pages, "Files:", files.length)
  console.log("Page:", page);

  return (
    <FlexFull style={{flexDirection: "column"}}>
      <Box p={"4pt"} pb={"6pt"} style={{backgroundColor: "#F8F8F8"}}>
        <PathButtons />
        <PageButtons />
        </Box>
      <Box p={"4pt"} id="scrollbox" style={{overflowY: "auto"}}>
        <Grid files={files.slice((page-1)*pagelength, pagelength*page-1)} hooks={hooks} />
        </Box>
    </FlexFull>
  )

  function startSearch(event) {
    //console.log(event.key);
    if(event.key.length === 1) {
      hooks.setSearch(event.key);
      event.preventDefault();
    }
  }

  function PageButtons() {
    if(pages > 1) {
      return <Box pt={"2pt"}><Pagination count={pages} page={page} onChange={(e, v) => setPage(v)}/></Box>
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
          <RenderFileEntry file={file} disabled={false} hooks={hooks}/>
        </Card></Box>
      )
    }

    function RenderFileEntry({file, style, hooks}) {
      const config = FileItemConfig(file, hooks);
    
      return (        
        <ListItem button disabled={!file.access} style={style} onClick={config.onClick}>
        <ListItemAvatar>{config.icon}</ListItemAvatar>
        <ListItemText primary={file.name} secondary={file.relpath}/>
        </ListItem>
      );
    }    
  }
  
  function PathButtons()
  {
    return (
      <Box>
      <ButtonGroup>
      {path.map(f =>
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

class FileScanner {
  constructor(directory) {
    console.log("FileScanner:", directory);

    this.directory = directory;
    this.scan  = [directory];
    this.files = [];

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
    this.partial = 0;

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
        this.files.push(...batch)
      }
      //console.log("Files", this.files.length, "Scan:", this.scan.length);

      this.head = undefined;
      this.tryresolve();
    })
  }
}

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

function InfiniteFileList({scanner, contains, hooks}) {

  const [state, setState] = useState({
    files: [],
    hasMore: undefined,
  })

  useEffect(() => {
    if(scanner)
    {
      fetch(40);
      return () => scanner.stop();
    }
  }, [scanner, contains])

  const fetchMore = () => {
    console.log("fetchMore");
    fetch(state.files.length + 20);
  }

  function fetch(num) {
    scanner.fetch(setState, contains, num);
  }

  return [
    (scanner && scanner.more2come()) ? <LinearProgress/> : <div/>,
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
    </Box>
  ]

  function FileTable({files, hooks}) {
    return (
      <Table><TableBody>
      {files.map(f => <Row key={f.id} file={f} hooks={hooks}/>)}
      </TableBody></Table>
    )
  }

  function Row({file, hooks}) {
    const config = FileItemConfig(file, hooks);

    return (
      <TableRow onClick={config.onClick} hover={true}>
        <TableCell padding={"checkbox"}>{config.icon}</TableCell>
        <TableCell >{file.name}</TableCell>
        <TableCell >{file.relpath}</TableCell>
      </TableRow>
    )
  }
}
