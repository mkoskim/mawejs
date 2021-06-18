//*****************************************************************************
//*****************************************************************************
//
// Collections of components to help building other
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

const {
  Button: MuiButton,
  Input: MuiInput,
  //Box: MuiBox,
  ButtonGroup: MuiButtonGroup,
} = require("@material-ui/core")

//-----------------------------------------------------------------------------

export function injectStyle(...lines) {
  var style = document.createElement("style");
  style.textContent = lines.join("\n")
  document.head.appendChild(style);
}

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
  return <FlexBox style={{flexGrow: 1}}/>
}

export function Separator({style}) {
  return <div className="Separator" style={style}/>;
}

injectStyle(
  ".Separator { margin: 2pt; }",
  ".HBox > .Separator { height: 100%; border-right: 1pt solid lightgrey; }",
  ".VBox > .Separator { width:  100%; border-bottom: 1pt solid lightgrey; }",
);
  
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
