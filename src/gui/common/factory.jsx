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
  Toggle as BUIToggle,
  Tooltip as BUITooltip,
  Popover,
  Input,
  Dialog as BUIDialog,
} from "@base-ui/react"

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export { default as InfiniteScroll } from "react-infinite-scroll-component";

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
// Buttons
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

//*****************************************************************************
//
// Separators for groups
//
//*****************************************************************************

const separators = {
  "|": true,
  "---": true,
}

//*****************************************************************************
//
// Toggle group
//
//*****************************************************************************

function ToggleButton({tooltip, pressed, className, ...props}) {
  const cl = addClass(className, "toggle")
  if(tooltip) {
    return <Tooltip tooltip={tooltip}>
      <BUIToggle className={cl} pressed={pressed} {...props}/>
    </Tooltip>
  }
  return <BUIToggle className={cl} pressed={pressed} {...props}/>
}

export class MakeToggleGroup extends React.PureComponent {

  render() {
    const {choices} = this.props

    if (!choices) return null;

    //console.log("Selected:", selected)

    return choices.map((choice, index) => this.makeButton(choice, index))
  }

  makeButton(choice, index) {
    if(choice in separators) return <Separator key={index}/>

    const {multiple, buttons, disabled, selected} = this.props

    const isDisabled = disabled?.includes(choice) ?? false
    const isPressed  = multiple ? selected.includes(choice) : selected === choice

    //console.log("choice:", choice, "pressed:", isPressed)

    const { icon, tooltip, text } = buttons[choice] ?? {text: choice}

    return <ToggleButton
      key={choice}
      className="icon"
      tooltip={tooltip}
      disabled={isDisabled}
      //value={choice}
      pressed={isPressed}
      onPressedChange={(value, e) => this.onTogglePress(choice)}
    >
      {icon}{text}
    </ToggleButton>
  }

  onTogglePress(choice) {
    const {multiple, selected, setSelected} = this.props
    //console.log("onTogglePress:", choice, value)
    if(multiple) {
      if(selected.includes(choice)) {
        setSelected(selected.filter(e => e !== choice))
      } else {
        setSelected(selected.concat([choice]))
      }
    } else {
      if(selected !== choice) {
        setSelected(choice)
      }
    }
  }
}

//*****************************************************************************
//
// Dropdown selection
//
//*****************************************************************************

export class DropDown extends React.PureComponent {
  render() {
    const {choices, as} = this.props

    return <Menu.Root>
      <Menu.Trigger render={this.makeButtonTrigger()}/>
      <Menu.Portal>
        <MenuPopup>
          {choices.map((choice, index) => this.makeSelection(choice, index))}
        </MenuPopup>
      </Menu.Portal>
    </Menu.Root>
  }

  getTriggerProperties() {
    const {as, label, selections, selected} = this.props
    const {name} = (selected in selections) ? selections[selected] : {name: selected}
    switch(as) {
      case "text": return {
        className: "Outlined",
        label,
        name
      }
    }
    return {
      tooltip: label,
      name
    }
  }

  makeButtonTrigger() {
    const {name, ...props} = this.getTriggerProperties()
    return <Button {...props}>{name}<Icon.Arrow.DropDown/></Button>
  }

  makeSelection(choice, index) {
    if(choice in separators) return <Separator key={index}/>

    const {selections, selected, setSelected, afterSelect} = this.props

    if(!(choice in selections)) {
      return <MenuItem
        key={choice}
        title={choice}
        style={{color: "red"}}
        onClick={e => afterSelect && afterSelect(choice)}
      />
    }

    const {name, shortcut} = selections[choice]

    return <MenuItem
      key={choice}
      startIcon={selected === choice ? <Icon.Checked/> : undefined}
      title={name}
      endAdornment={shortcut}
      onClick={e => {setSelected(choice); afterSelect && afterSelect(choice)}}
    />
  }
}

//*****************************************************************************
//
// Input
//
//*****************************************************************************

export {Input}

// TODO: TextField --> InputField / OutlinedInput

export class TextField extends React.PureComponent {
  render() {
    const {label, startAdornment, endAdornment, ...props} = this.props
    return <Outlined label={label}>
      {startAdornment}
      <Input spellCheck={false} {...props}/>
      {endAdornment}
    </Outlined>
  }
}

export class OutlinedText extends React.PureComponent {
  render() {
    const {label, startAdornment, endAdornment, text} = this.props
    return <Outlined label={label}>
      {startAdornment}
      {text}
      <Filler/>
      {endAdornment}
    </Outlined>
  }
}

export class Outlined extends React.PureComponent {
  render() {
    const {label, ...props} = this.props
    return <HBox className="Outlined" label={label} {...props}/>
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
// Containers: Toolbar
//
//*****************************************************************************

export class ToolBox extends React.PureComponent {
  render() {
    const {className, side, ...props} = this.props
    return <HBox side={side} className={addClass("Toolbar", className)} {...props}/>
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
// Containers: Accordion
//
//*****************************************************************************

export function Accordion({ children }) {
  return children
}

export function AccordionDetails({ children }) {
  return children
}

export function AccordionSummary({ children }) {
  return children
}

//*****************************************************************************
//
// Popovers
//
//*****************************************************************************

export {Popover}

export class PopoverPopup extends React.PureComponent {
  render() {
    const {children} = this.props
    return <Popover.Portal>
      <Popover.Positioner className="Positioner" sideOffset={3} align="start">
        <Popover.Popup className="VBox Popup">
          <Popover.Arrow className="Arrow"><PopupArrow/></Popover.Arrow>
          {children}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  }
}

class PopupArrow extends React.PureComponent {
  render() {
    return <svg width="20" height="10" viewBox="0 0 20 10">
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

//*****************************************************************************
//
// Menus
//
//*****************************************************************************

export { Menu }

export class MenuPopup extends React.PureComponent {
  render() {
    const { children, arrow = true, ...props } = this.props
    return <Menu.Positioner className="Positioner" align="start" sideOffset={3}>
      <Menu.Popup className="VBox Menu" {...props}>
        {arrow && <Menu.Arrow className="Arrow"><PopupArrow /></Menu.Arrow>}
        {children}
      </Menu.Popup>
    </Menu.Positioner>
  }
}

export function MenuItem({ title, startIcon, endAdornment, endIcon, children, ...props }) {
  return <Menu.Item className="Item" {...props}>
    <span className="startIcon">{startIcon}</span>
    {title}{children}<Filler />
    <span className="endAdornment">{endAdornment}</span>
    <span className="endIcon">{endIcon}</span>
  </Menu.Item>
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
      <BUITooltip.Positioner sideOffset={8}>
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
// Dialogs
//
//*****************************************************************************

export function Dialog({children, className = "Dialog", ...props}) {
  const cl = addClass("VBox", className)
  return <BUIDialog.Root {...props}>
    <BUIDialog.Portal>
      <BUIDialog.Backdrop className="Backdrop"/>
      <BUIDialog.Viewport>
        <BUIDialog.Popup className={cl}>
          {children}
        </BUIDialog.Popup>
      </BUIDialog.Viewport>
    </BUIDialog.Portal>
  </BUIDialog.Root>
}

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

export function Snackbar({ children }) {
  return null;
}
