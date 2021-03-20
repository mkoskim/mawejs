//*****************************************************************************
//*****************************************************************************
//
// File browser
//
//*****************************************************************************
//*****************************************************************************

import React from 'react'

import {
    Card, CardContent,
    Button, Checkbox, Icon,
    Paper, Box,
    Divider,
    Grid, GridList, GridListTile,
    List, ListItem, ListItemAvatar, ListItemText, ListItemIcon, Avatar,
    AppBar, Toolbar, IconButton, Typography,
} from "@material-ui/core";

import MenuIcon from '@material-ui/icons/Menu';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/Description';

import { makeStyles } from '@material-ui/core/styles';

//-----------------------------------------------------------------------------

import LocalFS from "../storage/localfs"
import { ThreeSixty } from '@material-ui/icons';

//-----------------------------------------------------------------------------

export default class FileBrowser extends React.Component
{
    //-------------------------------------------------------------------------

    constructor(props)
    {
        super(props);

        this.state = {
            folders: [],
            files: [],
        }
        this.storage = new LocalFS();
    }

    //-------------------------------------------------------------------------

    appbar()
    {
        // Trying app bar
        return (
        <AppBar position="static">
            <Toolbar variant="dense">
                <IconButton edge="start" color="inherit" aria-label="menu">
                <MenuIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
        );
    }

    renderfile(file)
    {
        return (        
        <Box width={200} p="4px"><Card variant="outlined">
        <ListItem button>
            <ListItemAvatar>
                { file.type == "folder" ? <FolderIcon /> : <FileIcon/> }
                </ListItemAvatar>
            <ListItemText primary={file.name} />
            </ListItem>
        </Card></Box>
        );
    }

    renderfolder(files)
    {
        return <Box display="flex" flexWrap="wrap">
                {files.map(file => this.renderfile(file))}
                </Box>;
    }

    render()
    {
        return (
        <Box>
        <this.appbar />
        <List>
            <ListItem><ListItemText primary="Folders"/></ListItem>
            {this.renderfolder(this.state.folders)}
            <ListItem><ListItemText primary="Files"/></ListItem>
            {this.renderfolder(this.state.files)}
            </List>
            </Box>
        );
    }

    //-------------------------------------------------------------------------

    readdir()
    {
        var files = this.storage.readdir();
        //files.forEach(file => console.log(file.isDirectory()));
        this.setState({
            folders: files.filter(file => file.type == "folder"),
            files: files.filter(file => file.type != "folder"),
        });
    }

    //-------------------------------------------------------------------------

    componentDidMount()
    {
        this.readdir();
    }
    
    componentWillUnmount()
    {
    }
}