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
  FlexBox, VBox, HBox,
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
import IconAdd from '@material-ui/icons/AddCircleOutline';

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

import { useSnackbar } from 'notistack';

//-----------------------------------------------------------------------------

const fs = require("../../storage/localfs")

export function FileBrowser({directory, location, contains, style}) {
  const [state, setState] = useState({dir: undefined, search: !!contains})

  const {enqueueSnackbar, closeSnackbar} = useSnackbar();

  console.log("FileBrowser:", state.dir, directory, location, contains);

  async function showError(err) {
    console.log(err);
    enqueueSnackbar(String(err), {variant: "error"});
  }

  async function chDir(dirid) {
    setState({dir: dirid, search: false});
  }

  async function open(f) {
    if(f.type == "folder") {
      return chDir(f.id);
    }

    console.log("Open:", f.name);
    try {
      const content = await fs.read(f.id);
      console.log("File:", f.id, "Content:", content.slice(0, 200), "...");
      const parent = await fs.parent(f.id)
      chDir(parent.id);
    } catch(err) {
      showError(err);
    }
  }

  const hooks = {
    setSearch: (search) => setState({...state, search: search}),
    error: showError,
    chdir: chDir,
    open: open,
    excludeHidden: true,
  }

  useEffect(() => {
    async function resolvedir() {
      console.log("set dir:", directory, location);
      const d = directory
        ? (await fs.fstat(directory)).id
        : await fs.getlocation(location ? location : "home");
      console.log("dir", d);
      setState({...state, dir: d});
    }
  
    resolvedir();
  }, [directory, location]);

  if(!state.dir) {
    return null;
  } else if(state.search) {
    return <SearchDir directory={state.dir} contains={contains ? contains : ""} hooks={hooks} style={style}/>
  } else {
    return <ListDir directory={state.dir} hooks={hooks} style={style}/>
  }
}

//-----------------------------------------------------------------------------

