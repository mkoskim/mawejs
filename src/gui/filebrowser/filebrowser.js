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
    AppBar, Toolbar, IconButton, Typography, ButtonGroup,
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
            hidden: false,
            location: "home",
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
        <Box display="flex">
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

    renderOptions()
    {
        return(
            <List>
                <ListItem>
                    <ListItemText primary="Hidden files" />
                    <ListItemSecondaryAction>
                    <Checkbox
                        edge="end"
                        checked={this.state["hidden"]}
                        onChange={() => this.setState({hidden: !this.state.hidden})}
                    />
                    </ListItemSecondaryAction>
                </ListItem>
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
            <Box>
                {this.renderPath()}
                {this.renderCategory("Folders", folders)}
                {this.renderCategory("Files", files)}
            </Box>
        );
    }

    renderCategory(category, files)
    {
        if(files.length)
        {
            return (
                <Box>
                    <ListItem><ListItemText primary={category}/></ListItem>
                    <Box display="flex" flexWrap="wrap">
                        {files.map(file => this.renderEntry(file))}
                        </Box>
                    </Box>
            );
        }
        else
        {
            return;
        }
    }

    renderEntry(file)
    {
        return (        
        <Box width={200} p="4px"><Card variant="outlined">
        <ListItem button onClick={this.onFileActivate.bind(this, file.pathid, file.type)}>
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