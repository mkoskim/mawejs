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

import { Icon } from "./icons"
import { IsKey, addHotkeys } from "./hotkeys"
import { enqueueSnackbar, closeSnackbar } from "notistack";
import { isNotEmpty } from "../../util";

import {
  Menu,
  Button as BUIButton,
  ToggleGroup,
  Toggle,
  Tooltip as BUITooltip,
} from "@base-ui/react"

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export { default as InfiniteScroll } from "react-infinite-scroll-component";

export {
  Icon,
  IsKey, addHotkeys,
}

//-----------------------------------------------------------------------------
// Temporary export

export function OutlinedInput({ children }) {
  return <input {...children} />
}

export function ListSubheader({ children }) {
  return <div>{children}</div>
}

export function TextField({ children }) {
  return <div>{children}</div>
}

export function Accordion({ children }) {
  return <div>{children}</div>
}

export function AccordionDetails({ children }) {
  return <div>{children}</div>
}

export function AccordionSummary({ children }) {
  return <div>{children}</div>
}

export function Dialog({ children }) {
  return null;
}

export function Snackbar({ children }) {
  return null;
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
    const { weight = 1, style, ...props } = this.props
    return <div style={{ display: "flex", flexGrow: weight, ...style }} {...props} />
  }
}

export class VFiller extends React.PureComponent {
  render() {
    const { className, ...props } = this.props
    return <div className={addClass("VBox Filler", className)} {...props} />
  }
}

export class HFiller extends React.PureComponent {
  render() {
    const { className, ...props } = this.props
    return <div className={addClass("HBox Filler", className)} {...props} />
  }
}

export class Separator extends React.PureComponent {
  render() {
    const { className, fullWidth, ...props } = this.props
    return <div className={addClass("Separator", className)} {...props} />;
  }
}

//*****************************************************************************
//
// Tooltip
//
//*****************************************************************************

export function Tooltip({tooltip, children}) {
  return <BUITooltip.Root>
    <BUITooltip.Trigger render={children}/>
    <BUITooltip.Portal>
      <BUITooltip.Positioner sideOffset={10}>
        <BUITooltip.Popup className="Tooltip">
          <BUITooltip.Arrow className="Arrow"><PopupArrow /></BUITooltip.Arrow>
          {tooltip}
        </BUITooltip.Popup>
      </BUITooltip.Positioner>
    </BUITooltip.Portal>
  </BUITooltip.Root>
}

//*****************************************************************************
//
// Toolbar
//
//*****************************************************************************

export class ToolBox extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <HBox className={addClass("Toolbar", className)} {...props}/>
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

export function Button({tooltip, ...props}) {
  if(tooltip) {
    return <Tooltip tooltip={tooltip}>
      <BUIButton {...props}/>
    </Tooltip>
  }
  return <BUIButton {...props}/>
}

export function IconButton({ tooltip, className, ...props }) {
  const cl = addClass(className, "icon")
  if(tooltip) {
    return <Tooltip tooltip={tooltip}>
      <Button className={cl} {...props}/>
    </Tooltip>
  }
  return <Button className={cl} {...props}/>
}

export class MakeToggleGroup extends React.PureComponent {

  render() {
    const { buttons, choices, disabled, exclusive, selected, setSelected, ...props } = this.props

    if (!choices) return null;

    return <ToggleGroup
      {...props}
      className="HBox"
      value={[selected]}
      onValueChange={(value, e) => { setSelected(value[0]); }}
    >
      {choices.map(choice => this.constructor.makeButton(buttons, disabled, choice))}
    </ToggleGroup>
  }

  static makeButton(buttons, disabled, choice) {
    const isDisabled = disabled?.includes(choice) ?? false

    if (!(choice in buttons)) return <Toggle key={choice} className="toggle" disabled={isDisabled} value={choice}>{choice}</Toggle>

    const { icon } = buttons[choice]

    if (isDisabled) return <Toggle className="toggle icon" key={choice} disabled={isDisabled} value={choice}>{icon}</Toggle>

    const { tooltip } = buttons[choice]

    if(tooltip) {
      return <Tooltip key={choice} tooltip={tooltip}>
        <Toggle className="toggle icon" value={choice}>{icon}</Toggle>
      </Tooltip>
    }

    return <Toggle key={choice} className="toggle icon" disabled={isDisabled} value={choice}>{icon}</Toggle>
  }
}

//*****************************************************************************
//
// Menus
//
//*****************************************************************************

export { Menu }

export class MenuPopup extends React.PureComponent {
  render() {
    const { children, arrow, ...props } = this.props
    return <Menu.Positioner className="Positioner" sideOffset={3}>
      <Menu.Popup className="VBox Menu" {...props}>
        {arrow && <Menu.Arrow className="Arrow"><PopupArrow /></Menu.Arrow>}
        {children}
      </Menu.Popup>
    </Menu.Positioner>
  }
}

export function MenuItem({ title, endAdornment, children, ...props }) {
  return <Menu.Item className="Item" {...props}>
    {title}{children}<Filler />{endAdornment}
  </Menu.Item>
}

class PopupArrow extends React.PureComponent {
  render() {
    return <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="ArrowFill"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="ArrowOuterStroke"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="ArrowInnerStroke"
      />
    </svg>
  }
}

//-----------------------------------------------------------------------------

export function Radio({ style, choice, selected, setSelected }) {
  const props = {
    className: "RadioButton",
    fontSize: "small",
    style: { ...style },
    onClick: e => setSelected && setSelected(choice),
  }

  if (selected === choice) {
    return <Icon.RadioButton.Checked {...props} />
  }
  return <Icon.RadioButton.Unchecked {...props} />
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

export class Label extends React.PureComponent {
  render() {
    const { text, children, ...props } = this.props

    return <span {...props}>{text}{children}</span>
  }
}

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