function FileItemConfig(file, hooks) {
  switch(file.type) {
    case "folder": return {
      icon: (<TypeFolder fontSize="small"/>),
      disabled: !file.access,
    }
    case "file": return {
      icon: (<TypeFile fontSize="small"/>),
      disabled: !file.access,
    }
    default: return {
      icon: (<TypeUnknown fontSize="small"/>),
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

function ListDir({directory, hooks, style}) {

  const [state, setState] = useState(undefined);
  
  console.log("render: ListDir", directory, state);

  function sortFiles(files) {
    return files.sort((a, b) => a.name.localeCompare(b.name, {sensitivity: 'base'}))
  }

  useEffect(async () => {
    const path = await fs.splitpath(directory);
    setState({path: path});

    const entries = (await fs.readdir(directory)).filter(f => !f.hidden);
    const folders = sortFiles(entries.filter(f => f.type === "folder"));
    const files   = sortFiles(entries.filter(f => f.type !== "folder"));
    setState((state) => ({
      ...state,
      directory: directory,
      folders: folders,
      files: files,
    }))
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

  return (
    <VBox style={{width: "100%", ...style}}>
      <Box p={"4pt"} pb={"6pt"} style={{backgroundColor: "#F8F8F8", borderBottom: "1px solid #D8D8D8"}}>
        <PathButtons state={state}/>
        </Box>
      <PagedList directory={directory} state={state}/>
    </VBox>
  )

  //---------------------------------------------------------------------------

  function PathButtons({state})
  {
    if(!state || !state.path) return null;
    return (
      <ButtonGroup>
      {state.path.map(f =>
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

  //---------------------------------------------------------------------------
  // Paged list renders extremely quickly.
  //---------------------------------------------------------------------------

  function PagedList({directory, state}) {
    const [page, setPage] = useState(1);

    useEffect(() => setPage(1), [state]);

    if(!state || state.directory !== directory) return null;

    const files = state.folders.concat(state.files);
    const pagelength = 100;
    const pages = Math.ceil(files.length / pagelength)
    //console.log("Pages:", pages, "Files:", files.length)
    //console.log("Page:", page);

    return (
      <React.Fragment>
        <PageButtons page={page} pages={pages} setPage={setPage}/>
        <Box p={"4pt"} style={{overflowY: "auto"}}>
          <Grid files={files.slice((page-1)*pagelength, pagelength*page-1)} hooks={hooks} />
        </Box>
      </React.Fragment>
    )  

    function PageButtons({page, pages, setPage}) {
      if(pages > 1) {
        return (
          <Box pt={"4pt"}>
            <Pagination count={pages} page={page} onChange={(e, v) => setPage(v)}/>
            </Box>
        )
      } else {
        return null
      }
    }
  }

  //---------------------------------------------------------------------------
  // Full lists are not very efficient for large directories. Although most
  // directories are small, if user goes to large directory, the app freezes
  // for notably long time - that's bad...
  //---------------------------------------------------------------------------

  function SimpleList({directory, state}) {
    if(!state || state.directory !== directory) return null;
    return (
      <Box p={"4pt"} style={{overflowY: "auto"}}>
        <Grid files={state.folders.concat(state.files)} hooks={hooks} />
      </Box>
    )
  }

  function SplitList({directory, state}) {
    if(!state || state.directory !== directory) return null;
    //if(!state || !state.directory) return null;

    console.log("render: FullList");

    return (
        <Box p={"4pt"} style={{overflowY: "auto"}}>
          <Folders />
          <Files />
        </Box>
    )

    function Folders() {
      if(!state.folders.length) {
        return null;
      } else {
        return (
          <React.Fragment>
            <Typography style={{paddingLeft: 2, paddingTop: 16, paddingBottom: 8}}>Folders</Typography>
            <Grid files={state.folders} hooks={hooks} />
            </React.Fragment>
        )
      }
    }

    function Files() {
      if(!state.files.length) {
        return null;
      } else {
        return (
          <React.Fragment>
            <Typography style={{paddingLeft: 2, paddingTop: 16, paddingBottom: 8}}>Files</Typography>
            <Grid files={state.files} hooks={hooks} />
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
      <Box display="flex" style={{overflowY: "auto"}} flexWrap="wrap">
      {files.map(f => <Cell key={f.id} file={f} hooks={hooks} />)}
      </Box>
    )

    function FrameBox({children}) {
      return (
        <Box width={300} m={"2px"}><Card variant="outlined">
          {children}
          </Card></Box>
      )
    }

    function Cell({file, hooks}) {
      const config = FileItemConfig(file, hooks);
      const callback = getCallbacks(file, hooks);

      return (
        <FrameBox>
          <ListItem button disabled={config.disabled} onClick={callback.onClick} onDoubleClick={callback.onDoubleClick}>
          <ListItemAvatar>{config.icon}</ListItemAvatar>
          <ListItemText primary={file.name}/>
          </ListItem>
          </FrameBox>
      );

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

  return (<React.Fragment>
    <StatusBar/>
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
    </Box></React.Fragment>
  );

  //---------------------------------------------------------------------------

  function StatusBar() {
    if(!scanner) return null;
    return (
      <Box style={{padding: "4px", paddingTop: "8px", backgroundColor: "#F0F0F0"}}>
        <Typography style={{fontSize: 12}}>Files: {matches.files.length} (Scanned: {scanner.files.length})</Typography>
      </Box>
    )

    function Running() {
      return (scanner && scanner.more2come()) ? <LinearProgress size={40} thickness={4}/> : null;
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
    const cellstyle = {
      paddingTop: "6px",
      paddingBottom: "6px",
      paddingLeft: "8px",
      paddingRight: "2px",
      color: config.disabled ? "gray" : undefined,
    };

    return <TableRow
      hover={true}
      onDoubleClick={() => (config.disabled) ? undefined : hooks.open(file)}
      >
      <TableCell style={cellstyle} width="5%">{config.icon}</TableCell>
      <TableCell style={cellstyle} width="35%">{file.name}</TableCell>
      <TableCell style={cellstyle} width="60%">{file.relpath}</TableCell>
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

  matches(contains) {
    return this.files
      .filter(f => f.name.toLowerCase().includes(contains.toLowerCase()));
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

  // By default:
  // - we match only on file name, not its path
  // - We search only for files, not for folders
  // - We exclude both hidden files and folders from search
  // - We exclude inaccessible files
  // - We exclude files with unknown types
 
  processBatch(batch)
  {
    const files = batch
      .filter(f => !f.hidden)
      .filter(f => f.access)
      .filter(f => ["file", "folder"].includes(f.type))
    ;

    const folders = files
      .filter(f => !f.symlink)
      .filter(f => f.type === "folder")
      .map(f => f.id)
    ;

    this.scan.push(...folders)
    this.files.push(...files)
    //console.log("Files", this.files.length, "Scan:", this.scan.length);
  }

  getmore(num) {
    // Do nothing if we are already processing directories
    if(this.processing) return ;

    // Get directories for scanning
    const head = this.scan.splice(0, num)

    if(!head) return this.tryresolve();

    // Read contents of the work set
    this.processing = head.map(async d => {
      const rp = fs.relpath(this.directory, d);
      const relpath = rp !== "." ? rp : "";

      const files = await fs.readdir(d).catch(e => [])
      return files.map(f => ({...f, relpath: relpath}));
    });

    Promise.all(this.processing).then(results => {
      this.processing = undefined;
      this.processBatch(results.flat());
      this.tryresolve();
    })
  }
}
