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
  Menu, MenuPopup, MenuItem,
  DialogActions,
} from "../common/factory"

export function UITestView({doc, updateDoc}) {
  return <VBox>
    <ToolBox side="top">Toolbar: <Buttons/><Inputs/><Padder/></ToolBox>
    <HBox>HBox: <Buttons/><Inputs/><Padder/></HBox>
    <DialogActions>Dialog actions: <Buttons/><Inputs/></DialogActions>
    <Separator/>
    <MenuTest/>
    <Separator/>
    <HBox>
      <VBox>VBox: <Buttons/></VBox>
      <Separator/>
      <Separator/>
      <Padder/>
    </HBox>
  </VBox>
}

function Buttons() {
  return <>
    <Separator/>
    <IconButton><Icon.Help/></IconButton>
    <IconButton style={{color: "red"}}><Icon.Help/></IconButton>
    <IconButton style={{color: "green"}}><Icon.Help/></IconButton>
    <Separator/>
    <Button>Button</Button>
    <Button style={{color: "red"}}>Button</Button>
    <Button style={{color: "green"}}>Button</Button>
  </>
}

function Inputs() {
  return  <>
    <Separator/>
    <Input/>
  </>
}

function MenuTest() {
  return <HBox>
    <TestMenu1/>
  </HBox>
}

function TestMenu1() {
  return <Menu.Root>
    <Menu.Trigger>Menu</Menu.Trigger>
    <Menu.Portal>
      <MenuPopup>
        <MenuItem title="New" endAdornment="Ctrl-N"/>
        <MenuItem title="Open" endAdornment="Ctrl-O"/>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger render={<MenuItem title="Open Recent..." endIcon={<Icon.Arrow.Head.Right/>}/>}/>
          <Menu.Portal>
            <MenuPopup arrow={false}>
              <MenuItem title="Test"/>
            </MenuPopup>
          </Menu.Portal>
        </Menu.SubmenuRoot>
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
      </MenuPopup>
    </Menu.Portal>
  </Menu.Root>
}

function Padder() {
  return <Filler style={{background: "magenta"}}/>
}