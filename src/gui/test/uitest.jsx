//*****************************************************************************
//
// Bar chart from word count info
//
//*****************************************************************************

import {
  VBox, HBox, Filler,
  Separator,
  Button, IconButton, Icon,
  Input, OutlinedInput,
  ToolBox,
  Menu, Submenu, MenuItem,
  Outlined,
} from "../common/factory"

const toolbarStyle = {
  //background: "#F0F0FF",
  borderTop: "1px solid gray",
  borderBottom: "1px solid gray",
}

export function UITestView({doc, updateDoc}) {
  return <VBox>
    {/*<MenuTest/>*/}
    <HBox>HBox/Default: <Buttons/><Inputs/><Padder/></HBox>
    <Separator/>
    <ToolBox style={toolbarStyle}>Toolbar: <Buttons/><Inputs/><Padder/></ToolBox>
    <Separator/>
    <HBox className="Panel">HBox/Panel: <Buttons/><Inputs/><Padder/></HBox>
    <Separator/>
    <HBox>
      <VBox>VBox/Default: <Buttons/><Inputs/></VBox>
      <Separator/>
      <VBox className="Panel">VBox/Panel: <Buttons/><Inputs/></VBox>
      <Padder/>
    </HBox>
  </VBox>
}

function Buttons() {
  return <>
    <Separator/>
    <IconButton tooltip="Button"><Icon.Help/></IconButton>
    <IconButton tooltip="Button" className="error"><Icon.Help/></IconButton>
    <IconButton tooltip="Button" className="success"><Icon.Help/></IconButton>
    <Separator/>
    <Button tooltip="Button">Button</Button>
    <Button tooltip="Button" className="error">Button</Button>
    <Button tooltip="Button" className="success">Button</Button>
    <Separator/>
    <Button className="Outlined" label="Example" tooltip="Button">Button</Button>
    <Button className="Outlined error" label="Example" tooltip="Button">Button</Button>
    <Button className="Outlined success" label="Example" tooltip="Button">Button</Button>
  </>
}

function Inputs() {
  return  <>
    <Separator/>
    Plain: <Input value="Some text..."/>
    Outlined: <OutlinedInput label="Example" value="Some text..."/>
  </>
}

function MenuTest() {
  return <HBox>
    <TestMenu1/>
  </HBox>
}

function TestMenu1() {
  const trigger = <Button>Menu</Button>

  return <Menu trigger={trigger}>
    <MenuItem title="New" endAdornment="Ctrl-N"/>
    <MenuItem title="Open" endAdornment="Ctrl-O"/>
    <Submenu trigger={<MenuItem title="Open Recent..." endIcon={<Icon.Arrow.Head.Right/>}/>}>
      <MenuItem title="Test"/>
    </Submenu>
    <Separator />
    <MenuItem title="Import File..."/>
    <MenuItem title="Import From Clipboard"/>
    <Separator />
    <MenuItem
      title="Save" endAdornment="Ctrl-S" disabled={true}/>
    <MenuItem title="Save as..." disabled={true}/>
    <MenuItem title="Rename..." disabled={true}/>
    <MenuItem title="Close" endAdornment="Ctrl-W" disabled={true}/>
    <Separator />
    <MenuItem title="Quit"/>
  </Menu>
}

function Padder() {
  return <>
    <Separator/>
    <Filler className="debug"/>
  </>
}