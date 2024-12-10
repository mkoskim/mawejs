//*****************************************************************************
//
// Tool buttons
//
//*****************************************************************************

import React, {
  useCallback,
} from 'react';

import {
  Editor,
  Transforms,
} from 'slate'

import { ReactEditor } from 'slate-react'

import {
  paragraphTypes,
} from '../../document/elements';

import { setMark } from './slateMarks';

import {
  toggleFold, foldAll,
} from "./slateFolding"

import {
  MakeToggleGroup, Button, Icon, IconButton,
  Menu, MenuItem,
  ListItemIcon, ListItemText, Typography,
  Separator,
} from '../common/factory';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

//-----------------------------------------------------------------------------

class CharStyleButtons extends React.PureComponent {

  static buttons = {
    "bold": {
      tooltip: "Bold (Ctrl-B)",
      icon: <Icon.Style.Bold />
    },
    "italic": {
      tooltip: "Italic (Ctrl-I)",
      icon: <Icon.Style.Italic />,
    },
  }

  static choices = ["bold", "italic"]

  render() {
    const {bold, italic, setSelected} = this.props

    const active = [
      bold ? "bold" : "",
      italic ? "italic" : ""
    ].filter(s => s)
    //const active = Object.entries(marks).filter(([k, v]) => v).map(([k, v]) => k)

    return <MakeToggleGroup
      buttons={this.constructor.buttons}
      choices={this.constructor.choices}
      selected={active}
      setSelected={setSelected}
      exclusive={false}
    />
  }
}

//-----------------------------------------------------------------------------

class ParagraphStyleSelect extends React.PureComponent {

  static order = ["p", "hact", "hchapter", "hscene", "hsynopsis", "hnotes", "bookmark", "comment", "missing", "fill", "tags"]

  render() {
    const {type, setSelected} = this.props;
    //const type = node?.type ?? undefined

    //console.log("Block type:", type)

    const choices = paragraphTypes
    const order   = this.constructor.order
    const name = type in choices ? choices[type].name : "Text"

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button tooltip="Paragraph style" style={{width: 100, justifyContent: "flex-start"}} {...bindTrigger(popupState)}>{name}</Button>
        <Menu {...bindMenu(popupState)}>
          {order.map(k => [k, choices[k]]).map(([k, v]) => (
            <MenuItem key={k} value={k} onClick={e => {setSelected(k); popupState.close(e)}}>
              <ListItemIcon>{v.markup}</ListItemIcon>
              <ListItemText sx={{width: 100}}>{v.name}</ListItemText>
              <Typography sx={{ color: 'text.secondary' }}>{v.shortcut}</Typography>
              </MenuItem>
            )
          )}
        </Menu>
      </React.Fragment>
      }
    </PopupState>
  }
}

//-----------------------------------------------------------------------------

export class FoldButtons extends React.PureComponent {
  render() {
    const {editor, folded} = this.props

    function onFoldToggle(e) { toggleFold(editor); ReactEditor.focus(editor); }
    function onFoldAll(e) { foldAll(editor, true); ReactEditor.focus(editor);}
    function onUnfoldAll(e) { foldAll(editor, false); ReactEditor.focus(editor); }

    return <>
      <IconButton selected={folded} tooltip="Toggle fold (Alt-F)" onClick={onFoldToggle}><Icon.Style.Folded/></IconButton>
      <IconButton tooltip="Fold all (Alt-A)" onClick={onFoldAll}><Icon.Style.FoldAll/></IconButton>
      <IconButton tooltip="Unfold all (Alt-S)" onClick={onUnfoldAll}><Icon.Style.UnfoldAll/></IconButton>
      </>
  }
}

//-----------------------------------------------------------------------------

export function EditButtons({editor, track}) {
  //console.log("Track:", track)

  const type = track?.node?.type
  const {bold, italic} = track?.marks ?? {}

  const applyStyle = useCallback(type => {
    Transforms.setNodes(editor, {type})
    ReactEditor.focus(editor)
  }, [editor])

  const applyMarks = useCallback(marks => {
    const current = Object.keys(Editor.marks(editor))
    for(const key of current) {
      if(!marks.includes(key)) setMark(editor, key, false)
    }
    for(const key of marks) {
      if(!current.includes(key)) setMark(editor, key, true)
    }
    ReactEditor.focus(editor)
  }, [editor])

  return <>
    <ParagraphStyleSelect type={type} setSelected={applyStyle}/>
    <Separator/>
    <CharStyleButtons bold={bold} italic={italic} setSelected={applyMarks}/>
  </>
}
