//*****************************************************************************
//*****************************************************************************
//
// Collections of components to help building other
//
//*****************************************************************************
//*****************************************************************************

import "./factory.css"

/* eslint-disable no-unused-vars */

const {
  Button: MuiButton,
  Input: MuiInput,
  //Box: MuiBox,
  ButtonGroup: MuiButtonGroup,
} = require("@material-ui/core")

//-----------------------------------------------------------------------------
// Manipulate <style> elements in document <head>
//-----------------------------------------------------------------------------

export function HeadStyle(name) {
  function byid(name) { return document.head.querySelector(`style#${name}`) }
  function create(name) {
    const style = document.createElement("style")
    style.setAttribute("id", name);
    document.head.appendChild(style);
    return style;  
  }
  return {
    style: byid(name) ? byid(name) : create(name),
    set: function(...lines) {
      this.style.textContent = lines.join("\n");
    }
  }
}

//-----------------------------------------------------------------------------
// Nice guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
//-----------------------------------------------------------------------------

export function FlexBox({className, style, children}) {
  return <div className={className} style={{display: "flex", ...style}}>{children}</div>;
}

export function VBox({style, children}) {
  return <FlexBox className="VBox" style={{flexDirection: "column", ...style}}>{children}</FlexBox>
}

export function HBox({style, children}) {
  return <FlexBox className="HBox" style={{flexDirection: "row", ...style}}>{children}</FlexBox>
}

export function Filler() {
  return <div style={{flexGrow: 1}}/>
}

export function Separator({style}) {
  return <div className="Separator" style={style}/>;
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
