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

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";

import {
  Button as XButton, ButtonGroup,
  Breadcrumbs,
  InputGroup,
  Icon, IconSize,
  Divider,
} from "@blueprintjs/core"

import {
  Classes,
  Popover2 as Popover,
  Tooltip2 as Tooltip
} from "@blueprintjs/popover2"

export {default as InfiniteScroll} from "react-infinite-scroll-component";
export {Breadcrumbs}
export {Icon, IconSize}

//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

//const Icons = require("@mui/icons-material/")
//console.log("Icons", require("@material-ui/icons/"))

export const Icons = {
  Close: "cross",
  Search: "search",

  Star: "star-empty",
  Starred: "star",

  CreateFolder: "folder-new",

  FileType: {
    File: "document",
    //import TypeFile from '@material-ui/icons/Description';
    Folder: "folder-close",
    //Unknown: "lock",
    //Unknown: "error",
    Unknown: "warning-sign",
    //import TypeUnknown from '@material-ui/icons/Close';
    //import TypeUnknown from '@material-ui/icons/Help';
    //import TypeUnknown from '@material-ui/icons/BrokenImage';
    //import TypeUnknown from '@material-ui/icons/CancelPresentationOutlined';
  },

  Location: {
    Home: "home",
  },
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

export function Filler({weight = 1, style, ...props}) {
  return <div style={{flexGrow: weight, ...style}} {...props}/>
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
export function Separator({className, ...props}) {
  return <div className={addClass(className, "Separator")} {...props}/>;
}
/*/
export {Divider as Separator}
/**/

/*
HeadStyle("Separator").set(
  ".HBox > .Separator { height: 100%; border-right: 1pt solid lightgrey; }",
  ".VBox > .Separator { width:  100%; border-bottom: 1pt solid lightgrey; }",
);
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

export {ButtonGroup}
/*
export function ButtonGroup(props) {
  return <XButtonGroup {...props} />
}
*/

/*
export {Button}
/*/
export function Button({tooltip, style, ...props}) {
  const button = <XButton
    style={{...style}}
    {...props}
  />

  return tooltip ? <Tooltip content={tooltip}>{button}</Tooltip> : button;
}
/**/

//-----------------------------------------------------------------------------

export function Label({style, ...props}) {
  return <div display="span" style={style} {...props}/>
}

export function Input({style, ...props}) {
  return <InputGroup {...props}/>
}

export function SearchBox({onCancel, ...props})
{
  return <InputGroup
    leftElement={<Icon icon="search"/>}
    {...props}
  />
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
