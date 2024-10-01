//*****************************************************************************
//*****************************************************************************
//
// Collections of common components for editor
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useState, useEffect, useReducer,
  useMemo, useCallback,
  useDeferredValue,
  StrictMode,
  useContext,
} from 'react';

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup, MakeToggleGroup,
  TextField, Input,
  SearchBox,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
  Menu, MenuItem,
  Accordion, AccordionSummary, AccordionDetails,
} from "../common/factory";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { produce } from 'immer';
import { mawe } from "../../document"
import {cmdOpenFolder} from '../app/context';
import {Popover} from '@mui/material';

//-----------------------------------------------------------------------------
// Head info editing box
//-----------------------------------------------------------------------------

export function setDocName(setDoc, value)  { setDoc(produce(draft => {draft.story.body.head.name = value})) }
export function setDocTitle(setDoc, value) { setDoc(produce(draft => {draft.story.body.head.title = value}))}
export function setDocSubtitle(setDoc, value) { setDoc(produce(draft => {draft.story.body.head.subtitle = value}))}
export function setDocAuthor(setDoc, value) { setDoc(produce(draft => {draft.story.body.head.author = value}))}
export function setDocPseudonym(setDoc, value) { setDoc(produce(draft => {draft.story.body.head.pseudonym = value}))}

export function setDocStoryType(setDoc, value) { setDoc(produce(draft => {draft.story.body.head.export.type = value}))}
export function setDocChapterElem(setDoc, value) { setDoc(produce(draft => {draft.story.body.head.export.chapterelem = value}))}
export function setDocChapterType(setDoc, value) { setDoc(produce(draft => {draft.story.body.head.export.chaptertype = value}))}

export class EditHead extends React.PureComponent {
  render() {
    const {head, setDoc, expanded} = this.props
    const info = mawe.info(head)

    return <>
      <Accordion disableGutters defaultExpanded={expanded}>
      <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Title: {info.title}</AccordionSummary>
      <AccordionDetails><VBox>
      <TextField label="Name" value={head.name ?? ""} onChange={e => setDocName(setDoc, e.target.value)}/>
      <TextField label="Title" value={head.title ?? ""} onChange={e => setDocTitle(setDoc, e.target.value)}/>
      <TextField label="Subtitle" value={head.subtitle ?? ""} onChange={e => setDocSubtitle(setDoc, e.target.value)}/>
      </VBox></AccordionDetails>
      </Accordion>

      <Accordion disableGutters defaultExpanded={expanded}>
      <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Author: {info.author}</AccordionSummary>
      <AccordionDetails><VBox>
      <TextField label="Author" value={head.author ?? ""} onChange={e => setDocAuthor(setDoc, e.target.value)}/>
      <TextField label="Pseudonym" value={head.pseudonym ?? ""} onChange={e => setDocPseudonym(setDoc, e.target.value)}/>
      </VBox></AccordionDetails>
      </Accordion>
    </>
  }
}

export class EditHeadButton extends React.PureComponent {
  render() {
    const {head, setDoc, expanded} = this.props
    return <PopupState variant="popover" popupId="head-edit">
    {(popupState) => <React.Fragment>
      <Button {...bindTrigger(popupState)} tooltip="Edit story info"><Icon.Action.HeadInfo /></Button>
      <Popover {...bindMenu(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <EditHead head={head} setDoc={setDoc} expanded={expanded}/>
      </Popover>
    </React.Fragment>
    }</PopupState>
  }
}

//-----------------------------------------------------------------------------
// Button group to choose which elements are shown
//-----------------------------------------------------------------------------

export class OpenFolderButton extends React.PureComponent {
  render() {
    const {filename} = this.props
    //console.log("OpenFolderButton:", filename)
    return <Button tooltip="Open Folder" onClick={e => cmdOpenFolder(filename)}>
      <Icon.Action.Folder />
      </Button>
  }
}

//-----------------------------------------------------------------------------
// Button group to choose which elements are shown
//-----------------------------------------------------------------------------

export class ChooseVisibleElements extends React.PureComponent {

  static buttons = {
    "scene": {
      tooltip: "Show scenes",
      icon: <Icon.BlockType.Scene/>
    },
    "synopsis": {
      tooltip: "Show synopses",
      icon: <Icon.BlockType.Synopsis />
    },
    "missing": {
      tooltip: "Show missing",
      icon: <Icon.BlockType.Missing />
    },
    "comment": {
      tooltip: "Show comments",
      icon: <Icon.BlockType.Comment />
    },
  }

  render() {
    const {choices, selected, setSelected} = this.props
    return <MakeToggleGroup
      buttons={this.constructor.buttons}
      choices={choices}
      selected={selected}
      setSelected={setSelected}
    />
  }
}

//-----------------------------------------------------------------------------
// Button group to choose how words are shown
//-----------------------------------------------------------------------------

export class ChooseWordFormat extends React.PureComponent {

  static buttons = {
    "off": {
      tooltip: "Don't show words",
      icon: <Icon.StatType.Off />
    },
    "numbers": {
      tooltip: "Words as numbers",
      icon: <Icon.StatType.Words />,
    },
    "compact": {
      tooltip: "Compact word count",
      icon: <Icon.StatType.Compact style={{transform: "rotate(90deg)"}}/>
    },
    "cumulative": {
      tooltip: "Words as cumulative",
      icon: <Icon.StatType.Cumulative />
    },
    "percent": {
      tooltip: "Words as cumulative percent",
      icon: <Icon.StatType.Percent />
    },
  }

  render() {
    const {choices, selected, setSelected} = this.props
    return <MakeToggleGroup
      buttons={this.constructor.buttons}
      choices={choices}
      selected={selected}
      setSelected={setSelected}
      exclusive={true}
    />
  }
}

//-----------------------------------------------------------------------------
// Word formatter
//-----------------------------------------------------------------------------

export class FormatWords extends React.PureComponent {

  static styles = {
    missing: {color: "red"},
    bluestar: {color: "#59F", fontSize: 14, marginRight: "4px"},
  }

  number(words, missing) {
    if(missing) {
      return <>
        <span style={this.constructor.styles.missing}>{missing}</span>
        <span>
          &nbsp;/&nbsp;
          {words}
        </span>
      </>
    }
    return <>
      {words ? <Icon.Starred sx={this.constructor.styles.bluestar}/> : null}
      <span>{words}</span>
    </>
  }

  compact(words, missing) {
    if(missing) {
      return <span style={this.constructor.styles.missing}>{words}</span>
    }
    return <span>{words}</span>
  }

  percent(words, missing, total) {
    if(!total) return <span>0.0</span>
    return this.compact(Number(100.0 * words / total).toFixed(1), missing)
  }

  cumulative(cumulative, missing, total) {
    //return this.percent(cumulative, missing, total)
    return this.compact(cumulative, missing)
  }

  render() {
    const {format, words, missing, cumulative, total} = this.props
    const summed = words + missing

    if(words !== undefined) switch(format) {
      case "numbers": return this.number(summed, missing)
      case "compact": return this.compact(summed, missing)
      case "percent": return this.percent(cumulative, missing, total)
      case "cumulative": return this.cumulative(cumulative, missing, total)
      default: break;
    }
    return null;
  }
}

//-----------------------------------------------------------------------------
// Document word info
//-----------------------------------------------------------------------------

export function SectionWordInfo({section}) {
  if(!section) return null;
  return <>
    <Label>Words: {section.words?.text}</Label>
    <Separator/>
    <Label>Chars: {section.words?.chars}</Label>
    </>
}
