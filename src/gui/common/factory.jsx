//*****************************************************************************
//*****************************************************************************
//
// Collections of components to help building other
//
//*****************************************************************************
//*****************************************************************************

import "./theme/theme.css"

import React, {
  useDeferredValue,
} from "react"

import {Icon} from "./icons"
import {IsKey, addHotkeys} from "./hotkeys"
import {enqueueSnackbar, closeSnackbar} from "notistack";
import {isNotEmpty} from "../../util";

import {
  Menu,
  Button as MuiButton,
} from "@base-ui/react"

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export {default as InfiniteScroll} from "react-infinite-scroll-component";

export {
  Icon,
  IsKey, addHotkeys,
}

export {
  Menu,
}

//-----------------------------------------------------------------------------
// Temporary export

export function ToggleButtonGroup({children}) {
  return <div>{children}</div>
}

export function ListSubheader({children}) {
  return <div>{children}</div>
}

export function MenuItem({children}) {
  return <div>{children}</div>
}

export function TextField({children}) {
  return <div>{children}</div>
}

export function Accordion({children}) {
  return <div>{children}</div>
}

export function AccordionDetails({children}) {
  return <div>{children}</div>
}

export function AccordionSummary({children}) {
  return <div>{children}</div>
}

export function Dialog({children}) {
  return null;
}

export function Snackbar({children}) {
  return null;
}

export function Tooltip({children}) {
  return <div>{children}</div>
}

/*
export {
  Spinner,
  Chip, Link,
  TextField,
  List, ListItem, ListItemText, ListSubheader, ListItemIcon, Typography,
  //Menu, MenuItem, MenuList,
  Accordion, AccordionSummary, AccordionDetails,
  Dialog,
  Snackbar
}
*/

//*****************************************************************************
//
// General
//
//*****************************************************************************

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

export class Separator extends React.PureComponent {
  render() {
    const {className, fullWidth, ...props} = this.props
    return <div className={addClass("Separator", className)} {...props}/>;
  }
}

//*****************************************************************************
//
// Toolbar
//
//*****************************************************************************

export class ToolBox extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <HBox className={addClass("ToolBox", className)} {...props}/>
  }
}

export class SideBar extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <VBox className={addClass("Sidebar", className)} {...props}/>
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
      return <Tooltip title={tooltip}><MuiButton {...props}/></Tooltip>
    }
    return <MuiButton {...props}/>
  }
}

export class ToggleButton extends React.PureComponent {

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

/*
export function MenuItem({onClick, value, disabled, title, startAdornment, endAdornment}) {
  return <MuiMenuItem value={value} disabled={disabled} onClick={onClick}>
    {startAdornment ? <ListItemIcon>{startAdornment}</ListItemIcon> : null}
    {title ? <ListItemText>{title}</ListItemText> : null}
    {endAdornment ? <Typography sx={{ color: 'text.secondary' }}>{endAdornment}</Typography> : null}
  </MuiMenuItem>
}
*/

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
// Dialogs
//
//*****************************************************************************

export function DialogTitle({children}) {
  return <HFiller style={{alignItems: "center", padding: "8px 16px", borderBottom: "1px solid lightgray"}}>{children}</HFiller>
}

export function DialogContent({children}) {
  // Double box so that scrollbar comes to the edge
  return <VBox style={{overflow: "auto"}}>
    <VBox style={{margin: "8px 16px"}}>{children}</VBox>
  </VBox>
}

export function DialogActions({children}) {
  return <HFiller style={{alignItems: "center", padding: "8px 16px", borderTop: "1px solid lightgray"}}>{children}</HFiller>
}

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
  error: msg => {
    console.log(msg);
    return enqueueSnackbar(String(msg), {variant: "error"});
  },
  info: msg => {
    return enqueueSnackbar(String(msg), {variant: "info"});
  },
  dismiss: key => {
    closeSnackbar(key)
  },
  process: msg => {
    return enqueueSnackbar(String(msg), {variant: "info", persist: true});
  },
}
/**/
