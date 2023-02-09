//*****************************************************************************
//*****************************************************************************
//
// Application main
//
//*****************************************************************************
//*****************************************************************************

import "./app.css"

/* eslint-disable no-unused-vars */

import React, {
  useEffect, useState, useReducer
} from "react"

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

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

import {SingleEdit} from "../editor/editor";
import {Organizer} from "../outliner/outliner";
import {Export} from "../export/export"

//-----------------------------------------------------------------------------

const myTheme = createTheme({
  palette: {
    primary: {
      main: "#222",
    },
  },
  typography: {
    fontSize: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 0,
          fontSize: "12pt",
          lineHeight: 1.0,
          padding: "8px",
        },
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
        },
      }
    },
    MuiBreadcrumbs: {
      styleOverrides: {
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "11pt",
        }
      }
    },
  },
});

//-----------------------------------------------------------------------------

export default function App(props) {

  console.log("App")

  /*
  const dispatch = useDispatch()

  //---------------------------------------------------------------------------
  // Run initializes & wait them to finish

  useEffect(() => {
    console.log("Initializing...")
    dispatch(action.CWD.resolve("./local"))
    //dispatch(CWD.location("home"))
    //dispatch(onOpen({id: "./local/Beltane.A.mawe.gz", name: "Beltane.A.mawe.gz"}))
    dispatch(action.workspace.init())
    dispatch(action.doc.init())
  }, [])

  const status = [
    useSelector(state => state.workspace.status),
    useSelector(state => state.doc.status),
  ]

  console.log("Status:", status)

  if(!status.every(s => s))
  {
    return <View.Starting />
  }
  */

  const [_mode, _dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'mode':
          return {...state, mode: action.payload};
        default:
          throw new Error();
      }
    },
    {
      mode: "editor"
      //mode: "outliner"
    }
  );

  const mode = {
    ..._mode,
    dispatch: _dispatch,
  }

  //const id = "./local/Beltane.mawe";
  //const id = "./local/Dinosauruspuisto.mawe";
  //const id = "./local/JazramonGjerta.test.mawe";
  //const id = "./local/testwrite.mawe";
  //const id = "./local/TestDoc1.mawe";
  //const id = "./local/TestDoc2.mawe";
  //const id = "./local/EmptyDoc.mawe";
  //const id = "./local/Lorem30k.mawe";
  const id = "./local/UserGuide.mawe";

  //const id = "./local/mawe2/NeljaBarnaa.mawe";
  //const id = "./local/mawe2/JazramonGjerta.mawe";
  //const id = "./local/mawe2/LammenHirvio.mawe";
  //const id = "./local/mawe2/CasaMagda.mawe";

  return (
    <ThemeProvider theme={myTheme}>
    <HBox className="ViewPort">
      <ViewSelector mode={mode}/>
      <ChooseView mode={mode} id={id}/>
    </HBox>
    </ThemeProvider>
  )
}

//-----------------------------------------------------------------------------
// Choose the view
//-----------------------------------------------------------------------------

function ChooseView({mode, id}) {

  console.log("EditView/Mode:", mode)
  console.log("EditView/ID..:", id)

  switch(mode.mode) {
    case "editor": return <SingleEdit id={id}/>
    case "outliner": return <Organizer id={id}/>
    case "splitview": return <div style={{margin: "8pt", width: "300pt"}}>
      <p>Placeholder</p>
      <p>Edit two docs at once: inteded for writing new drafts from previos
      ones.
      </p>
      </div>
    case "export": return <Export id={id}/>
    case "folder": return <div style={{margin: "8pt", width: "300pt"}}>
      <p>Placeholder</p>
      <p>Show folder where file is located.
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

//-----------------------------------------------------------------------------
// View selector
//-----------------------------------------------------------------------------

function ViewSelector({mode}) {
  return <VBox style={{borderRight: "1px solid lightgray", background: "white"}}>
    <BorderlessToggleButtonGroup exclusive orientation="vertical" value={mode.mode} onChange={(e, payload) => payload && mode.dispatch({type: "mode", payload})}>
      <ToggleButton value="workspace"><SidebarToggle tooltip="Workspace"><Icon.Placeholder sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <Separator/>
      <ToggleButton value="editor"><SidebarToggle tooltip="Edit"><Icon.Action.Edit sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <ToggleButton value="outliner"><SidebarToggle tooltip="Outline"><Icon.Action.Cards sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <ToggleButton value="splitview"><SidebarToggle tooltip="Split view"><Icon.Placeholder sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <ToggleButton value="export"><SidebarToggle tooltip="Export"><Icon.Action.Print sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>
      <ToggleButton value="folder"><SidebarToggle tooltip="Show folder"><Icon.Action.Folder sx={{ fontSize: 40 }}/></SidebarToggle></ToggleButton>

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
