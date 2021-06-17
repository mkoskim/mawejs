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
  FlexBox, VBox, HBox,
} from "../components/factory";

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
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Avatar,
  AppBar, Drawer,
  Toolbar, IconButton, Typography, ButtonGroup,
  TextField, InputBase,
  CircularProgress, LinearProgress,
  Tooltip,
} from "@material-ui/core";

const document = require("../../document");

//-----------------------------------------------------------------------------

export function EditFile({fileid}) {
  const [content, setContent] = useState(undefined);
  const {enqueueSnackbar} = useSnackbar();
  
  useEffect(() => {
    loadContent(fileid)
      .then(content => {
        setContent(content);
        //enqueueSnackbar(`Loaded ${doc.file.name}`, {variant: "success"});
        enqueueSnackbar(`Loaded ${fileid}`, {variant: "success"});
      })
      .catch(err => enqueueSnackbar(String(err), {variant: "error"}));
  }, [fileid]);
  
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  //const renderElement = useCallback(props => <Element {...props} />, [])
  //const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  if(!content) return <p>Loading: {fileid}</p>;

  return (
    <Slate editor={editor} value={content} onChange={content => setContent(content)}>
    <Editable
      spellCheck={false} // Keep false until you find out how to change language
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      autoFocus
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
  );


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
