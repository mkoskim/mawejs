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

import { styled } from '@mui/material/styles';
import { theme } from "./theme";

import {
  Button as MuiButton,
  ToggleButton as MuiToggleButton,
  IconButton as MuiIconButton,
  ToggleButtonGroup,  ButtonGroup,

  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  MenuList as MuiMenuList,
  Dialog,

  Breadcrumbs,
  Chip, Link,
  TextField, InputAdornment, OutlinedInput,
  Tooltip as MuiTooltip, tooltipClasses,
  Divider, CircularProgress as Spinner,
  Typography,
  List, ListItem, ListItemText, ListSubheader, ListItemIcon,
  Select, InputLabel, FormControl,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material"

import {Icon} from "./icons"
import {IsKey, addHotkeys} from "./hotkeys"

import { enqueueSnackbar, closeSnackbar } from "notistack";
import { isNotEmpty } from "../../util";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";

export {default as InfiniteScroll} from "react-infinite-scroll-component";
export { theme }
export {
  Spinner,
  Chip, Link,
  TextField,
  List, ListItem, ListItemText, ListSubheader, ListItemIcon, Typography,
  //Menu, MenuItem, MenuList,
  Accordion, AccordionSummary, AccordionDetails,
  Dialog,
}

export {
  Icon,
  IsKey, addHotkeys,
}

//*****************************************************************************
//
// General
//
//*****************************************************************************

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

export function DeferredRender({children}) {
  //return props.children
  return useDeferredValue(children)
}

//-----------------------------------------------------------------------------

export function addClass(...classNames) {
  return classNames.filter(isNotEmpty).join(" ");
}

//*****************************************************************************
//
// Boxes
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Nice guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
//-----------------------------------------------------------------------------

export class Box extends React.PureComponent {
  render() {
    const {...props} = this.props
    return <div {...props}/>
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
    return <div className={addClass("VBox", className)} {...props} />
  }
}

export class HBox extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <div className={addClass("HBox", className)} {...props}/>
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
    return <div className={addClass("VBox Filler", className)} {...props} />
  }
}

export class HFiller extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <div className={addClass("HBox Filler", className)} {...props} />
  }
}

//*
export class Separator extends React.PureComponent {
  render() {
    const {className, fullWidth, ...props} = this.props
    return <div className={addClass("Separator", className)} {...props}/>;
  }
}
/*/
export {Divider as Separator}
/**/

//-----------------------------------------------------------------------------

export class ToolBox extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <HBox className={addClass("ToolBox", className)} {...props}/>
  }
}

//*****************************************************************************
//
// Buttons & groups
//
//*****************************************************************************

export class MakeToggleGroup extends React.PureComponent {

  render() {
    const {buttons, choices, disabled, selected, setSelected, ...props} = this.props

    if(!choices) return null;

    return <ToggleButtonGroup
      {...props}
      value={selected}
      onChange={(e, value) => setSelected(value)}
    >
      {choices.map(choice => this.constructor.makeButton(buttons, disabled, choice))}
    </ToggleButtonGroup>
  }

  static makeButton(buttons, disabled, choice) {
    const isDisabled = disabled?.includes(choice) ?? false

    if(!(choice in buttons)) return <ToggleButton key={choice} disabled={isDisabled} value={choice}>{choice}</ToggleButton>

    const {icon} = buttons[choice]

    if(isDisabled) return <ToggleButton key={choice} disabled={isDisabled} value={choice}>{icon}</ToggleButton>

    const {tooltip} = buttons[choice]

    return <ToggleButton key={choice} disabled={isDisabled} value={choice} tooltip={tooltip}>{icon}</ToggleButton>
  }
}

//-----------------------------------------------------------------------------

export {ButtonGroup}
/*
export function ButtonGroup(props) {
  return <XButtonGroup {...props} />
}
*/

/*
export {Button, IconButton, ToggleButton}
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

export class IconButton extends React.PureComponent {

  render() {
    const {tooltip, ...props} = this.props
    if(tooltip) {
      return <Tooltip title={tooltip}><MuiIconButton {...props}/></Tooltip>
    }
    return <MuiIconButton {...props}/>
  }
}

export class ToggleButton extends React.PureComponent {

  render() {
    const {tooltip, ...props} = this.props
    if(tooltip) {
      return <Tooltip title={tooltip}><MuiToggleButton {...props}/></Tooltip>
    }
    return <MuiToggleButton {...props}/>
  }
}
/**/

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

//*****************************************************************************
//
// Input
//
//*****************************************************************************

export class Input extends React.PureComponent {
  render() {
    return <OutlinedInput {...this.props}/>
  }
}

export class SearchBox extends React.PureComponent {

  static sx = {
    height: "32px",
    padding: "2px 2px 2px 4px",
  }

  render() {
    return <OutlinedInput
      sx={this.constructor.sx}
      //spellCheck={false}
      startAdornment={<Icon.Action.Search />}
      //endAdornment={<Icon.Close/>}
      {...this.props}
    />
  }
}

//-----------------------------------------------------------------------------

export {Breadcrumbs}

//*****************************************************************************
//
// Labels
//
//*****************************************************************************

export class Label extends React.PureComponent
{
  render() {
    const {text, children, ...props} = this.props

    return <span {...props}>{text}{children}</span>
  }
}

export function Loading({className, style}) {
  return <Filler className={className} style={style}>
    <Spinner style={{margin: "auto"}}/>
    </Filler>
}

//*****************************************************************************
//
// Menus
//
//*****************************************************************************

export {
  MuiMenu as Menu,
  MuiMenuItem
}
//Menu, MenuItem, MenuList,

export function MenuItem({onClick, value, disabled, title, startAdornment, endAdornment}) {
  return <MuiMenuItem value={value} disabled={disabled} onClick={onClick}>
    {startAdornment ? <ListItemIcon>{startAdornment}</ListItemIcon> : null}
    {title ? <ListItemText>{title}</ListItemText> : null}
    {endAdornment ? <Typography sx={{ color: 'text.secondary' }}>{endAdornment}</Typography> : null}
  </MuiMenuItem>
}

/*
// Need to figure out how to close popup when clicking child item
export function DropDown({variant = "popover", popupId, label, children}) {
  return <PopupState variant={variant} popupId={popupId}>
    {(popupState) => <>
      <Button {...bindTrigger(popupState)} endIcon={<Icon.Arrow.DropDown/>}>{label}</Button>
      <MuiMenu {...bindMenu(popupState)}>
        {children}
      </MuiMenu>
      </>
    }
  </PopupState>
}
*/

//*****************************************************************************
//
// Snackbar inform
//
//*****************************************************************************

//*
export const Inform = {
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
  process: msg => {
    return enqueueSnackbar(String(msg), {variant: "info", persist: true});
  },
}
/**/
