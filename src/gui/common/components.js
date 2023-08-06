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

import { mawe } from "../../document"

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

//-----------------------------------------------------------------------------
// Head info editing box
//-----------------------------------------------------------------------------

export function setDocHead(setDoc, value) {
  setDoc(doc => ({
    ...doc,
    story: {
      ...doc.story,
      body: {
        ...doc.story.body,
        head: {
          ...doc.story.body.head,
          ...value,
        }
      }
    }
  }))
}

export function setDocExport(setDoc, value) {
  setDoc(doc => {
    //console.log(doc.story.body.head.export, value)
    return {
      ...doc,
      story: {
        ...doc.story,
        body: {
          ...doc.story.body,
          head: {
            ...doc.story.body.head,
            export: {
              ...doc.story.body.head.export,
              ...value,
            }
          }
        }
      }
    }
  })
}

export function setDocName(setDoc, value)  { setDocHead(setDoc, {name: value}) }
export function setDocTitle(setDoc, value) { setDocHead(setDoc, {title: value}) }
export function setDocSubtitle(setDoc, value) { setDocHead(setDoc, {subtitle: value}) }
export function setDocAuthor(setDoc, value) { setDocHead(setDoc, {author: value}) }
export function setDocPseudonym(setDoc, value) { setDocHead(setDoc, {pseudonym: value}) }

export function setDocStoryType(setDoc, value) { setDocExport(setDoc, {type: value}) }
export function setDocChapterElem(setDoc, value) { setDocExport(setDoc, {chapterelem: value}) }
export function setDocChapterType(setDoc, value) { setDocExport(setDoc, {chaptertype: value}) }

export function EditHead({head, setDoc}) {
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

export function FormatWords({format, words, cumulative, total}) {
  if(words !== undefined) switch(format) {
    case "numbers": return <span>{words}</span>
    case "percent": return <span>{Number(100.0 * words / total).toFixed(1)}</span>
    case "cumulative": return <span>{cumulative !== undefined && Number(100.0 * cumulative / total).toFixed(1)}</span>
    default: break;
  }
  return null;
}
