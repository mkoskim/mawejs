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
  Button as MuiButton, ButtonGroup,
  ToggleButton, ToggleButtonGroup,
  Breadcrumbs,
  Chip, Link,
  TextField, InputAdornment,
  Tooltip as MuiTooltip, tooltipClasses,
  Divider, CircularProgress as Spinner,
  List, ListItem, ListItemText,
  Grid,
  Menu, MenuItem,
  //Select, InputLabel, FormControl,
} from "@mui/material"
import {OutlinedInput} from "@mui/material";

import { createTheme } from '@mui/material/styles';

export {default as InfiniteScroll} from "react-infinite-scroll-component";
export {
  Spinner,
  Grid,
  Chip, Link,
  List, ListItem, ListItemText,
  ToggleButton, ToggleButtonGroup,
  Menu, MenuItem,
  isHotkey,
  //Select, InputLabel, FormControl,
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

  Arrow: {
    Left: muiIcons.ArrowLeft,
    Right: muiIcons.ArrowRight,
    Up: muiIcons.ArrowDropUp,
    Down: muiIcons.ArrowDropDown,
  },

  View: {
    Index: muiIcons.FormatAlignLeft,
    List: muiIcons.FormatListNumberedRtl,
    Edit: muiIcons.ArticleOutlined,
    Outline: muiIcons.GridViewOutlined,
    Export: muiIcons.PrintOutlined,
    Chart: muiIcons.DonutLarge,
  },

  //NewFile: muiIcons.NoteAddOutlined,
  //NewFolder: muiIcons.CreateNewFolderOutlined,
  //AddFiles: muiIcons.FolderOpenOutlined,

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
    },
    Replay: muiIcons.Replay,
    Cached: muiIcons.Cached,
    Loop: muiIcons.Loop,
    Rotate: {
      CW: muiIcons.RotateRight,
      CCW: muiIcons.RotateLeft,
    },
    VerticalAlign: {
      Top: muiIcons.VerticalAlignTop,
      Bottom: muiIcons.VerticalAlignBottom,
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
  return <HBox className="ToolBox" style={style} {...props}/>
}

//-----------------------------------------------------------------------------

export class MakeToggleGroup extends React.PureComponent {

  render() {
    const {buttons, choices, selected, setSelected, exclusive = false} = this.props

    if(!choices) return null;

    return <BorderlessToggleButtonGroup
      exclusive={exclusive}
      value={selected}
      onChange={(e, value) => (exclusive ? value : true) && setSelected(value)}
    >
      {choices.map(choice => makeButton(choice))}
    </BorderlessToggleButtonGroup>

    function makeButton(choice) {
      if(!(choice in buttons)) return <ToggleButton key={choice} value={choice}>
        {choice}
      </ToggleButton>

      const {tooltip, icon} = buttons[choice]
      if(tooltip) return <ToggleButton key={choice} value={choice}>
        <Tooltip title={tooltip}>
          {icon}
        </Tooltip>
      </ToggleButton>

      return <ToggleButton key={choice} value={choice}>{icon}</ToggleButton>
    }
  }
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
    return <Tooltip title={tooltip}><MuiButton {...props}/></Tooltip>
  }
  return <MuiButton {...props}/>
}
/**/

//-----------------------------------------------------------------------------

export function Label({text, style, children, ...props}) {
  return <span
      style={{...style}}
      {...props}
    >
      {text}{children}
    </span>
}

export {
  OutlinedInput as Input,
}

export function SearchBox({...props})
{
  return <OutlinedInput
    type="search"
    spellCheck={false}
    startAdornment={
      <InputAdornment position="start"><Icon.Action.Search /></InputAdornment>
    }
    {...props}
  />
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

//-----------------------------------------------------------------------------
// Theme
//-----------------------------------------------------------------------------

export const theme = createTheme({
  palette: {
    primary: { main: "#222", },
  },
  typography: {
    //fontSize: 14,
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          fontSize: "12pt",
          minWidth: "32px",
          minHeight: "32px",
          padding: "4px 4px",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          fontSize: "12pt",
          minWidth: "32px",
          //minHeight: "32px",
          //padding: "4px 4px",
        },
      },
    },
    MuiToggleButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          fontSize: "12pt",
          minWidth: "32px",
          //minHeight: "32px",
          //padding: "4px 4px",
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
      /*
      styleOverrides: {
        root: {
          textTransform: 'none',
          //fontSize: "12pt",
          padding: "4px 4px",
          //margin: 0,
        },
      },
      */
    },
    MuiFilledInput: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiFormHelperText: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiInputBase: {
      defaultProps: {
        size: "small",
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          paddingLeft: "5px",
        },
        input: {
          height: "24px",
          padding: "4px",
        }
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        size: "small",
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          paddingLeft: "5px",
        },
        input: {
          height: "24px",
          padding: "4px",
        }
      },
    },
    MuiTextField: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiInputLabel: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiListItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiFab: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense',
      },
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
