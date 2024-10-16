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

  render() {
    const {format, text, missing, cumulative, total} = this.props
    const target = text + missing

    if(text !== undefined) switch(format) {
      case "numbers": return this.number(target, text, missing)
      case "compact": return this.compact(target, text, missing)
      case "percent": return this.percent(cumulative, total, text, missing)
      case "cumulative": return this.cumulative(cumulative, total, text, missing)
      default: break;
    }
    return null;
  }

  static styles = {
    missing:  {color: "red"},
    halfway:  {color: "red"},
    almost:   {color: "darkorange"},
    complete: {}, //"#59F"},
  }

  getStyle(text, missing) {
    const styles = this.constructor.styles;
    const target = text + missing

    if(!missing) return styles.complete
    if(text/target > 0.85) return styles.almost
    //if(text/target > 0.7) return styles.halfway
    return styles.missing
  }

  number(target, text, missing) {
    if(!target) return "-";
    const style = this.getStyle(text, missing)

    return <>
      {missing
        ? <><span style={style}>-{missing}</span>&nbsp;/&nbsp;</>
        : <Icon.Starred sx={{...style, color: "#59F", marginRight: "4pt", fontSize: 14}}/>
      }
      <span>{target}</span>
      {/*<span style={{...style, display: "inline-block", width: "1cm"}}>{Number(100.0 * text / target).toFixed(0)}%</span>*/}
    </>
  }

  compact(target, text, missing) {
    if(!target) return "-";
    const style = this.getStyle(text, missing)

    return <span style={style}>{target}</span>
  }

  cumulative(cumulative, total, text, missing) {
    //return this.percent(cumulative, missing, total)
    return this.compact(cumulative, text, missing)
  }

  percent(cumulative, total, text, missing) {
    if(!total) return <span>0.0</span>
    return this.compact(Number(100.0 * cumulative / total).toFixed(1), text, missing)
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

/*
export class WordInfo extends React.PureComponent {
  render() {
    const {text, missing, last, chars} = this.props;

    return <>
      <ActualWords text={text}/>
      <Separator/>
      <WordsToday text={text} last={last}/>
      <Separator/>
      <TargetWords text={text} missing={missing}/>
      <MissingWords missing={missing}/>
      <Separator/>
      <CharInfo chars={chars}/>
    </>
  }
}
*/

export class ActualWords extends React.PureComponent {
  render() {
    const {text} = this.props
    return <>Words:&nbsp;<span style={{color: "green"}}>{text}</span></>
  }
}

export class TargetWords extends React.PureComponent {
  render() {
    const {text, missing} = this.props
    return <>Target: {text + missing}</>
  }
}

export class MissingWords extends React.PureComponent {
  render() {
    const {missing} = this.props
    const detail = missing ? `-${missing}` : ""

    return <span style={{color: "firebrick"}}>{detail}</span>
  }
}

export class CharInfo extends React.PureComponent {
  render() {
    const {chars} = this.props;

    return <>Chars: {chars}</>
  }
}

export class WordsToday extends React.PureComponent {
  render() {
    const {text, last} = this.props;
    if(!last) return null;

    const delta = text - last.text
    return <>Today: {delta >= 0 ? "+" : ""}{delta}</>
  }
}
