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
import StarIcon from '@material-ui/icons/Star';

import { makeStyles } from '@material-ui/core/styles';

//-----------------------------------------------------------------------------

import LocalFS from "../storage/localfs"

//-----------------------------------------------------------------------------

export default class FileBrowser extends React.Component
{
    //-------------------------------------------------------------------------

    constructor(props)
    {
        super(props);

        this.state = {
            location: "home",
            pathid: null,
            //pathid: "/home/markus/Dropbox/tarinat",
            folders: [],
            files: [],
            hidden: false,
        }
        this.storage = new LocalFS();
    }

    //-------------------------------------------------------------------------

    render()
    {
        return (
        <Box>
        <this.appbar />
        <List>
            {this.renderCategory("Folders", this.state.folders)}
            {this.renderCategory("Files", this.state.files)}
            </List>
            </Box>
        );
    }

    renderCategory(category, files)
    {
        if(!this.state.hidden)
        {
            files = files.filter(file => !file.name.startsWith("."));
        }

        if(files.length)
        {
            return (
                <Box>
                    <ListItem><ListItemText primary={category}/></ListItem>
                    <Box display="flex" flexWrap="wrap">
                        {files.map(file => this.renderFile(file))}
                        </Box>
                    </Box>
            );
        }
        else
        {
            return;
        }
    }

    renderFile(file)
    {
        return (        
        <Box width={200} p="4px"><Card variant="outlined">
        <ListItem button>
            <ListItemAvatar>
                { file.type == "folder" ? <FolderIcon/> : <FileIcon/> }
                </ListItemAvatar>
            <ListItemText primary={file.name} />
            </ListItem>
        </Card></Box>
        );
    }

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

    //-------------------------------------------------------------------------

    readdir()
    {
        const fs = this.storage;
        if(this.state.pathid == null)
        {
            this.state.pathid = fs.getpathid(this.state.location);
        }
        const files = fs.readdir(this.state.pathid);

        //console.log(files);

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