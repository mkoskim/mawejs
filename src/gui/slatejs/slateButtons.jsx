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
  toggleFold,
  foldByType,
  FOLD,
} from "./slateFolding"

import {
  MakeToggleGroup, Button, Icon,
  Menu, MenuPopup, MenuItem,
  Separator,
} from '../common/factory';

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
    const {buttons, choices} = this.constructor

    const active = [
      bold ? "bold" : "",
      italic ? "italic" : ""
    ].filter(s => s)
    //const active = Object.entries(marks).filter(([k, v]) => v).map(([k, v]) => k)

    return <MakeToggleGroup
      multiple={true}
      buttons={buttons}
      choices={choices}
      selected={active}
      setSelected={marks => applyMarks(editor, marks)}
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

  static order = [
    "p",
    "---",
    "hact",
    "hchapter",
    "---",
    "hscene",
    "hsynopsis",
    "hnotes",
    "---",
    "quote",
    "bookmark",
    "comment",
    "missing",
    "fill",
    "tags"
  ]

  static separator_types = {
    "|": true,
    "---": true,
  }

  menuItem(editor, index, choices, type) {
    if(type in this.constructor.separator_types) return <Separator key={index}/>
    if(type in choices) {
      const style = choices[type];
      return (
        <MenuItem
          key={type}
          title={<span style={{width: "100px"}}>{style.name}</span>}
          startIcon={style.markup}
          endAdornment={style.shortcut}
          onClick={e => {applyStyle(editor, type);}}
        />
      )
    }
    return null;
  }

  render() {
    const {type, editor} = this.props;
    const choices = paragraphTypes
    const {order} = this.constructor
    const name  = type in choices ? choices[type].name : "Text"

    return <Menu.Root>
      <Menu.Trigger render={
        <Button tooltip="Paragraph style">
          <div style={{width: 70, textAlign: "left"}}>{name}</div><Icon.Arrow.DropDown/>
        </Button>}/>
      <Menu.Portal>
        <MenuPopup>
          {order.map((type, index) => this.menuItem(editor, index, choices, type))}
        </MenuPopup>
      </Menu.Portal>
    </Menu.Root>
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

    return <Menu.Root>
      <Menu.Trigger render={<Button tooltip="Folding">Fold <Icon.Arrow.DropDown/></Button>}/>
      <Menu.Portal>
        <MenuPopup>
          <MenuItem title="Fold All" endAdornment="Alt-A" onClick={e => {onFoldAll(e)}}/>
          <Separator/>
          <MenuItem title="Fold Chapters" onClick={e => {onFoldChapters(e)}}/>
          <MenuItem title="Unfold Chapters" onClick={e => {onUnfoldChapters(e)}}/>
          <Separator/>
          <MenuItem title="Unfold Synopsis" onClick={e => {onUnfoldSynopsis(e)}}/>
          <MenuItem title="Unfold Draft" onClick={e => {onUnfoldScenes(e)}}/>
          <Separator/>
          <MenuItem title="Unfold All" endAdornment="Alt-S" onClick={e => {onUnfoldAll(e)}}/>
        </MenuPopup>
      </Menu.Portal>
    </Menu.Root>

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
