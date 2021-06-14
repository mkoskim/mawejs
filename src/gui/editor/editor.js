//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import React, {useState, useEffect} from 'react';
import { useSnackbar } from 'notistack';

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

export function FileEditor({fileid}) {
  const [content, setContent] = useState(undefined);
  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    document.load(fileid)
      .then(doc => {
        //doc.story.version.push(JSON.parse(JSON.stringify(doc.story.body)));
        setContent(doc);
        //document.save.mawe("./local/test2.mawe", doc.story)
        //.catch(e => { console.log(e); })
        ;
        //document.print.rtf();
        enqueueSnackbar(`Loaded ${doc.file.name}`, {variant: "success"});
      })
      .catch(err => enqueueSnackbar(String(err), {variant: "error"}));
  }, [fileid]);

  if(!content) return <p>Loading: {fileid}</p>;

  //return <pre>{JSON.stringify(content, null, 2)}</pre>;
  return <Box><ViewPart part={content.story.body.part[0]}/></Box>
}

function ViewPart({part}) {
  return part.children.map(s => <RenderScene scene={s} />);
  //return <pre>{JSON.stringify(part, null, 2)}</pre>;

  function RenderScene({scene}) {
    return (
      <div>
        <p><b>{scene.attr.name}</b></p>
        {scene.children.map(p => <RenderParagraph p={p}/>)}
      </div>
    );

    function RenderParagraph({p}) {
      return <p>{p.text}</p>;
    }
  }
}
