//*****************************************************************************
//*****************************************************************************
//
// Collections of components to help building other
//
//*****************************************************************************
//*****************************************************************************

const {
  Button: MuiButton,
  Input: MuiInput,
  Box: MuiBox,
  ButtonGroup: MuiButtonGroup,
} = require("@material-ui/core")


//-----------------------------------------------------------------------------

export function FlexBox({style, children}) {
  return <div style={{display: "flex", ...style}}>{children}</div>;
}

export function VBox({style, children}) {
  return <FlexBox style={{flexDirection: "column", ...style}}>{children}</FlexBox>
}

export function HBox({style, children}) {
  return <FlexBox style={{flexDirection: "row", ...style}}>{children}</FlexBox>
}

export function ToolBox({children}) {
  const style={
    padding: 4,
    backgroundColor: "#F8F8F8",
    borderBottom: "1px solid #D8D8D8",
    alignItems: "center",
  }
  return <HBox style={style}>{children}</HBox>
}

export function Filler() {
  return <MuiBox flexGrow={1}/>
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
