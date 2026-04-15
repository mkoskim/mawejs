//*****************************************************************************
//*****************************************************************************
//
// Collections of components to help building other
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useDeferredValue,
} from "react"

import { Icon } from "./icons"
import { IsKey, addHotkeys } from "./hotkeys"
import { enqueueSnackbar, closeSnackbar } from "notistack";
import { isNotEmpty } from "../../util";

import {
  //Button as BUIButton,
  //Toggle as BUIToggle,
  //Input,
  Menu as BUIMenu,
  Popover as BUIPopover,
  Dialog as BUIDialog,
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

//-----------------------------------------------------------------------------
// Base-UI components eat extra attributes, so this converts them to class names
//-----------------------------------------------------------------------------

function attribute2class(attrs) {
  return Object.entries(attrs).map(([key, value]) => key + "-" + value)
}

//*****************************************************************************
//
// Boxes
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Nice guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
//-----------------------------------------------------------------------------

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
    const { className, weight = 1, ...props } = this.props
    return <div className={addClass("Filler", className)} weight={weight} {...props} />
  }
}

export class VFiller extends React.PureComponent {
  render() {
    const { className, weight = 1, ...props } = this.props
    return <div className={addClass("VBox Filler", className)} weight={weight} {...props} />
  }
}

export class HFiller extends React.PureComponent {
  render() {
    const { className, weight, ...props } = this.props
    return <div className={addClass("HBox Filler", className)} weight={weight} {...props} />
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
// Tooltip wrapper
//
//*****************************************************************************

export function Tooltip({tooltip, children}) {
  if(!tooltip) return children
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
// Buttons
//
//*****************************************************************************

export function Button({tooltip, ...props}) {
  return <Tooltip tooltip={tooltip}>
    <button {...props}/>
  </Tooltip>
}

export function IconButton({ tooltip, className, ...props }) {
  const cl = addClass(className, "icon")
  return <Tooltip tooltip={tooltip}>
    <button className={cl} {...props}/>
  </Tooltip>
}

function ToggleButton({tooltip, checked, className, ...props}) {
  const cl = addClass(className, checked && "checked")
  return <Tooltip tooltip={tooltip}>
    <button className={cl} {...props}/>
  </Tooltip>
}

//*****************************************************************************
//
// Toggle group
//
//*****************************************************************************

const separators = {
  "|": true,
  "---": true,
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
    const isChecked  = multiple ? selected.includes(choice) : selected === choice

    //console.log("choice:", choice, "pressed:", isPressed)

    const { icon, tooltip, text } = buttons[choice] ?? {text: choice}

    return <ToggleButton
      key={choice}
      className={!text && "icon"}
      tooltip={tooltip}
      disabled={isDisabled}
      //value={choice}
      checked={isChecked}
      onClick={e => this.onTogglePress(choice)}
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

    return <Menu nativeButton={as !== "text"} trigger={this.makeTrigger()}>
      {choices.map((choice, index) => this.makeSelection(choice, index))}
    </Menu>
  }

  makeTrigger() {
    const {as, label, selections, selected} = this.props
    const {name} = (selected in selections) ? selections[selected] : {name: selected}

    switch(as) {
      case "text": return <div className="HBox" variant="outlined" label={label}>
        <span style={{cursor: "default"}}>{name}</span><Filler/><Icon.DropDown/>
      </div>
    }

    return <Button tooltip={label}>{name}<Icon.DropDown/></Button>
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

export class Input extends React.PureComponent {
  render() {
    const {label, placeholder, variant, color, inputref, spellCheck=false, ...rest} = this.props;
    const props = {
      ...rest,
      spellCheck,
      placeholder: placeholder ?? label,
    }
    const wrapprops = {
      label,
      variant,
      color,
    }

    if(label) {
      return <div className="InputWrap" {...wrapprops}><input ref={inputref} {...props}/></div>
    }
    return <input ref={inputref} {...wrapprops} {...props}/>
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
// Containers: Toolbar, Popups, Menus, ...
//
//*****************************************************************************

export class ToolBox extends React.PureComponent {
  render() {
    const {className, ...props} = this.props
    return <HBox className={addClass("Toolbar", className)} {...props}/>
  }
}

class PopupArrow extends React.PureComponent {
  render() {
    return <svg width="20" height="10" viewBox="0 0 20 10">
      <path
        className="ArrowFill"
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
      />
      <path
        className="ArrowBorder"
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
      />
    </svg>
  }
}

export class Popup extends React.PureComponent {
  render() {
    const {trigger, nativeButton, children} = this.props

    return <BUIPopover.Root>
      <BUIPopover.Trigger nativeButton={nativeButton} render={trigger}/>
      <BUIPopover.Portal>
        <BUIPopover.Positioner className="Positioner" sideOffset={3} align="start">
          <BUIPopover.Popup className="VBox Popup">
            <BUIPopover.Arrow className="Arrow"><PopupArrow/></BUIPopover.Arrow>
            {children}
          </BUIPopover.Popup>
        </BUIPopover.Positioner>
      </BUIPopover.Portal>
    </BUIPopover.Root>
  }
}

export class Menu extends React.PureComponent {
  render() {
    const {trigger, nativeButton, arrow=true, className, children, ...props} = this.props;

    return <BUIMenu.Root>
      <BUIMenu.Trigger nativeButton={nativeButton} render={trigger}/>
      <BUIMenu.Portal>
        <BUIMenu.Positioner className="Positioner" align="start" sideOffset={3}>
          <BUIMenu.Popup className={addClass("VBox Menu", className)} {...props}>
            {arrow && <BUIMenu.Arrow className="Arrow"><PopupArrow /></BUIMenu.Arrow>}
            {children}
          </BUIMenu.Popup>
        </BUIMenu.Positioner>
      </BUIMenu.Portal>
    </BUIMenu.Root>
  }
}

export class Submenu extends React.PureComponent {
  render() {
    const {trigger, nativeButton, arrow=false, className, children, ...props} = this.props;

    return <BUIMenu.SubmenuRoot>
      <BUIMenu.SubmenuTrigger nativeButton={nativeButton} render={trigger}/>
      <BUIMenu.Portal>
        <BUIMenu.Positioner className="Positioner" align="start" sideOffset={3}>
          <BUIMenu.Popup className={addClass("VBox Menu", className)} {...props}>
            {/*arrow && <BUIMenu.Arrow className="Arrow"><PopupArrow /></BUIMenu.Arrow>*/}
            {children}
          </BUIMenu.Popup>
        </BUIMenu.Positioner>
      </BUIMenu.Portal>
    </BUIMenu.SubmenuRoot>
  }
}

export function MenuItem({ title, startIcon, endAdornment, endIcon, className, children, ...props }) {
  return <BUIMenu.Item className={addClass("Item", className)} {...props}>
    <span className="startIcon">{startIcon}</span>
    {title}{children}<Filler />
    <span className="endAdornment">{endAdornment}</span>
    <span className="endIcon">{endIcon}</span>
  </BUIMenu.Item>
}

//*****************************************************************************
//
// Dialogs
//
//*****************************************************************************

export function Dialog({children, size, className = "Dialog", ...props}) {
  const cl = addClass("VBox", className, attribute2class({size}))
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
