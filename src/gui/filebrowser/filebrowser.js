//*****************************************************************************
//*****************************************************************************
//
// File browser
//
//*****************************************************************************
//*****************************************************************************

/* TODO:
- Handle access right problems
*/

import React, {useState, useEffect} from 'react'

import {
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
    TextField, InputBase,
} from "@material-ui/core";

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

export function FileBrowser({directory, location}) {
  console.log("Directory:", directory);
  console.log("Location:", location);
  return <FileList
    location={location}
    directory={directory}
  />
}

function FileList({location, dirid}) {
  const [directory, setDirectory] = useState(undefined);
  const [files, setFiles] = useState([]);

  // In case we get symbolic location (e.g. "home"), resolve directory
  function getdirectory() {
    if(dirid === undefined) {
      fs
        .getfileid(location)
        .then(id => setDirectory(id))
    } else {
      setDirectory(dirid);
    }
  }
  useEffect(getdirectory, [location, dirid]);

  // When directory changes, get list of files
  function getfiles() {
    console.log("Reading directory:", directory);
    if(directory) {
      fs
        .readdir(directory)
        .then(files => {
          console.log("Got files:", files);
          setFiles(files);
        });
      }
  }  
  useEffect(getfiles, [directory]);

  return <RenderFileList
    directory={directory}
    files={files}
  />
}

//-----------------------------------------------------------------------------

function RenderFileList({directory, files}) {
  return (
    <Box display="flex" flexDirection="column" style={{maxHeight: "100vh"}} flexGrow={1}>
        <p>Directory: {directory}</p>
      <Box flexGrow={1} style={{overflowY: "auto"}}>
        {files.map(file => <RenderFileEntry key={file.fileid} file={file} disabled={false}/>)}
      </Box>
      </Box>
  )
}

function RenderFileEntry({file, disabled}) {
  const icon = {
    "folder":  (<TypeFolder />),
    "file":    (<TypeFile />),
  }[file.type] || (<TypeUnknown />);

  return (        
    <Box width={200} m="4px">
    <Card variant="outlined">
    <ListItem button disabled={!file.access || disabled}>
      <ListItemAvatar>{icon}</ListItemAvatar>
      <ListItemText primary={file.name}/>
      </ListItem>
    </Card></Box>
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