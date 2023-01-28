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

  console.log("Mode:", mode)
  // TODO: We need to wait loading here
  // TODO: If there is an error when loading, show it here
  // TODO: Get settings: general, file specific, current view, ...

  //const edit = useSelector(state => state.doc.edit)
  //const loading = useSelector(state => state.doc.loading)

  const [doc, setDoc] = useState(undefined)

  console.log("EditView/ID:", id)
  console.log("EditView/Doc:", doc)

  useEffect(() => {
    docLoad(id)
      .then(content => setDoc(content))
  }, [id])

  useEffect(() => addHotkeys({
    //"mod+o": (e) => onClose(e, dispatch),
    //"mod+w": (e) => onClose(e, dispatch),
    //"mod+s": (e) => mawe.saveas(docByID(id), path.join(cwd, "/testwrite.mawe")),
    "mod+s": (e) => docSave(docByID(id)),
  }));

  /*
  return <VBox className="ViewPort">
    <WorkspaceTab />
    {loading ? <Loading/> : <SingleEdit id={edit.id} />}
  </VBox>
  /*/
  return <HBox className="ViewPort">
    <ViewSelector mode={mode}/>
    <ChooseView mode={mode} id={id} doc={doc}/>
  </HBox>
  /**/
}

function ChooseView({mode, id, doc}) {
  if(!doc) return <Loading/>
  switch(mode.mode) {
    case "single": return <SingleEdit id={id} doc={doc}/>
    case "organizer": return <Organizer id={id} doc={doc}/>
  }
}

function ViewSelector({mode}) {
  return <VBox style={{borderRight: "1px solid lightgray", background: "white"}}>
    <BorderlessToggleButtonGroup exclusive orientation="vertical" size="large" value={mode.mode} onChange={(e, payload) => payload && mode.dispatch({type: "mode", payload})}>
      <Tooltip title="Edit" arrow placement="right"><ToggleButton value="single"><Icon.Action.Edit /></ToggleButton></Tooltip>
      <Tooltip title="Organizer" arrow placement="right"><ToggleButton value="organizer"><Icon.Action.Cards /></ToggleButton></Tooltip>
      <Tooltip title="Search" arrow placement="right"><ToggleButton value="search"><Icon.Action.Search /></ToggleButton></Tooltip>
    </BorderlessToggleButtonGroup>
  </VBox>
}

const BorderlessToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    //margin: 0,
    //marginRight: theme.spacing(0.5),
    //padding: "4pt",
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
