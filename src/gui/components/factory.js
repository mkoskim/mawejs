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

import CloseIcon from '@material-ui/icons/Close' 
import MenuIcon from '@material-ui/icons/Menu';
import FolderIcon from '@material-ui/icons/Folder';
import FileIcon from '@material-ui/icons/Description';
import StarIcon from '@material-ui/icons/StarOutline';
import HomeIcon from  '@material-ui/icons/Home';
import SearchIcon from  '@material-ui/icons/Search';
import BlockIcon from '@material-ui/icons/Block';
import WarnIcon from '@material-ui/icons/Warning';
import OpenFolderIcon from '@material-ui/icons/FolderOpenOutlined';
import IconAdd from '@material-ui/icons/AddCircleOutline';
import TrashIcon from '@material-ui/icons/DeleteOutline';

import TypeFolder from '@material-ui/icons/Folder';
import TypeFile from '@material-ui/icons/DescriptionOutlined';
//import TypeUnknown from '@material-ui/icons/Close';
//import TypeUnknown from '@material-ui/icons/Help';
import TypeUnknown from '@material-ui/icons/BrokenImageOutlined';
//import TypeUnknown from '@material-ui/icons/BrokenImage';
//import TypeUnknown from '@material-ui/icons/CancelPresentationOutlined';

//-----------------------------------------------------------------------------

import isHotkey from 'is-hotkey';
import { useSnackbar } from 'notistack';
import { useEffect } from "react";

const {
  Button: MuiButton,
  Input: MuiInput, InputAdornment,
  IconButton: MuiIconButton,
  //Box: MuiBox,
  ButtonGroup: MuiButtonGroup,
} = require("@material-ui/core")

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

function addClass(...classNames) {
  return classNames.join(" ");
}

//-----------------------------------------------------------------------------
// Nice guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
//-----------------------------------------------------------------------------

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

export function ToolBox({children}) {
  const style={
    padding: 4,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    borderBottom: "1pt solid lightgray",
  }
  return <HBox style={style}>{children}</HBox>
}

//-----------------------------------------------------------------------------

export function Button(props) {
  //console.log(className)
  return <MuiButton
    {...props}
    style={{minWidth: 32, textTransform: "none", ...props.style}}
    >
      {props.children}
    </MuiButton>
}

export function Input(props) {
  return (
    <MuiInput
    {...props}
    disableUnderline={true}
    style={{
      margin:0, marginLeft: 4, 
      padding: 0, paddingLeft: 8,
      border: "1px solid lightgrey",
      borderRadius: 4,
      backgroundColor: "white",
      ...props.style,
    }}
    />
  )
}

export function SearchBox(props)
{
  function onKeyDown(e) {
    //console.log(event.key);
    if(isHotkey("escape", e) && props.onCancel) {
      console.log("Cancel")
      props.onCancel();
      e.preventDefault();
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return <Input
    {...props}
    placeholder="Search"
    style={{marginLeft: 8, marginRight: 8}}
    startAdornment={<SearchIcon fontSize="small" style={{color: "gray", marginRight: 4}}/>}
    endAdornment={
      <MuiIconButton
        onClick={props.onCancel}
        size="small"
        style={{fontSize: "12pt", marginLeft: 2, marginRight: 2}}
        >
        <CloseIcon fontSize="inherit"/>
      </MuiIconButton>
    }
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
