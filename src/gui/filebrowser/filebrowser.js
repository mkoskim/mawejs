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
    Avatar,
    AppBar, Drawer,
    Toolbar, IconButton, Typography, ButtonGroup,
    TextField, InputBase, CircularProgress,
} from "@material-ui/core";

import { FixedSizeList } from "react-window";
//import { AutoSizer } from "react-virtualized";
import AutoSizer from "react-virtualized-auto-sizer";
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

  console.log("FileBrowser:", dir, directory, location);

  useEffect(() => {
    (async() => {
      setDir(directory ? directory : await fs.getfileid(location));
    })()
  }, [directory, location]);

  if(!dir) {
    return <p>...</p>;
  } else if(search !== undefined) {
    return <SearchDir directory={dir} contains={search} onChange={setSearch}/>
  } else {
    return <ListDir directory={dir} />
  }
}

//-----------------------------------------------------------------------------

function sortFiles(files) {
  return files.sort((a, b) => a.name.localeCompare(b.name, {sensitivity: 'base'}))
}

function filterFiles(files, contains) {
  const keywords = contains.split(" ").filter(k => k.length)
  if(keywords.length) {
    return files.filter(f => keywords.some(k => f.name.includes(k)));
  } else {
    return files;
  }
}

function addRelPaths(directory, files) {
  return files.map(f => ({...f, relpath: path.relative(directory, f.fileid)}));
}

//-----------------------------------------------------------------------------

function ListDir({directory}) {
  console.log("Rendering: FileList");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    (async() => {
        const files = (await fs.readdir(directory))
        setFiles(sortFiles(files));
    })();
  }, [directory]);

  return (
    <FlexFull style={{flexDirection: "column"}}>
      <RenderFileList files={files} />
    </FlexFull>
  )
}

//-----------------------------------------------------------------------------

function SearchDir({directory, contains, onChange}) {
  console.log("Rendering: SearchFiles");

  const [dir, setDir] = useState({
    scan: [directory],  // Directories ready for scanning
    files: [],          // Files found
  });

  useEffect(() => {
    let running = true;

    // Throttle scanning a bit to keep app responsive
    const index = 100;
    const [head, tail] = [dir.scan.slice(0, index), dir.scan.slice(index)]

    const processing = head.map(f => fs.readdir(f));

    Promise.all(processing).then(results => {
      if(!running) return ;

      const files = results.flat();

      if(tail.length || files.length) {
        const folders = files
          .filter(f => !f.symlink)
          .filter(f => f.access)
          .filter(f => f.type === "folder")
          .map(f => f.fileid)
        ;

        setDir({
          scan: tail.concat(folders),
          files: dir.files.concat(files),
        })
      }
    })
    return () => running = false;
  }, [directory, dir]);

  const scanning = dir.scan.length != 0;

  return (
    <FlexFull style={{flexDirection: "column"}}>
      <SearchBar
        value={contains}
        onChange={onChange}
        onCancelSearch={() => onChange(undefined)}
        cancelOnEscape
        autoFocus
      />
      <p>Total: {dir.files.length} {scanning ? (`Dirs: ${dir.scan.length}`) : ""}</p>
      <RenderFileList files={addRelPaths(directory, filterFiles(dir.files, contains))} />
      </FlexFull>
  )
}

//-----------------------------------------------------------------------------

