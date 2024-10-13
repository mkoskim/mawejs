//*****************************************************************************
//*****************************************************************************
//
// Collections of common components for editor
//
//*****************************************************************************
//*****************************************************************************

import React, {
} from 'react';

import {
  VBox,
  Button, Icon, IconButton,
  MakeToggleGroup,
  TextField,
  Label,
  Accordion, AccordionSummary, AccordionDetails,
  Separator,
} from "../common/factory";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { mawe } from "../../document"
import {cmdOpenFolder} from '../app/context';
import {Popover} from '@mui/material';
import {getHeader} from '../../document/head';

//-----------------------------------------------------------------------------
// Head info editing box
//-----------------------------------------------------------------------------

export function updateDocName(updateDoc, value)  { updateDoc(doc => {doc.head.name = value}) }
export function updateDocTitle(updateDoc, value) { updateDoc(doc => {doc.head.title = value})}
export function updateDocSubtitle(updateDoc, value) { updateDoc(doc => {doc.head.subtitle = value})}
export function updateDocAuthor(updateDoc, value) { updateDoc(doc => {doc.head.author = value})}
export function updateDocPseudonym(updateDoc, value) { updateDoc(doc => {doc.head.pseudonym = value})}

export class EditHead extends React.PureComponent {
  render() {
    const {head, updateDoc, expanded} = this.props
    const info = mawe.info(head)

    return <>
      <Accordion disableGutters defaultExpanded={expanded}>
      <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Title: {info.title}</AccordionSummary>
      <AccordionDetails><VBox>
      <TextField label="Name" value={head.name ?? ""} onChange={e => updateDocName(updateDoc, e.target.value)}/>
      <TextField label="Title" value={head.title ?? ""} onChange={e => updateDocTitle(updateDoc, e.target.value)}/>
      <TextField label="Subtitle" value={head.subtitle ?? ""} onChange={e => updateDocSubtitle(updateDoc, e.target.value)}/>
      </VBox></AccordionDetails>
      </Accordion>

      <Accordion disableGutters defaultExpanded={expanded}>
      <AccordionSummary expandIcon={<Icon.ExpandMore/>}>Author: {info.author}</AccordionSummary>
      <AccordionDetails><VBox>
      <TextField label="Author" value={head.author ?? ""} onChange={e => updateDocAuthor(updateDoc, e.target.value)}/>
      <TextField label="Pseudonym" value={head.pseudonym ?? ""} onChange={e => updateDocPseudonym(updateDoc, e.target.value)}/>
      </VBox></AccordionDetails>
      </Accordion>
    </>
  }
}

export class EditHeadButton extends React.PureComponent {
  render() {
    const {text, head, updateDoc, expanded} = this.props
    return <PopupState variant="popover" popupId="head-edit">
    {(popupState) => <React.Fragment>
      <Button {...bindTrigger(popupState)} tooltip="Edit story info">{text}</Button>
      <Popover {...bindMenu(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <EditHead head={head} updateDoc={updateDoc} expanded={expanded}/>
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
    return <IconButton tooltip="Open Folder" onClick={e => cmdOpenFolder(filename)}>
      <Icon.Action.Folder />
      </IconButton>
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
    "fill": {
      tooltip: "Show fillers",
      icon: <Icon.BlockType.Filler />
    },
    "comment": {
      tooltip: "Show comments",
      icon: <Icon.BlockType.Comment />
    },
    "tags": {
      tooltip: "Show tags",
      icon: <Icon.BlockType.Tags />
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

export class HeadInfo extends React.PureComponent {

  render() {
    const {updateDoc, head} = this.props
    const header = getHeader(head)

    return <>
      <EditHeadButton text={header} updateDoc={updateDoc} head={head} expanded={true}/>
    </>
  }
}

export class WordInfo extends React.PureComponent {
  render() {
    const {text, missing, last, chars} = this.props;

    const detail = missing ? `-${missing}` : ""

    return <>
      Words:&nbsp;<span style={{color: "green"}}>{text}</span>
      <Separator/>
      <WordsToday text={text} last={last}/>
      <Separator/>
      Target: {text + missing}&nbsp;<span style={{color: "firebrick"}}>{detail}</span>
      <Separator/>
      <CharInfo chars={chars}/>
    </>
  }
}

class CharInfo extends React.PureComponent {
  render() {
    const {chars} = this.props;

    return <Label>Chars: {chars}</Label>
  }
}

class WordsToday extends React.PureComponent {
  render() {
    const {text, last} = this.props;
    if(!last) return null;

    const delta = text - last.text
    return <Label>Today: {delta >= 0 ? "+" : ""}{delta}</Label>
  }
}
