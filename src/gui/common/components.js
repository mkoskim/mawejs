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
} from 'react';

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup, MakeToggleGroup,
  TextField, Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
  Menu, MenuItem,
  Accordion, AccordionSummary, AccordionDetails,
} from "../common/factory";

import { produce } from 'immer';
import { mawe } from "../../document"

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
    const {head, setDoc} = this.props
    const info = mawe.info(head)

    return <>
      <Accordion disableGutters>
      <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Title: {info.title}</AccordionSummary>
      <AccordionDetails><VBox>
      <TextField label="Name" value={head.name ?? ""} onChange={e => setDocName(setDoc, e.target.value)}/>
      <TextField label="Title" value={head.title ?? ""} onChange={e => setDocTitle(setDoc, e.target.value)}/>
      <TextField label="Subtitle" value={head.subtitle ?? ""} onChange={e => setDocSubtitle(setDoc, e.target.value)}/>
      </VBox></AccordionDetails>
      </Accordion>

      <Accordion disableGutters>
      <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Author: {info.author}</AccordionSummary>
      <AccordionDetails><VBox>
      <TextField label="Author" value={head.author ?? ""} onChange={e => setDocAuthor(setDoc, e.target.value)}/>
      <TextField label="Pseudonym" value={head.pseudonym ?? ""} onChange={e => setDocPseudonym(setDoc, e.target.value)}/>
      </VBox></AccordionDetails>
      </Accordion>
    </>
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
    "percent": {
      tooltip: "Words as percent",
      icon: <Icon.StatType.Percent />
    },
    "cumulative": {
      tooltip: "Words as cumulative percent",
      icon: <Icon.StatType.Cumulative />
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
    return this.percent(cumulative, missing, total)
  }

  render() {
    const {format, words, missing, cumulative, total} = this.props
    const summed = words + missing

    if(words !== undefined) switch(format) {
      case "numbers": return this.number(summed, missing)
      case "compact": return this.compact(summed, missing)
      case "percent": return this.percent(summed, missing, total)
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
