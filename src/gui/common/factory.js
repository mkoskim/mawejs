//*****************************************************************************
//*****************************************************************************
//
// Collections of components to help building other
//
//*****************************************************************************
//*****************************************************************************

import "./factory.css"

/* eslint-disable no-unused-vars */

//-----------------------------------------------------------------------------
import React, {
  useDeferredValue,
} from "react"

import isHotkey from 'is-hotkey';

/*
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
*/

import { styled } from '@mui/material/styles';

import {
  Button as XButton, ButtonGroup,
  ToggleButton, ToggleButtonGroup,
  Breadcrumbs,
  Chip, Link,
  TextField, InputAdornment,
  Tooltip as MuiTooltip, tooltipClasses,
  Divider, CircularProgress as Spinner,
  List, ListItem, ListItemText,
  Grid,
  Typography,
  Menu, MenuItem,
} from "@mui/material"
import {OutlinedInput} from "@mui/material";

import {DataGrid} from "@mui/x-data-grid"

export {default as InfiniteScroll} from "react-infinite-scroll-component";
export {
  Spinner,
  Grid,
  Chip, Link,
  List, ListItem, ListItemText,
  ToggleButton, ToggleButtonGroup,
  Menu, MenuItem,
  isHotkey,
  DataGrid,
}

//-----------------------------------------------------------------------------
// Tooltips
//-----------------------------------------------------------------------------

/*
const Tooltip = styled(({ className, ...props }) => (
  <muiTooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));
*/

export function Tooltip(props) {
  return <MuiTooltip arrow {...props}/>
}

//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

const muiIcons = require("@mui/icons-material/")
//console.log("Icons", require("@material-ui/icons/"))

// Material icons
export const Icon = {
  Placeholder: muiIcons.LightbulbOutlined,

  Close: muiIcons.Close,
  Star: muiIcons.StarOutlineOutlined,
  Starred: muiIcons.Star,
  Circle: muiIcons.Circle,
  Help: muiIcons.HelpOutline,
  Menu: muiIcons.Menu,

  NewFile: muiIcons.NoteAddOutlined,
  NewFolder: muiIcons.CreateNewFolderOutlined,
  AddFiles: muiIcons.FolderOpenOutlined,

  Settings: muiIcons.SettingsOutlined,

  Action: {
    Search: muiIcons.Search,
    Edit: muiIcons.ArticleOutlined,
    Cards: muiIcons.GridViewOutlined,
    Transfer: muiIcons.SwapHorizontalCircleOutlined,
    Print: muiIcons.PrintOutlined,
    Folder: muiIcons.FolderOutlined,
    File: {
      New: muiIcons.NoteAddOutlined,
      Open: muiIcons.FileOpenOutlined,
      Save: muiIcons.SaveOutlined,
      SaveAs: muiIcons.SaveAsOutlined,
    }
  },

  Location: {
    Home: muiIcons.Home,
    Favorites: muiIcons.Favorite,
  },

  FileType: {
    Folder: muiIcons.Folder,
    File: muiIcons.InsertDriveFileOutlined,
    Unknown: muiIcons.BrokenImageOutlined,
    Selected: muiIcons.CheckBox,
  },

  BlockType: {
    Scene: muiIcons.FormatAlignJustifyOutlined,
    Synopsis: muiIcons.FormatAlignRightOutlined,
    Comment: muiIcons.Comment,
    Missing: muiIcons.Report,
  },
  StatType: {
    Off: muiIcons.VisibilityOff,
    Words: muiIcons.Numbers,
    Percent: muiIcons.Percent,
    Cumulative: muiIcons.SignalCellularAlt,
  },

  MoreHoriz: muiIcons.MoreHoriz,
  PaperClipHoriz: muiIcons.Attachment,
  PaperClipVert: muiIcons.AttachFile,
}

//-----------------------------------------------------------------------------

export function DeferredRender({children}) {
  //return props.children
  return useDeferredValue(children)
}

//-----------------------------------------------------------------------------

export const isEmpty = x => !x;
export const isNotEmpty = x => !!x;

//-----------------------------------------------------------------------------

export function addClass(...classNames) {
  return classNames.filter(isNotEmpty).join(" ");
}

export function addHotkeys(hotkeys) {
  const handler = event => {
    for(const key in hotkeys) {
      if(isHotkey(key, event)) {
        //event.preventDefault();
        event.stopPropagation();
        if(hotkeys[key]) hotkeys[key]();
      }
    }
  }

  //console.log("Adding hotkeys")
  document.addEventListener("keydown", handler);

  return () => {
    //console.log("Removing hotkeys")
    document.removeEventListener("keydown", handler)
  }
}

