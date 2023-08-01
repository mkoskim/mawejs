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
import { nanoid } from "../../document/util";

import { styled } from '@mui/material/styles';
import { theme } from "./theme";

import {
  Button as MuiButton, ButtonGroup,
  ToggleButton, ToggleButtonGroup,
  Breadcrumbs,
  Chip, Link,
  TextField, InputAdornment, OutlinedInput,
  Tooltip as MuiTooltip, tooltipClasses,
  Divider, CircularProgress as Spinner,
  List, ListItem, ListItemText, ListSubheader,
  Grid,
  Menu, MenuItem,
  Select, InputLabel, FormControl,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material"

//import { enqueueSnackbar, closeSnackbar } from "notistack";

export {default as InfiniteScroll} from "react-infinite-scroll-component";
export { theme }
export {
  Spinner,
  Grid,
  Chip, Link,
  TextField,
  List, ListItem, ListItemText, ListSubheader,
  ToggleButton, ToggleButtonGroup,
  Menu, MenuItem,
  isHotkey,
  Accordion, AccordionSummary, AccordionDetails,
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

  ExpandMore: muiIcons.ExpandMore,

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

  RadioButton: {
    Unchecked: muiIcons.RadioButtonUnchecked,
    Checked: muiIcons.RadioButtonChecked,
  }
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

export class Box extends React.PureComponent {
  render() {
    const {style, ...props} = this.props
    return <div style={style} {...props}/>
  }
}

export class FlexBox extends React.PureComponent {
  render() {
    const {style, ...props} = this.props
    return <div style={{display: "flex", ...style}} {...props} />;
  }
}

export class VBox extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <div className={addClass(className, "VBox")} {...props} />
  }
}

export class HBox extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <div className={addClass(className, "HBox")} {...props}/>
  }
}

//-----------------------------------------------------------------------------

export class Filler extends React.PureComponent {
  render() {
    const {weight = 1, style, ...props} = this.props
    return <div style={{display: "flex", flexGrow: weight, ...style}} {...props}/>
  }
}

export class VFiller extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <div className={addClass(className, "VBox Filler")} {...props} />
  }
}

export class HFiller extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <div className={addClass(className, "HBox Filler")} {...props} />
  }
}

//*
export class Separator extends React.PureComponent {
  render() {
    const {className, fullWidth, ...props} = this.props
    return <div className={addClass(className, "Separator")} {...props}/>;
  }
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

export function Input({...props}) {
  return <OutlinedInput {...props}/>
}

export function SearchBox({...props})
{
  return <OutlinedInput
    sx= {{
      paddingLeft: "5px",
      height: "32px",
      padding: "4px",
    }}
    //spellCheck={false}
    startAdornment={
      <InputAdornment position="start"><Icon.Action.Search /></InputAdornment>
    }
    {...props}
  />
}

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
export class Button extends React.PureComponent {

  render() {
    const {tooltip, ...props} = this.props
    if(tooltip) {
      return <Tooltip title={tooltip}><MuiButton {...props}/></Tooltip>
    }
    return <MuiButton {...props}/>
  }
}
/**/

//-----------------------------------------------------------------------------

export class Label extends React.PureComponent
{
  render() {
    const {text, style, children, ...props} = this.props

    return <span
        style={{...style}}
        {...props}
      >
        {text}{children}
      </span>
  }
}

export function Loading({className, style}) {
  return <Filler className={className} style={style}>
    <Spinner style={{margin: "auto"}}/>
    </Filler>
}

//-----------------------------------------------------------------------------

export function Radio({style, choice, selected, setSelected}) {
  const props = {
    className: "RadioButton",
    fontSize: "small",
    style: {...style},
    onClick: e => setSelected && setSelected(choice),
  }

  if(selected === choice) {
    return <Icon.RadioButton.Checked {...props}/>
  }
  return <Icon.RadioButton.Unchecked {...props}/>
}

//-----------------------------------------------------------------------------
// Inform user about things that are happening or happened.
//-----------------------------------------------------------------------------

/*
export const Inform = {
  process: msg => {
    return enqueueSnackbar(String(msg), {variant: "info", persist: true});
  },
  success: msg => {
    return enqueueSnackbar(String(msg), {variant: "success"});
  },
  warning: msg => {
    return enqueueSnackbar(String(msg), {variant: "warning"});
  },
  error: err => {
    console.log(err);
    return enqueueSnackbar(String(err), {variant: "error"});
  },
  dismiss: key => {
    closeSnackbar(key)
  },
}
/**/
