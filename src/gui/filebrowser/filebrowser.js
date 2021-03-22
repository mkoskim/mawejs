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

import React from 'react'

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

import LocalFS from "../../storage/localfs"

//-----------------------------------------------------------------------------

export default class FileBrowser extends React.Component
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
            
            includeHidden: false,
            disableFiles: false,
            excludeSymlinks: false,
            excludeInaccessible: false,
            excludeUnknown: false,
        }
        this.storage = new LocalFS();
    }

    //-------------------------------------------------------------------------

    componentDidMount()
    {
        this.readdir(this.storage.getfileid("home"));
    }
    
    componentWillUnmount()
    {
    }

    //-------------------------------------------------------------------------

    onFileActivate(fileid, type)
    {
        if(type === "folder")
        {
            console.log("Folder:", fileid);
            this.readdir(fileid);
        }
        else
        {
            console.log("File:", fileid);
            //this.readdir(fileid);
        }
    }

    onPlaceActivate(place)
    {
        if(place.fileid)
        {
            this.readdir(place.fileid);
        }
        else
        {
            this.readdir(this.storage.getfileid(place.location));
        }
    }

    //-------------------------------------------------------------------------

    render()
    {
        return (
        <Box display="flex" flexDirection="row">
            <Box>
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

    renderOptions()
    {
        return(
            <List>
                <Option name="Include hidden" checked={this.state.includeHidden} onChange={() => this.setState({includeHidden: !this.state.includeHidden})}/>
                <Option name="Disable files" checked={this.state.disableFiles} onChange={() => this.setState({disableFiles: !this.state.disableFiles})}/>
                <Option name="Exclude symlinks" checked={this.state.excludeSymlinks} onChange={() => this.setState({excludeSymlinks: !this.state.excludeSymlinks})}/>
                <Option name="Exclude inaccessible" checked={this.state.excludeInaccessible} onChange={() => this.setState({excludeInaccessible: !this.state.excludeInaccessible})}/>
                <Option name="Exclude unknown" checked={this.state.excludeUnknown} onChange={() => this.setState({excludeUnknown: !this.state.excludeUnknown})}/>
            </List>
        );

        function Option(props)
        {
            return (
                <ListItem>
                    <ListItemText primary={props.name} />
                    <ListItemSecondaryAction>
                    <Checkbox
                        edge="end"
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
            (this.state.includeHidden || !file.name.startsWith(".")) &&
            (!this.state.excludeSymlinks || !file.symlink) &&
            (!this.state.excludeInaccessible || file.access) &&
            (!this.state.excludeUnknown || file.type)
        );

        const folders = entries.filter(file => file.type === "folder");
        const files = entries.filter(file => file.type !== "folder");

        return (
            <Box display="flex" flexDirection="column" style={{maxHeight: "100vh"}}>
                {this.renderPath()}
                <Box flexGrow={1} style={{overflowY: "auto"}}>
                {this.renderCategory("Folders", folders)}
                {this.renderCategory("Files",   files, this.state.disableFiles)}
                </Box>
            </Box>
        );
        }

    renderCategory(name, files, disabled=false)
    {
        if(!files.length) return ;

        const content = (
            <Box display="flex" flexWrap="wrap">
            {files.map(file => this.renderEntry(file, disabled))}
            </Box>
        );

        const header = (name) ? <ListItemText primary={name}/> : "";

        return (
            <Box>
                {header}
                {content}
                </Box>
        );
    }

    renderEntry(file, disabled)
    {
        const icon = {
            "folder":  (<TypeFolder />),
            "file":    (<TypeFile />),
        }[file.type] || (<TypeUnknown />);

        return (        
        <Box width={200} p="4px"><Card variant="outlined">
        <ListItem button disabled={!file.access || disabled} onClick={this.onFileActivate.bind(this, file.fileid, file.type)}>
            <ListItemAvatar>{icon}</ListItemAvatar>
            <ListItemText primary={file.name}/>
            </ListItem>
        </Card></Box>
        );
    }
    
    //-------------------------------------------------------------------------

    renderPath()
    {
        return <Box display="flex" alignItems="center">
            <Box display="flex" flexWrap="wrap">
            {this.state.splitpath.map(file => this.renderPathItem(file, false))}
            <Button size="small"><StarIcon /></Button>
            </Box>
        </Box>;
    }

    renderSearchBar()
    {
        return (
        <SearchBar
            value={this.state.search}
            cancelOnEscape
            onChange={(newValue) => this.setState({ search: newValue })}
        />);
    }

    renderPathItem(file, head)
    {
        return (
            <Button
                style={{textTransform: "none"}}
                onClick={this.onFileActivate.bind(this, file.fileid, file.type)}
                >
                {file.name === "" ? "Local" : file.name}
                </Button>
        );
    }

    //-------------------------------------------------------------------------

    readdir(fileid)
    {
        const fs = this.storage;
        const files = fs.readdir(fileid);

        if(!files)
        {
            // Add error message here
            return ;
        }

        this.setState({
            fileid: fileid,
            splitpath: fs.pathsplit(fileid),
            files: files,
        });
    }
}