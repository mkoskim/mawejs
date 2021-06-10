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

import React, {useState, useEffect} from 'react'

import isHotkey from "is-hotkey";

import {
  FlexBox, VBox,
} from "../components/helpers";

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
//import TypeUnknown from '@material-ui/icons/Close';
//import TypeUnknown from '@material-ui/icons/Help';
import TypeUnknown from '@material-ui/icons/BrokenImageOutlined';
//import TypeUnknown from '@material-ui/icons/BrokenImage';
//import TypeUnknown from '@material-ui/icons/CancelPresentationOutlined';

import { makeStyles } from '@material-ui/core/styles';

import SplitButton from "../components/splitbutton";

import SearchBar from "material-ui-search-bar";

//-----------------------------------------------------------------------------

const fs = require("../../storage/localfs")

export function FileBrowser({directory, location, contains, style}) {
  const [dir, setDir] = useState(undefined);
  const [search, setSearch] = useState(!!contains);

  //window.ipc.callMain("localfs", "read", "fileid");
  
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
      setDir(
        directory
        ? (await fs.fstat(directory)).id
        : await fs.getlocation(location ? location : "home")
      );
    })()
  }, [directory, location]);

  if(!dir) {
    return <div/>;
  } else if(search) {
    return <SearchDir directory={dir} contains={contains ? contains : ""} hooks={hooks} style={style}/>
  } else {
    return <ListDir directory={dir} hooks={hooks} style={style}/>
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

function addRelPaths(directory, files) {
  function relpath(f) {
    const p = fs.dirname(fs.relpath(directory, f.id));
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

//*****************************************************************************
//*****************************************************************************
//
// Directory listing
//
//*****************************************************************************
//*****************************************************************************

function ListDir({directory, hooks, style}) {

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
    <VBox style={style}>
      <Box p={"4pt"} pb={"6pt"} style={{backgroundColor: "#F8F8F8", borderBottom: "1px solid #D8D8D8"}}>
        <PathButtons />
        <PageButtons />
        </Box>
      <Box p={"4pt"} style={{overflowY: "auto"}}>
        <Grid files={files.slice((page-1)*pagelength, pagelength*page-1)} hooks={hooks} />
        </Box>
    </VBox>
  )

  //---------------------------------------------------------------------------

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

  //---------------------------------------------------------------------------
  
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
          <FileEntry file={file} hooks={hooks}/>
        </Card></Box>
      )
    }

    function FileEntry({file, hooks}) {
      const config = FileItemConfig(file, hooks);
      const callback = getCallbacks(file, hooks);

      return (
        <ListItem button disabled={config.disabled} onClick={callback.onClick} onDoubleClick={callback.onDoubleClick}>
        <ListItemAvatar>{config.icon}</ListItemAvatar>
        <ListItemText primary={file.name} secondary={file.relpath}/>
        </ListItem>
      );

      function getCallbacks(file, hooks) {
        return {
          "folder": {
            onClick: () => hooks.open(file),
            onDoubleClick: undefined,
          },
          "file": {
            onClick: undefined,
            onDoubleClick: () => hooks.open(file),
          },
        }[file.type] || {};
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

  useEffect(() => {
    setScanner(new DirScanner(directory, { excludeFolders: true, ...hooks}))
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
    <VBox style={{width: "100%", ...style}}>
      <SearchBar
        value={search}
        onChange={setSearch}
        onCancelSearch={() => hooks.setSearch(false)}
        cancelOnEscape
        autoFocus
      />
      <InfiniteFileList scanner={scanner} contains={search} hooks={hooks}/>
      </VBox>
  )
}

function InfiniteFileList({scanner, contains, hooks}) {

  const [matches, setMatches] = useState({
    files: [],
    hasMore: undefined,
  })

  function fetch(num) {
    console.log("Fetch:", contains, num)
    scanner.fetch(setMatches, contains, num);
  }

  useEffect(() => {
    if(scanner)
    {
      fetch(30);
      return () => scanner.stop();
    }
  }, [scanner, contains])

  const fetchMore = () => {
    fetch(matches.files.length + 20);
  }

  return [
    <StatusBar/>,
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
    </Box>,
  ]

  //---------------------------------------------------------------------------

  function StatusBar() {
    if(!scanner) return <div/>;
    return (
      <Box style={{padding: "4px", paddingTop: "8px", backgroundColor: "#F0F0F0"}}>
        <Typography style={{fontSize: 12}}>Files: {matches.files.length} (Scanned: {scanner.files.length})</Typography>
      </Box>
    )

    function Running() {
      return (scanner && scanner.more2come()) ? <LinearProgress size={40} thickness={4}/> : <div/>;
    }
  }

  //---------------------------------------------------------------------------
  
  function FileTable({files, hooks}) {
    return (
      <Table><TableBody>
      {files.map(f => <Row key={f.id} file={f} hooks={hooks}/>)}
      </TableBody></Table>
    )
  }

  // We keep the row simple, so that it will be rendered fast enough to retain
  // responsiveness.

  function Row({file, hooks}) {
    const config = FileItemConfig(file, hooks);
    const folder = fs.dirname(file.id);

    return <TableRow
      hover={true}
      disabled={config.disabled}
      onDoubleClick={() => hooks.open(file)}
      >
      <TableCell>{file.name}</TableCell>
      <TableCell>{file.relpath}</TableCell>
      </TableRow>;
  }
}

//*****************************************************************************
//*****************************************************************************
//
// Directory scanner
//
//*****************************************************************************
//*****************************************************************************

class DirScanner {
  constructor(directory, hooks) {
    console.log("Creating FileScanner:", directory);

    this.directory = directory;
    this.hooks = hooks;

    this.scan  = [directory];       // Directories for scanning
    this.processing = undefined;    // Directories under scanning
    this.files = [];                // Files retrieved

    this.contains = undefined;      // Pattern to match
    this.report = undefined;    // Function to report maches
    this.requested  = undefined;    // Amount of matches requested
    this.reported = undefined;
  }

  //---------------------------------------------------------------------------
  // By default:
  // - we match only on file name, not its path
  // - We search only for files, not for folders
  // - We exclude both hidden files and folders from search
  // - We exclude inaccessible files
  // - We exclude files with unknown types
 
  processBatch(batch)
  {
    if(!batch.length) return;

    const folders = batch
      .filter(f => !f.hidden)
      .filter(f => !f.symlink)
      .filter(f => f.access)
      .filter(f => f.type === "folder")
      .map(f => f.id)
    ;
    const files = addRelPaths(this.directory, excludeFiles(batch, this.hooks));

    this.scan.push(...folders)
    this.files.push(...files)
    //console.log("Files", this.files.length, "Scan:", this.scan.length);
  }

  matches(contains) {
    return this.files.filter(f => f.name.toLowerCase().includes(contains.toLowerCase()));
  }

  more2come() {
    return this.processing || this.scan.length;
  }

  //---------------------------------------------------------------------------

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

    if(matched.length >= this.requested || !this.more2come()) {
      this.resolve(matched, this.requested);
    } else {
      // Process 100 entries at time. We might need to adjust this based on the filesystem
      // speed. The larger the amount, the faster the scan, but at the same time, it reports
      // intermediate results slower.
      this.getmore(100);
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
        hasMore: this.more2come(),
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

  getmore(num) {
    // Do nothing if we are already processing directories
    if(this.processing) return ;

    // Get directories for scanning
    const head = this.scan.splice(0, num)

    if(!head) {
      this.tryresolve();
      return ;
    }

    // Read contents of the work set
    this.processing = head.map(f => fs.readdir(f));

    Promise.all(this.processing).then(results => {
      this.processing = undefined;
      this.processBatch(results.flat());
      this.tryresolve();
    })
  }
}
