//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import React, {
  useState, useEffect,
  useMemo, useCallback,
  useDeferredValue,
  StrictMode,
} from 'react';

import {
  docByID,
  docLoad, docSave
} from "./doc"

import {SingleEdit} from "./editor";
import {Organizer} from "./organizer";

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
} from "../common/factory";

import { styled } from '@mui/material/styles';

//-----------------------------------------------------------------------------
// Choose the view
//-----------------------------------------------------------------------------

export function EditView({mode, id}) {

  console.log("EditView/Mode:", mode)
  console.log("EditView/ID..:", id)

  // TODO: We need to wait loading here
  // TODO: If there is an error when loading, show it here
  // TODO: Get settings: general, file specific, current view, ...

  //const edit = useSelector(state => state.doc.edit)
  //const loading = useSelector(state => state.doc.loading)

  /*
  return <VBox className="ViewPort">
    <WorkspaceTab />
    {loading ? <Loading/> : <SingleEdit id={edit.id} />}
  </VBox>
  /*/
  return <HBox className="ViewPort">
    <ViewSelector mode={mode}/>
    <ChooseView mode={mode} id={id}/>
  </HBox>
  /**/
}

function ChooseView({mode, id}) {
  switch(mode.mode) {
    case "single": return <SingleEdit id={id}/>
    case "organizer": return <Organizer id={id}/>
  }
}

function ViewSelector({mode}) {
  return <VBox style={{borderRight: "1px solid lightgray", background: "white"}}>
    <BorderlessToggleButtonGroup exclusive orientation="vertical" value={mode.mode} onChange={(e, payload) => payload && mode.dispatch({type: "mode", payload})}>
      <ToggleButton value="single"><Tooltip title="Edit" placement='right'><Icon.Action.Edit sx={{ fontSize: 40 }}/></Tooltip></ToggleButton>
      <ToggleButton value="organizer"><Tooltip title="Outline" placement='right'><Icon.Action.Cards sx={{ fontSize: 40 }}/></Tooltip></ToggleButton>
      <ToggleButton value="search"><Tooltip title="Search" placement='right'><Icon.Action.Search sx={{ fontSize: 40 }}/></Tooltip></ToggleButton>
      <ToggleButton value="transfer"><Tooltip title="Organize" placement='right'><Icon.Action.Transfer sx={{ fontSize: 40 }}/></Tooltip></ToggleButton>
    </BorderlessToggleButtonGroup>
    <Separator/>
    <Tooltip title="Settings" placement='right'><Button><Icon.Settings sx={{ fontSize: 40 }}/></Button></Tooltip>
  </VBox>
}

const BorderlessToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    //margin: 0,
    //marginRight: theme.spacing(0.5),
    padding: "2pt",
    border: 0,
    '&.Mui-disabled': {
      //border: 0,
    },
    '&:first-of-type': {
      //borderRadius: theme.shape.borderRadius,
      //marginLeft: theme.spacing(0.5),
    },
    '&:not(:first-of-type)': {
      //borderRadius: theme.shape.borderRadius,
    },
  },
}));
