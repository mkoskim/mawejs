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
            splitpath: [],
            files: [],
            location: "home",
            hidden: false,
            filesDisabled: false,
        }
        this.storage = new LocalFS();
    }

    //-------------------------------------------------------------------------

    componentDidMount()
    {
        this.readdir();
    }
    
    componentWillUnmount()
    {
    }

    //-------------------------------------------------------------------------

    onFileActivate(pathid, type)
    {
        if(type === "folder")
        {
            console.log("Folder:", pathid);
            this.readdir(pathid);
        }
        else
        {
            console.log("File:", pathid);
            //this.readdir(pathid);
        }
    }

    //-------------------------------------------------------------------------

    render()
    {
        return (
        <Box display="flex" flexDirection="row">
            {this.renderOptions()}
            {this.renderTiles()}
        </Box>
        );
    }

    //-------------------------------------------------------------------------

    renderPlaces()
    {
        return (
            <List>
                <ListItem button><ListItemText primary="Home" /></ListItem>
                <ListItem button><ListItemText primary="Dropbox" /></ListItem>
                <ListItem button><ListItemText primary="Documents" /></ListItem>
            </List>
        );
    }

    //-------------------------------------------------------------------------

    renderOption(text, key, onchange)
    {
        return (
            <ListItem>
            <ListItemText primary={text} />
            <ListItemSecondaryAction>
            <Checkbox
                edge="end"
                checked={this.state[key]}
                onChange={onchange}
            />
            </ListItemSecondaryAction>
            </ListItem>
        );
    }

    renderOptions()
    {
        return(
            <List>
            {this.renderOption("Hidden files", "hidden", () => this.setState({hidden: !this.state.hidden}))}
            {this.renderOption("Files disabled", "filesDisabled", () => this.setState({filesDisabled: !this.state.filesDisabled}))}
            </List>
        );
    }

    //-------------------------------------------------------------------------

    renderTiles()
    {
        var entries = this.state.files;

        if(!this.state.hidden)
        {
            entries = entries.filter(file => !file.name.startsWith("."));
        }

        var folders = entries.filter(file => file.type === "folder");
        var files = entries.filter(file => file.type !== "folder");

        return (
            <Box display="flex" flexDirection="column" style={{maxHeight: "100vh"}}>
                {this.renderPath()}
                <Box flexGrow={1} style={{overflowY: "auto"}}>
                {this.renderCategory("Folders", folders, false)}
                {this.renderCategory("Files", files, this.state.filesDisabled)}
                </Box>
            </Box>
        );
    }

    renderCategory(category, files, disabled)
    {
        if(files.length)
        {
            const content = (
                <Box display="flex" flexWrap="wrap">
                {files.map(file => this.renderEntry(file, disabled))}
                </Box>
            );

            const header = (category) ? <ListItemText primary={category}/> : "";

            return (
                <Box>
                    {header}
                    {content}
                    </Box>
            );
        }
        else
        {
            return;
        }
    }

    renderEntry(file, disabled)
    {
        return (        
        <Box width={200} p="4px"><Card variant="outlined">
        <ListItem button disabled={disabled} onClick={this.onFileActivate.bind(this, file.pathid, file.type)}>
            <ListItemAvatar>
                { file.type === "folder" ? <FolderIcon/> : <FileIcon/> }
                </ListItemAvatar>
            <ListItemText primary={file.name} />
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
                onClick={this.onFileActivate.bind(this, file.pathid, file.type)}
                >
                {file.name === "" ? "Local" : file.name}
                </Button>
        );
    }

    //-------------------------------------------------------------------------

    readdir(pathid)
    {
        const fs = this.storage;
        if(pathid == null)
        {
            pathid = fs.getpathid(this.state.location);
        }
        const files = fs.readdir(pathid);

        this.setState({
            pathid: pathid,
            splitpath: fs.pathsplit(pathid),
            files: files,
        });
    }
}