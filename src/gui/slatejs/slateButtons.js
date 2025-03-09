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
  removeMark,
  Transforms,
} from 'slate'

import { ReactEditor } from 'slate-react'

import {
  paragraphTypes,
} from '../../document/elements';

import { setMark } from './slateMarks';

import {
  toggleFold, foldAll,
  foldByType,
  FOLD,
} from "./slateFolding"

import {
  MakeToggleGroup, Button, Icon, IconButton,
  Menu, MenuItem,
  ListItemIcon, ListItemText, Typography,
  Separator,
} from '../common/factory';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

//*****************************************************************************
//
// Character style buttons
//
//*****************************************************************************

function applyMarks(editor, marks) {
  const current = Object.keys(Editor.marks(editor))
  for(const key of current) {
    if(!marks.includes(key)) removeMark(editor, key)
  }
  for(const key of marks) {
    if(!current.includes(key)) setMark(editor, key, true)
  }
  ReactEditor.focus(editor)
}

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
    const {editor, bold, italic} = this.props

    const active = [
      bold ? "bold" : "",
      italic ? "italic" : ""
    ].filter(s => s)
    //const active = Object.entries(marks).filter(([k, v]) => v).map(([k, v]) => k)

    return <MakeToggleGroup
      buttons={this.constructor.buttons}
      choices={this.constructor.choices}
      selected={active}
      setSelected={marks => applyMarks(editor, marks)}
      exclusive={false}
    />
  }
}

//*****************************************************************************
//
// Paragraph style buttons
//
//*****************************************************************************

function applyStyle(editor, type) {
  Transforms.setNodes(editor, {type})
  ReactEditor.focus(editor)
}

class ParagraphStyleSelect extends React.PureComponent {

  static order = ["p", "|", "hact", "hchapter", "|", "hscene", "hsynopsis", "hnotes", "|", "quote", "bookmark", "comment", "missing", "fill", "tags"]

  styleMenuItem(popupState, editor, type, style) {
    return (
      <MenuItem key={type} value={type} onClick={e => {applyStyle(editor, type); popupState.close(e)}}>
      <ListItemIcon>{style.markup}</ListItemIcon>
      <ListItemText sx={{width: 100}}>{style.name}</ListItemText>
      <Typography sx={{ color: 'text.secondary' }}>{style.shortcut}</Typography>
      </MenuItem>
    )
  }

  menuItem(popupState, editor, index, choices, type) {
    if(type in choices) return this.styleMenuItem(popupState, editor, type, choices[type]);
    if(type === "|") return <Separator key={index}/>
    return null;
  }

  render() {
    const {type, editor} = this.props;
    //const type = node?.type ?? undefined

    //console.log("Block type:", type)

    const choices = paragraphTypes
    const order = this.constructor.order
    const name  = type in choices ? choices[type].name : "Text"

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button tooltip="Paragraph style" style={{width: 100, justifyContent: "flex-start"}} {...bindTrigger(popupState)}>{name}</Button>
        <Menu {...bindMenu(popupState)}>
          {order.map((type, index) => this.menuItem(popupState, editor, index, choices, type))}
        </Menu>
      </React.Fragment>
      }
    </PopupState>
  }
}

//*****************************************************************************
//
// Style buttons
//
//*****************************************************************************

export class StyleButtons extends React.PureComponent {
  render() {
    const {editor, type, bold, italic} = this.props

    //console.log("Style:", type, bold, italic)
    return <>
      <ParagraphStyleSelect editor={editor} type={type}/>
      <Separator/>
      <CharStyleButtons editor={editor} bold={bold} italic={italic}/>
    </>
  }
}

//*****************************************************************************
//
// Folding buttons
//
//*****************************************************************************

export class FoldButtons extends React.PureComponent {

  render() {
    const {editor} = this.props

    function onFoldAll(e) { foldByType(editor, FOLD.foldAll); ReactEditor.focus(editor);}
    function onUnfoldAll(e) { foldByType(editor, FOLD.unfoldAll); ReactEditor.focus(editor); }

    function onFoldChapters(e) { foldByType(editor, FOLD.foldChapters); ReactEditor.focus(editor);}
    function onUnfoldChapters(e) { foldByType(editor, FOLD.unfoldChapters); ReactEditor.focus(editor);}

    function onUnfoldScenes(e) { foldByType(editor, FOLD.unfoldScenes); ReactEditor.focus(editor);}
    function onUnfoldSynopsis(e) { foldByType(editor, FOLD.unfoldSynopsis); ReactEditor.focus(editor);}

    return <PopupState variant="popover" popupId="file-menu">
      {(popupState) => <React.Fragment>
        <Button tooltip="Folding" {...bindTrigger(popupState)}>Fold</Button>
        <Menu {...bindMenu(popupState)}>

        {/* Folding */}
        <MenuItem onClick={e => {onFoldAll(e); popupState.close(e)}}>
          <ListItemText>Fold All</ListItemText>
          <Typography sx={{ color: 'text.secondary' }}>Alt-A</Typography>
          </MenuItem>

        <Separator/>
        <MenuItem onClick={e => {onFoldChapters(e); popupState.close(e)}}>
          <ListItemText>Fold Chapters</ListItemText>
          <Typography sx={{ color: 'text.secondary' }}></Typography>
          </MenuItem>
        <MenuItem onClick={e => {onUnfoldChapters(e); popupState.close(e)}}>
          <ListItemText>Unfold Chapters</ListItemText>
          <Typography sx={{ color: 'text.secondary' }}></Typography>
          </MenuItem>

        {/* Unfolding */}
        <Separator/>
        <MenuItem onClick={e => {onUnfoldSynopsis(e); popupState.close(e)}}>
          <ListItemText>Unfold Synopsis</ListItemText>
          <Typography sx={{ color: 'text.secondary' }}></Typography>
          </MenuItem>
        <MenuItem onClick={e => {onUnfoldScenes(e); popupState.close(e)}}>
          <ListItemText>Unfold Draft</ListItemText>
          <Typography sx={{ color: 'text.secondary' }}></Typography>
          </MenuItem>

        <Separator/>
          <MenuItem onClick={e => {onUnfoldAll(e); popupState.close(e)}}>
          <ListItemText>Unfold All</ListItemText>
          <Typography sx={{ color: 'text.secondary' }}>Alt-S</Typography>
          </MenuItem>

        </Menu>
      </React.Fragment>
      }
    </PopupState>

    /*
    function onFoldToggle(e) { toggleFold(editor); ReactEditor.focus(editor); }
    function onFoldAll(e) { foldAll(editor, true); ReactEditor.focus(editor);}
    function onUnfoldAll(e) { foldAll(editor, false); ReactEditor.focus(editor); }

    return <>
      <IconButton selected={folded} tooltip="Toggle fold (Alt-F)" onClick={onFoldToggle}><Icon.Style.Folded/></IconButton>
      <IconButton tooltip="Fold all (Alt-A)" onClick={onFoldAll}><Icon.Style.FoldAll/></IconButton>
      <IconButton tooltip="Unfold all (Alt-S)" onClick={onUnfoldAll}><Icon.Style.UnfoldAll/></IconButton>
      </>
    */
  }
}
