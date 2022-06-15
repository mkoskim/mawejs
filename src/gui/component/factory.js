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

import isHotkey from 'is-hotkey';
import { useSnackbar } from 'notistack';
import { useEffect } from "react";

export {default as InfiniteScroll} from "react-infinite-scroll-component";

const {
  Button: XButton, Input: XInput, Tooltip: XTooltip,
  IconButton: XIconButton,
  ButtonGroup: XButtonGroup,
  Breadcrumbs: XBreadcrumbs,
} = require("@material-ui/core")

//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

//console.log("Icons", require("@material-ui/icons/"))

export const Icon = {
  Close: require("@material-ui/icons/").Close,
  Search: require("@material-ui/icons/").Search,

  //Menu: require("@material-ui/icons/Menu"),
  Star: require("@material-ui/icons/").StarOutlineOutlined,
  CreateFolder: require("@material-ui/icons/").CreateNewFolderOutlined,

  FileType: {
    File: require("@material-ui/icons/").InsertDriveFileOutlined,
    //import TypeFile from '@material-ui/icons/Description';
    Folder: require("@material-ui/icons/").Folder,
    Unknown: require("@material-ui/icons/").BrokenImageOutlined,
    //import TypeUnknown from '@material-ui/icons/Close';
    //import TypeUnknown from '@material-ui/icons/Help';
    //import TypeUnknown from '@material-ui/icons/BrokenImage';
    //import TypeUnknown from '@material-ui/icons/CancelPresentationOutlined';
  }
}

//-----------------------------------------------------------------------------
// Manipulate <style> elements in document <head>
//-----------------------------------------------------------------------------

export function HeadStyle(id) {
  function byid(id) { return document.head.querySelector(`style#${id}`) }
  function create(id) {
    const style = document.createElement("style")
    style.setAttribute("id", id);
    document.head.appendChild(style);
    return style;
  }
  return {
    style: byid(id) ? byid(id) : create(id),
    set: function(...lines) {
      this.style.textContent = lines.join("\n");
    }
  }
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

export function VBox({className, style, ...props}) {
  return <FlexBox
    className={addClass(className, "VBox")}
    style={{flexDirection: "column", ...style}}
    {...props}
  />
}

export function HBox({className, style, ...props}) {
  return <FlexBox
    className={addClass(className, "HBox")}
    style={{flexDirection: "row", ...style}}
    {...props}
  />
}

export function Filler({weight = 1, style, ...props}) {
  return <div style={{flexGrow: weight, ...style}} {...props}/>
}

export function Separator({className, ...props}) {
  return <div className={addClass(className, "Separator")} {...props}/>;
}

/*
HeadStyle("Separator").set(
  ".HBox > .Separator { height: 100%; border-right: 1pt solid lightgrey; }",
  ".VBox > .Separator { width:  100%; border-bottom: 1pt solid lightgrey; }",
);
*/

//-----------------------------------------------------------------------------

export function ToolBox({style, ...props}) {
  return <HBox style={{
    paddingLeft: 4, paddingRight: 4,
    paddingTop: 2, paddingBottom: 2,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    borderBottom: "1pt solid lightgray",
    ...style}}
    {...props}
  />
}

export function ButtonGroup(props) {
  return <XButtonGroup {...props} />
}

//-----------------------------------------------------------------------------

export function Label({style, ...props}) {
  return <div display="span" style={style} {...props}/>
}

export function Button({tooltip, style, ...props}) {
  const button = <XButton
    style={{minWidth: 32, textTransform: "none", ...style}}
    {...props}
  />

  return tooltip ? <XTooltip title={tooltip}>{button}</XTooltip> : button;
}

export function Input({style, ...props}) {
  return <XInput
    disableUnderline={true}
    style={{
      margin: 0, //marginLeft: 4,
      padding: 0, paddingLeft: 8,
      border: "1px solid lightgrey",
      borderRadius: 4,
      backgroundColor: "white",
      ...style,
    }}
    {...props}
  />
}

export function SearchBox({onCancel, ...props})
{
  return <Input
    placeholder="Search"
    startAdornment={<Icon.Search fontSize="small" style={{color: "gray", marginRight: 4}}/>}
    endAdornment={
      <XIconButton
        onClick={onCancel}
        size="small"
        style={{fontSize: "inherit", marginRight: 2}}
        >
        <Icon.Close fontSize="inherit"/>
      </XIconButton>
    }
    {...props}
  />
}

//-----------------------------------------------------------------------------
// Inform user about things that are happening or happened.
//-----------------------------------------------------------------------------

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
