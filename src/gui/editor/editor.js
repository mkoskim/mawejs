//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import "./editor.css"

/* eslint-disable no-unused-vars */

import React, {useState, useEffect, useMemo, useCallback} from 'react';

//import {SlateEditor} from "@react-force/slate-editor";

//*
import { Slate, Editable, withReact } from 'slate-react'
import { createEditor } from "slate"
import { withHistory } from "slate-history"
/**/

import {
  FlexBox, VBox, HBox, Filler,
  ToolBox, Button, Input,
  SearchBox, Inform,
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
  Tooltip, Snackbar,
} from "@material-ui/core";

import CloseIcon from '@material-ui/icons/Close' 
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

//*****************************************************************************
//*****************************************************************************
//
// NOTE!!! Slate is very picky that all its components are together. So, do
// not separate Slate from its state and such things. If you do that, it will
// not work!
//
// IT WILL NOT WORK!
//
//*****************************************************************************
//*****************************************************************************

export function EditFile({doc, hooks}) {
  const [content, setContent] = useState([
    { type: "paragraph", children: [{text: ""}] }
  ]);
  const inform = Inform();
  
  useEffect(() => { setContent(deserialize(doc)); }, [doc]);
  
  const hotkeys = {
    "mod+w": hooks.closeFile,   // Close this file
    "mod+o": hooks.closeFile,   // Go to file browser to open new file
    "mod+s": null,              // Serialize and save
  }

  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  return (
    <React.Fragment>
      <ToolBar />
      <div className="Board">
      <Slate editor={editor} value={content} onChange={setContent}>
        <Editable
          autoFocus
          spellCheck={false} // Keep false until you find out how to change language
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          className="Sheet"
        />
      </Slate>
      </div>
    </React.Fragment>
  )

  function ToolBar(props) {
    return (
      <ToolBox flexGrow={1}>
        <Typography>{doc.file.name}</Typography>
        <SearchBox style={{marginLeft: 8, marginRight: 8}}/>
        <Filler/>
        <Button size="small"><SearchIcon /></Button>
      </ToolBox>
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

  function Element({element, attributes, children}) {
    switch(element.type) {
      case "title": return <h1 {...attributes}>{children}</h1>
      case "scene":   
      case "missing": 
      case "comment":
      case "synopsis":
        return <p className={element.type} {...attributes}>{children}</p>
      default: return <p {...attributes}>{children}</p>
    }
  }
  
  function Leaf({leaf, attributes, children}) {
    return <span {...attributes}>{children}</span>
  }  
}

//-----------------------------------------------------------------------------

function deserialize(doc) {
  console.log("Doc:", doc)
  const content = Story2Slate(doc.story);
  console.log("Content:", content)
  return content;

  function Story2Slate(story) {
    return [
      { type: "title", children: [{text: story.body.head.title}] },
      ]
      //.concat(Part2Slate(story.notes.part[0]))
      .concat(Part2Slate(story.body.part[0]))
      .concat([{type: "p", children: [{text: ""}]}])
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
    const type = p.tag;
    return {
      type: type,
      children: [{ text: p.text }]
    }
  }
}
