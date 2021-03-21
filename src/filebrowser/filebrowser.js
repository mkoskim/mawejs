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
    Chip,
    Grid, GridList, GridListTile,
    List, ListItem, ListItemAvatar, ListItemText, ListItemIcon, Avatar,
    AppBar, Toolbar, IconButton, Typography, ButtonGroup,
} from "@material-ui/core";

import MenuIcon from '@material-ui/icons/Menu';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/Description';
import StarIcon from '@material-ui/icons/Star';
import HomeIcon from  '@material-ui/icons/Home';

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
            splitpath: [],
            folders: [],
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

    onFileClicked(pathid, type)
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
        <Box>
        <this.appbar />
        <List>
            {this.renderPath()}
            <Divider/>
            {this.renderCategory("Folders", this.state.folders)}
            {this.renderCategory("Files", this.state.files)}
            </List>
            </Box>
        );
    }

    renderPath()
    {
        return <Box>
            <ButtonGroup>
            {this.state.splitpath.map(file => this.renderPathItem(file, false))}
            </ButtonGroup>
            <IconButton><StarIcon /></IconButton>
        </Box>;
    }

    renderPathItem(file, head)
    {
        return (
            <Button
                style={{textTransform: "none"}}
                onClick={this.onFileClicked.bind(this, file.pathid, file.type)}>
                {file.name + "/"}
                </Button>
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
        <ListItem button onClick={this.onFileClicked.bind(this, file.pathid, file.type)}>
            <ListItemAvatar>
                { file.type === "folder" ? <FolderIcon/> : <FileIcon/> }
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
            folders: files.filter(file => file.type === "folder"),
            files: files.filter(file => file.type !== "folder"),
        });
    }
}