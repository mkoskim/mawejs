//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { useSnackbar } from 'notistack';

import { Slate, Editable, withReact } from 'slate-react'
import { createEditor } from "slate"
import { withHistory } from "slate-history"

import {
  FlexBox, VBox, HBox, Filler,
  ToolBox, Button, Input,
} from "../components/factory";

import {
  Dialog,
  Card, CardContent,
  Checkbox, Icon,
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
import TrashIcon from '@material-ui/icons/DeleteOutline';

import TypeFolder from '@material-ui/icons/Folder';
import TypeFile from '@material-ui/icons/DescriptionOutlined';
//import TypeUnknown from '@material-ui/icons/Close';
//import TypeUnknown from '@material-ui/icons/Help';
import TypeUnknown from '@material-ui/icons/BrokenImageOutlined';
//import TypeUnknown from '@material-ui/icons/BrokenImage';
//import TypeUnknown from '@material-ui/icons/CancelPresentationOutlined';

import isHotkey from 'is-hotkey';

const document = require("../../document");

//-----------------------------------------------------------------------------

export function EditFile({fileid, hooks}) {
  const [content, setContent] = useState();
  const {enqueueSnackbar} = useSnackbar();
  
  useEffect(() => {
    loadContent(fileid)
      .then(content => {
        setContent(content);
        //enqueueSnackbar(`Loaded ${doc.file.name}`, {variant: "success"});
        enqueueSnackbar(`Loaded ${fileid}`, {variant: "success"});
      })
      .catch(err => {
        // TODO: Improve!!!
        enqueueSnackbar(String(err), {variant: "error"});
        setContent([{type: "paragraph", children: [{text: ""}]}])
        //hooks.closeFile();
      });
  }, [fileid]);
  
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  //const renderElement = useCallback(props => <Element {...props} />, [])
  //const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  const hotkeys = {
    "mod+w": hooks.closeFile,
  }

  return (
    <React.Fragment>
      <ToolBar />
      <Content />
    </React.Fragment>
  );

  function ToolBar() {
    return (
      <ToolBox flexGrow={1}>
        <Typography>{content ? "File" : "Loading"}: {fileid}</Typography>
        <Filler/>
        <IconButton size="small" style={{marginLeft: 8}}><StarIcon /></IconButton>
        <Button><SearchIcon onClick={() => hooks.setSearch(true)}/></Button>
      </ToolBox>
    )
  }

  function Content() {
    if(!content) return null;
    return (
      <Slate editor={editor} value={content} onChange={content => setContent(content)}>
        <Editable
          autoFocus
          spellCheck={false} // Keep false until you find out how to change language
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          style={{
            overflowY: "auto",
            paddingLeft: "1.5cm",
            paddingRight: "1.5cm",
            paddingTop: "1cm",
            paddingBottom: "2cm",
            fontFamily: "Times",
            fontSize: "13pt",
          }}
        />
      </Slate>
    )
  }

  function onKeyDown(event) {
    for(const key in hotkeys) {
      if(isHotkey(key, event)) {
        event.preventDefault();
        hotkeys[key]();
      }
    }
  }
  /*
  return (
    <VBox style={{
      overflowY: "auto",
      paddingLeft: "1.5cm",
      paddingRight: "1.5cm",
      paddingTop: "1cm",
      paddingBottom: "2cm",
      fontFamily: "Times",
      fontSize: "13pt",
      }}>
      <Slate editor={editor} value={content} onChange={content => setContent(content)}>
        <p>{fileid}</p>
        <Editable
          spellCheck={false} // Keep false until you find out how to change language
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          autoFocus
          //style={{paddingTop: "1cm"}}
        />
      </Slate>
    </VBox>
  )
  */
}

function renderElement({element, attributes, children}) {
  switch(element.type) {
    case "scene": return <p {...attributes}><b>{children}</b></p>
    default: return <p {...attributes}>{children}</p>
  }
}

function renderLeaf({leaf, attributes, children}) {
  return <span {...attributes}>{children}</span>
}

//-----------------------------------------------------------------------------

async function loadContent(fileid) {
  const doc = await document.load(fileid);
  console.log("Doc:", doc);
  const content = Story2Slate(doc.story);
  console.log("Content:", content)

  return content;

  function Story2Slate(story) {
    return []
      //.concat(Part2Slate(story.notes.part[0]))
      .concat(Part2Slate(story.body.part[0]))
  }

  function Part2Slate(part) {
    return part.children.map(Scene2Slate).flat(1);
  }

  function Scene2Slate(scene) {
    return [{
      type: "scene",
      children: [{text: scene.attr.name}],
    }].concat(scene.children.map(Paragraph2Slate))
  }

  function Paragraph2Slate(p) {
    return {
      type: "paragraph",
      children: [{ text: p.text }]
    }
  }
}
