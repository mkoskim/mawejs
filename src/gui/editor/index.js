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
    case "splitview": return <div style={{margin: "8pt", width: "300pt"}}>
      <p>Placeholder</p>
      <p>Edit two docs at once: inteded for writing new drafts from previos
      ones.
      </p>
      </div>
    case "transfer": return <div style={{margin: "8pt", width: "300pt"}}>
      <p>Placeholder</p>
      <p>Move elements (parts, scenes) between files. This allows you to
      split and merge stories when needed. Not all ideas you get while writing one
      story fits there, but they might be worth of another story. Sometimes, you
      find out that two story drafts or ideas can be combined to even greater story.
      </p>
      </div>
    case "workspace": return <div style={{margin: "8pt", width: "300pt"}}>
      <p>Placeholder</p>
      <p>Manage workspace: load files, create new files and so on.
      </p>
      </div>
    case "workspaces": return <div style={{margin: "8pt", width: "300pt"}}>
      <p>Placeholder</p>
      <p>Manage workspaces: switch workspace, move files between them and so on.
      </p>
      </div>
    case "help": return <div style={{margin: "8pt", width: "300pt"}}>
      <p>Placeholder</p>
      <p>Help.
      </p>
      </div>
    case "settings": return <div style={{margin: "8pt", width: "300pt"}}>
      <p>Placeholder</p>
      <p>Manage settings.
      </p>
      </div>
    default: return <div style={{margin: "8pt", width: "300pt"}}>
      <p>Invalid view selection: {mode.mode}</p>
      </div>
  }
}

function ViewSelector({mode}) {
  return <VBox style={{borderRight: "1px solid lightgray", background: "white"}}>
    <BorderlessToggleButtonGroup exclusive orientation="vertical" value={mode.mode} onChange={(e, payload) => payload && mode.dispatch({type: "mode", payload})}>
      <ToggleButton value="workspace"><SidebarToggle tooltip="Workspace"><Icon.Placeholder sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <Separator/>
      <ToggleButton value="single"><SidebarToggle tooltip="Edit"><Icon.Action.Edit sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <ToggleButton value="organizer"><SidebarToggle tooltip="Outline"><Icon.Action.Cards sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <ToggleButton value="splitview"><SidebarToggle tooltip="Split view"><Icon.Placeholder sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <Separator/>
      <ToggleButton value="transfer"><SidebarToggle tooltip="Organize"><Icon.Placeholder sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <ToggleButton value="workspaces"><SidebarToggle tooltip="Switch workspaces"><Icon.Placeholder sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <Separator/>
      <ToggleButton value="help"><SidebarToggle tooltip="Help"><Icon.Help sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <ToggleButton value="settings"><SidebarToggle tooltip="Settings"><Icon.Settings sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
    </BorderlessToggleButtonGroup>
  </VBox>
}

function SidebarToggle({tooltip, children, ...props}) {
  return  <Tooltip title={tooltip} placement="right">
      {children}
    </Tooltip>
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