//-----------------------------------------------------------------------------
// Nice guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
//-----------------------------------------------------------------------------

export function Box({style, ...props}) {
  return <div style={style} {...props}/>
}

export function FlexBox({style, ...props}) {
  return <div style={{display: "flex", ...style}} {...props} />;
}

export function Filler({weight = 1, style, ...props}) {
  return <div style={{display: "flex", flexGrow: weight, ...style}} {...props}/>
}

export function VBox({className, ...props}) {
  return <div className={addClass(className, "VBox")} {...props} />
}

export function HBox({className, ...props}) {
  return <div className={addClass(className, "HBox")} {...props}/>
}

export function VFiller({className, ...props}) {
  return <div className={addClass(className, "VBox Filler")} {...props} />
}

export function HFiller({className, ...props}) {
  return <div className={addClass(className, "HBox Filler")} {...props} />
}

//*
export function Separator({className, fullWidth, ...props}) {
  return <div className={addClass(className, "Separator")} {...props}/>;
}
/*/
export {Divider as Separator}
/**/

//-----------------------------------------------------------------------------

export function ToolBox({style, ...props}) {
  return <HBox style={{
    paddingLeft: 4, paddingRight: 4,
    paddingTop: 4, paddingBottom: 4,
    //backgroundColor: "#F8F8F8",
    alignItems: "center",
    borderBottom: "1pt solid lightgray",
    ...style}}
    {...props}
  />
}

//-----------------------------------------------------------------------------

export function MakeToggleGroup(buttons, group, exclusive) {
  if(!group?.choices) return null;

  function getButton(choice) {
    if(!(choice in buttons)) return <ToggleButton key={choice} value={choice}>
      {choice}
    </ToggleButton>

    const {tooltip, icon} = buttons[choice]
    return <ToggleButton key={choice} value={choice}>
      <Tooltip title={tooltip}>
        {icon}
      </Tooltip>
    </ToggleButton>
  }

  return <BorderlessToggleButtonGroup
    exclusive={exclusive}
    value={group.value}
    onChange={(e, value) => (exclusive ? value : true) && group.setValue(value)}
  >
    {group.choices.map(choice => getButton(choice))}
  </BorderlessToggleButtonGroup>
}

const BorderlessToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    //margin: 0,
    //marginRight: theme.spacing(0.5),
    //padding: "5pt",
    padding: "4px",
    border: 0,
    borderRadius: 0,
    "&:hover": {
      background: "lightgrey",
    },
    '&.Mui-selected': {
      background: "lightblue",
    },
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

//-----------------------------------------------------------------------------

export {Breadcrumbs}

//-----------------------------------------------------------------------------

export {ButtonGroup}
/*
export function ButtonGroup(props) {
  return <XButtonGroup {...props} />
}
*/

/*
export {Button, IconButton}
/*/
export function Button({tooltip, ...props}) {
  if(tooltip) {
    return <Tooltip title={tooltip}><XButton {...props}/></Tooltip>
  }
  return <XButton {...props}/>
}
/**/

//-----------------------------------------------------------------------------

export function Label({text, variant="body1", style, children, ...props}) {
  return <Typography
    variant={variant}
    style={{...style}}
    {...props}
    >
      {text}{children}
    </Typography>
}

export function Input(props) {
  return <TextField {...props}/>
}

export function SearchBox({onCancel, ...props})
{
//*
  return <OutlinedInput
    spellCheck={false}
    startAdornment={
      <InputAdornment position="start"><Icon.Action.Search /></InputAdornment>
    }
    {...props}
  />
/*/
  return <OutlinedInput
    type="search"
    spellCheck={false}
    {...props}
  />
/**/
}

export function Loading({className, style}) {
  return <Filler className={className} style={style}>
    <Spinner style={{margin: "auto"}}/>
    </Filler>
}

//-----------------------------------------------------------------------------
// Inform user about things that are happening or happened.
//-----------------------------------------------------------------------------

/*
export function Inform() {
  const snackbar = useSnackbar();
  const enqueue = snackbar.enqueueSnackbar;
  const close = snackbar.closeSnackbar;

  return {
    process: msg => {
      return enqueue(String(msg), {variant: "info", persist: true});
    },
    success: msg => {
      return enqueue(String(msg), {variant: "success"});
    },
    warning: msg => {
      return enqueue(String(msg), {variant: "warning"});
    },
    error: err => {
      console.log(err);
      return enqueue(String(err), {variant: "error"});
    },
    dismiss: key => close(key),
  }
}
*/