function RenderFileList({files}) {
  return <VirtualFileList files={files}/>
  //return <FetchLaterFileList files={files}/>
  //return <InfiniteFileList files={files}/>
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

function FlexFill({style, children}) {
  return (
    <div style={{display: "flex", flexGrow: 1, ...style}}>
      {children}
    </div>
  )
}

function AutosizedList({itemSize, itemCount, Row}) {
  return (
  <FlexFill><AutoSizer>
  {({height, width}) => {
    //console.log("Area:", width, height);
    return (
      <FixedSizeList
        height={height}
        width={width}
        itemSize={itemSize}
        itemCount={itemCount}
      >
        {Row}
      </FixedSizeList>
    )
  }}
  </AutoSizer></FlexFill>
  )
}

function VirtualFileList({files}) {
  return <AutosizedList itemSize={48} itemCount={files.length} Row={
    ({index, style}) => {
      const f = files[index];
      return <RenderFileEntry key={f.fileid} file={f} disabled={false} style={style}/>;
    }
  } />
}

//-----------------------------------------------------------------------------

function FetchLaterFileList({files}) {
  // Can we do here so, that we add files bit-by-bit to the list? Would solve many
  // problems...

  const [state, setState] = useState({
    waiting: [],  // Files waiting for rendering
    files: [],    // Rendered files
  });

  useEffect(() => (setState({waiting: files, files: []})), [files])

  useEffect(() => {
    console.log("Waiting:", state.waiting)

    const timer = setTimeout(() => {
      console.log("Adding...")
      const index = 10;
      const [head, tail] = [state.waiting.slice(0, index), state.waiting.slice(index)]

      if(head.length) setState({
        waiting: tail,
        files: state.files.concat(head),
      })
    }, 10);

    return () => clearTimeout(timer);
  }, [state]);

  console.log("RenderFileList", state.waiting.length)
  return state.files.map(f => <RenderFileEntry key={f.fileid} file={f} disabled={false}/>)
}

//-----------------------------------------------------------------------------

function InfiniteFileList({files}) {
  const [state, setState] = useState({
    rendered: 0,
    hasMore: false,
  })

  useEffect(() => (setState({
    rendered: Math.min(files.length, 20),
    hasMore: files.length > 20
  })), [files])

  const fetchMoreData = () => {
    console.log("fetchMore:", state.rendered, "/", files.length)
    const items = Math.min(files.length, state.rendered + 10);
    setState({rendered: items, hasMore: items < files.length});
  }

  return (
    <div>
    <InfiniteScroll
    dataLength={state.rendered}
    next={fetchMoreData}
    hasMore={state.hasMore}
    loader={<p>Loading...</p>}
    endMessage={<p>Yay! You have seen it all</p>}
    >
    {files
      .slice(0, state.rendered)
      .map(f => <RenderFileEntry key={f.fileid} file={f} disabled={false}/>)
    }
  </InfiniteScroll>
  </div>
  )
}

//-----------------------------------------------------------------------------

function RenderFileEntry({file, disabled, style}) {
  const icon = {
    "folder":  (<TypeFolder />),
    "file":    (<TypeFile />),
  }[file.type] || (<TypeUnknown />);

  return (        
    // <Box width={200} m="4px">
    // <Card variant="outlined">
    <ListItem button disabled={!file.access || disabled} dense divider style={style}>
        <ListItemAvatar>{icon}</ListItemAvatar>
        <ListItemText primary={file.name} secondary={file.relpath}/>
        </ListItem>
    // </Card>
    //</Box>
  );
}

//-----------------------------------------------------------------------------

export class XFileBrowser extends React.Component
{
    //-------------------------------------------------------------------------

    constructor(props)
    {
        super(props);

        this.state = {
            places: [
                { name: "Home", location: "home" },
                { name: "Documents", location: "documents" },
            ],
            splitpath: [],
            files: [],
            
            searchfor: "",

            filesDisabled: false,
            excludeHidden: true,
            excludeSymlinks: false,
            excludeInaccessible: false,
            excludeUnknown: false,
            onlyFolders: false,
        }
        this.storage = fs;
    }

    //-------------------------------------------------------------------------

    componentDidMount()
    {
        this.storage.getfileid("home").then(fileid => this.readdir(fileid));
    }
    
    componentWillUnmount()
    {
    }

    //-------------------------------------------------------------------------

    onFileActivate(fileid, type)
    {
        if(type === "folder")
        {
            //console.log("Folder:", fileid);
            this.readdir(fileid);
        }
        else
        {
            //console.log("File:", fileid);
            //this.readdir(fileid);
        }
    }

    async onPlaceActivate(place)
    {
        if(!place.fileid)
        {
            place.fileid = await this.storage.getfileid(place.location);
        }

        this.readdir(place.fileid);
    }

    //-------------------------------------------------------------------------

    render()
    {
        return (
        <Box display="flex" flexDirection="row">
            <Box pl={1} pr={1}>
                {this.renderPlaces()}
                <Divider/>
                {this.renderOptions()}
                </Box>
            {this.renderTiles()}
        </Box>
        );
    }

    //-------------------------------------------------------------------------

    renderPlaces()
    {
        return (
            <List>
                {this.state.places.map(place =>
                    <Place
                        name={place.name}
                        onClick={() => this.onPlaceActivate(place)}
                    />
                )}
            </List>
        );

        function Place(props)
        {
            return (
                <ListItem button>
                <ListItemText primary={props.name} onClick={props.onClick}/>
                </ListItem>
            );
        }
    }

    //-------------------------------------------------------------------------

    onOptionChange(event)
    {
        this.setState({...this.state, [event.target.name]: event.target.checked});
    }

    renderOptions()
    {
        return(
            <List>
                <TextField type="search" variant="outlined" label="Find" margin="none"
                    value={this.state.searchfor || ""}
                    onChange={(event) => { this.setState({searchfor: event.target.value}); }}
                />
                <Option label="Exclude hidden" name="excludeHidden" checked={this.state.excludeHidden} onChange={event => this.onOptionChange(event)}/>
                <Option label="Exclude symlinks" name="excludeSymlinks" checked={this.state.excludeSymlinks} onChange={event => this.onOptionChange(event)}/>
                <Option label="Exclude inaccessible" name="excludeInaccessible" checked={this.state.excludeInaccessible} onChange={event => this.onOptionChange(event)}/>
                <Option label="Exclude unknown" name="excludeUnknown" checked={this.state.excludeUnknown} onChange={event => this.onOptionChange(event)}/>
                <Divider/>
                <Option label="Only folders" name="onlyFolders" checked={this.state.onlyFolders} onChange={event => this.onOptionChange(event)}/>
                <Option label="Files disabled" name="filesDisabled" checked={this.state.filesDisabled} onChange={event => this.onOptionChange(event)}/>
            </List>
        );

        function Option(props)
        {
            return (
                <ListItem>
                    <ListItemText primary={props.label} />
                    <ListItemSecondaryAction>
                    <Checkbox
                        edge="end"
                        name={props.name}
                        checked={props.checked}
                        onChange={props.onChange}
                    />
                    </ListItemSecondaryAction>
                </ListItem>
            );
        }
    }

    //-------------------------------------------------------------------------

    renderTiles()
    {
        var entries = this.state.files.filter(file =>
            (!this.state.onlyFolders || file.type === "folder") &&
            (!this.state.excludeHidden || !file.hidden) &&
            (!this.state.excludeSymlinks || !file.symlink) &&
            (!this.state.excludeInaccessible || file.access) &&
            (!this.state.excludeUnknown || file.type) &&
            (!this.state.searchfor || file.name.toLowerCase().includes(this.state.searchfor.toLowerCase()))
        );

        const folders = entries.filter(file => file.type === "folder");
        const files = entries.filter(file => file.type !== "folder");

        return (
            <Box display="flex" flexDirection="column" style={{maxHeight: "100vh"}}>
                {this.renderPath()}
                <Box flexGrow={1} style={{overflowY: "auto"}}>
                    {this.renderCategory("Folders", folders)}
                    {this.renderCategory("Files",   files, this.state.filesDisabled)}
                </Box>
            </Box>
        );
        }

    renderCategory(name, files, disabled=false)
    {
        if(!files.length) return ;

        const header = (name) ? <ListItemText primary={name}/> : null;

        const content = (
            <Box display="flex" flexWrap="wrap">
            {files
                .sort((a, b) => a.name.localeCompare(b.name, {sensitivity: 'base'}))
                .map(file => this.renderEntry(file, disabled))}
            </Box>
        );

        return <Box>{header}{content}</Box>;
    }

    renderEntry(file, disabled=false)
    {
        const icon = {
            "folder":  (<TypeFolder />),
            "file":    (<TypeFile />),
        }[file.type] || (<TypeUnknown />);

        return (        
        <Box width={200} m="4px"><Card variant="outlined">
        <ListItem key={file.fileid} button disabled={!file.access || disabled} onClick={this.onFileActivate.bind(this, file.fileid, file.type)}>
            <ListItemAvatar>{icon}</ListItemAvatar>
            <ListItemText primary={file.name}/>
            </ListItem>
        </Card></Box>
        );
    }
    
    //-------------------------------------------------------------------------

    renderPath()
    {
        return (
            <Box>
            <ButtonGroup>
            {this.state.splitpath.map(file =>
                <Button
                    style={{textTransform: "none"}}
                    onClick={() => this.onFileActivate(file.fileid, file.type)}
                >
                {file.name ? file.name : "/"}
                </Button>
            )}
            </ButtonGroup>
            </Box>
        );
    }

    renderSearchBar()
    {
        return (
        <SearchBar
            value={this.state.searchfor}
            cancelOnEscape
            onChange={(newValue) => this.setState({ search: newValue })}
        />);
    }

    //-------------------------------------------------------------------------

    async readdir(fileid)
    {
        const fs = this.storage;
        const files = await fs.readdir(fileid);

        if(!files)
        {
            // Add error message here
            return ;
        }

        const splitted = await fs.splitpath(fileid);

        this.setState({
            search: undefined,
            fileid: fileid,
            files: files,
            splitpath: splitted,
        });    
    }
}