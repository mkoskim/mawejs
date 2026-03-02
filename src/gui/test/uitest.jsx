//*****************************************************************************
//
// Bar chart from word count info
//
//*****************************************************************************

import {
  VBox, HBox, Filler,
  Separator,
  Button, IconButton, Icon,
  Input,
  ToolBox,
  Menu, Submenu, MenuItem,
} from "../common/factory"

const toolbarStyle = {
  //background: "#F0F0FF",
  borderTop: "1px solid gray",
  borderBottom: "1px solid gray",
}

export function UITestView({doc, updateDoc}) {
  return <VBox>
    {/*<MenuTest/>*/}
    <HBox>HBox/Default: <Buttons/><Padder/></HBox>
    <Separator/>
    <ToolBox style={toolbarStyle}>Toolbar: <Buttons/><Padder/></ToolBox>
    <Separator/>
    <HBox className="Panel">HBox/Panel: <Buttons/><Padder/></HBox>
    <Separator/>
    <HBox>
      <VBox>VBox/Default: <Buttons/></VBox>
      <Separator/>
      <VBox className="Panel">VBox/Panel: <Buttons/></VBox>
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
    <Button tooltip="Button" color="error">Button</Button>
    <Button tooltip="Button" color="success">Button</Button>
    <Input value="Some text..." onChange={e => e}/>
    <Separator/>
    <Button variant="filled"                 label="Example" tooltip="Button">Button</Button>
    <Button variant="filled" color="error"   label="Example" tooltip="Button">Button</Button>
    <Button variant="filled" color="success" label="Example" tooltip="Button">Button</Button>
    <Input variant="outlined" label="Example" value="Some text..." onChange={e => e}/>
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