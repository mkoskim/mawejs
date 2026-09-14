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
  Button, Input,
  Icon, IconButton,
  MakeToggleGroup, DropDown,
  Popup,
  Autocomplete,
  Separator,
  IsKey,
} from "./factory";

import { mawe } from "../../document"
import {reqOpenFolder} from '../app/context';
import {getHeader} from '../../document/head';
import { numfmt } from '../../util';
import {
  getLangNative,
  isLangSupported,
  languageMatches,
  languageOptions,
} from '../../document/lang';

//-----------------------------------------------------------------------------
// Head info editing box
//-----------------------------------------------------------------------------

export function updateDocName(updateDoc, value)  { updateDoc(doc => {doc.head.name = value}) }
export function updateDocLang(updateDoc, value)  { updateDoc(doc => {doc.head.lang = value}) }
export function updateDocTitle(updateDoc, value) { updateDoc(doc => {doc.head.title = value})}
export function updateDocSubtitle(updateDoc, value) { updateDoc(doc => {doc.head.subtitle = value})}
export function updateDocAuthor(updateDoc, value) { updateDoc(doc => {doc.head.author = value})}
export function updateDocPseudonym(updateDoc, value) { updateDoc(doc => {doc.head.pseudonym = value})}

export class EditHead extends React.PureComponent {
  render() {
    const {head, updateDoc, expanded} = this.props
    const info = mawe.info(head)

    return <VBox className="Panel">
      Title: {info.title}
      <Input variant="outlined" label="Name" value={head.name ?? ""} onChange={e => updateDocName(updateDoc, e.target.value)}/>
      <Input variant="outlined" label="Title" value={head.title ?? ""} onChange={e => updateDocTitle(updateDoc, e.target.value)}/>
      <Input variant="outlined" label="Subtitle" value={head.subtitle ?? ""} onChange={e => updateDocSubtitle(updateDoc, e.target.value)}/>

      <Separator/>
      Author: {info.author}
      <Input variant="outlined" label="Author" value={head.author ?? ""} onChange={e => updateDocAuthor(updateDoc, e.target.value)}/>
      <Input variant="outlined" label="Pseudonym" value={head.pseudonym ?? ""} onChange={e => updateDocPseudonym(updateDoc, e.target.value)}/>
    </VBox>
  }
}

export class EditHeadButton extends React.PureComponent {
  render() {
    const {text, head, updateDoc, expanded} = this.props

    return <Popup trigger={<Button tooltip="Edit story info">{text}<Icon.Arrow.Head.Down/></Button>}>
      <EditHead head={head} updateDoc={updateDoc} expanded={expanded}/>
    </Popup>
  }
}

//-----------------------------------------------------------------------------
// Element to choose document language
//-----------------------------------------------------------------------------

export class ChooseLanguage extends React.PureComponent {
  state = {open: false, value: ""}
  inputRef = React.createRef()

  setOpen(open) {
    this.setState({
      open,
      ...(open && {value: this.props.lang ?? ""}),
    })
  }

  selectLanguage(value) {
    updateDocLang(this.props.updateDoc, value ? value : undefined)
    this.setState({open: false, value})
  }

  render() {
    const {lang} = this.props
    const supported = lang && isLangSupported(lang)
    const tooltip = lang
      ? `Language: ${lang} (${supported ? "supported" : "unsupported"})`
      : "Language"

    return <Autocomplete.Root
      items={languageOptions}
      itemToStringValue={item => item.code}
      filter={languageMatches}
      autoHighlight
      open={this.state.open}
      onOpenChange={open => this.setOpen(open)}
      value={this.state.value}
      onValueChange={(value, details) => {
        if (details.reason === "item-press") {
          this.selectLanguage(value)
        } else {
          this.setState({value})
        }
      }}
    >
      <Autocomplete.Trigger render={
        <Button
          className="LanguageButton"
          tooltip={tooltip}
          color={lang ? supported ? "success" : "error" : undefined}
        >
          {getLangNative(lang) ?? "[None]"}
        </Button>
      }/>
      <Autocomplete.Portal>
        <Autocomplete.Positioner className="Positioner" sideOffset={3} align="start">
          <Autocomplete.Popup className="VBox Popup LanguagePopup">
            <form
              className="VBox LanguageForm"
              onSubmit={ev => {
                ev.preventDefault()
                this.selectLanguage(this.inputRef.current?.value ?? this.state.value)
              }}
            >
              <Autocomplete.Input
                ref={this.inputRef}
                className="LanguageInput"
                aria-label="Language code or native name"
                placeholder="Language code or native name"
                spellCheck={false}
                autoFocus
              />
              <Autocomplete.Empty className="LanguageEmpty">
                No matching language. Press Enter to use this code.
              </Autocomplete.Empty>
              <Autocomplete.List className="LanguageList" aria-label="Languages">
                {item => <Autocomplete.Item
                  key={item.code}
                  className="LanguageItem"
                  value={item}
                >
                  <span className="LanguageCode">{item.code}</span>
                  <span className="LanguageNative"> - {item.native}</span>
                </Autocomplete.Item>}
              </Autocomplete.List>
            </form>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  }
}

//-----------------------------------------------------------------------------
// Button group to choose which elements are shown
//-----------------------------------------------------------------------------

export class OpenFolderButton extends React.PureComponent {
  render() {
    const {filename} = this.props
    //console.log("OpenFolderButton:", filename)
    return <IconButton disabled={!filename} tooltip="Open Folder" onClick={e => reqOpenFolder(filename)}>
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
      icon: <Icon.Paragraph.Scene/>
    },
    "bookmark": {
      tooltip: "Show bookmarks",
      icon: <Icon.Paragraph.Bookmark />
    },
    "missing": {
      tooltip: "Show missing",
      icon: <Icon.Paragraph.Missing />
    },
    "fill": {
      tooltip: "Show fillers",
      icon: <Icon.Paragraph.Filler />
    },
    "comment": {
      tooltip: "Show comments",
      icon: <Icon.Paragraph.Comment />
    },
    "tags": {
      tooltip: "Show tags",
      icon: <Icon.Paragraph.Tags />
    },
  }

  render() {
    const {choices, selected, setSelected} = this.props
    return <MakeToggleGroup
      buttons={this.constructor.buttons}
      choices={choices}
      selected={selected}
      setSelected={setSelected}
      multiple={true}
    />
  }
}

//-----------------------------------------------------------------------------
// Button group to choose how words are shown
//-----------------------------------------------------------------------------

export class ChooseWordFormat extends React.PureComponent {

  static selections = {
    "off": {
      name: "Off",
      tooltip: "Don't show words",
      //icon: <Icon.StatType.Off />
    },
    "numbers": {
      name: "Numbers",
      tooltip: "Words as numbers",
      //icon: <Icon.StatType.Words />,
    },
    "compact": {
      name: "Compact",
      tooltip: "Compact word count",
      //icon: <Icon.StatType.Compact style={{transform: "rotate(90deg)"}}/>
    },
    "cumulative": {
      name: "Cumulative",
      tooltip: "Words as cumulative",
      //icon: <Icon.StatType.Cumulative />
    },
    "percent": {
      name: "Percent",
      tooltip: "Words as cumulative percent",
      //icon: <Icon.StatType.Percent />
    },
  }

  render() {
    const {choices, selected, setSelected} = this.props

    //const type = node?.type ?? undefined
    //console.log("Block type:", type)

    return <DropDown
      label="Word count format"
      choices={choices}
      selected={selected}
      setSelected={setSelected}
      selections={this.constructor.selections}
    />
  }
}

//-----------------------------------------------------------------------------
// Word formatter
//-----------------------------------------------------------------------------

export class FormatWords extends React.PureComponent {

  render() {
    const {format, text, missing, padding, cumulative, total} = this.props
    const target = text + missing

    switch(format) {
      case "numbers": return this.number(target, text, missing, padding)
      case "compact": return this.compact(target, text, missing, padding)
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
    padded:   {color: "magenta"},
  }

  getStyle(text, missing, padding) {
    const styles = this.constructor.styles;
    const target = text + missing

    if(padding) return styles.padded;
    if(!missing) return styles.complete
    if(text/target > 0.85) return styles.almost
    //if(text/target > 0.7) return styles.halfway
    return styles.missing
  }

  number(target, text, missing, padding) {
    if(!target) return "-";
    const totstyle = this.getStyle(text, undefined, padding)
    const style = this.getStyle(text, missing)

    return <>
      {missing
        ? <><span style={style}>-{missing}</span>&nbsp;/&nbsp;</>
        : <Icon.Starred style={{...style, color: "#59F", marginRight: "4pt"}}/>
      }
      <span style={totstyle}>{target}</span>
      {/*<span style={{...style, display: "inline-block", width: "1cm"}}>{Number(100.0 * text / target).toFixed(0)}%</span>*/}
    </>
  }

  compact(target, text, missing, padding) {
    if(!target) return "-";
    const style = this.getStyle(text, missing, padding)

    return <span style={style}>{target}</span>
  }

  cumulative(cumulative, total, text, missing) {
    //return this.percent(cumulative, missing, total)
    return this.compact(cumulative, text)
  }

  percent(cumulative, total, text, missing) {
    if(!cumulative) return "-";
    if(!total) return <span>0.0</span>
    return this.compact(Number(100.0 * cumulative / total).toFixed(1), text)
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
      <Separator/>
      <ChooseLanguage lang={head.lang} updateDoc={updateDoc}/>
    </>
  }
}

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
    const detail = missing ? `${-missing}` : ""

    return <span style={{color: "firebrick"}}>{detail}</span>
  }
}

export class CharInfo extends React.PureComponent {
  render() {
    const {chars} = this.props;

    return <>Chars: {numfmt.group.format(chars)}</>
  }
}

export class WordsToday extends React.PureComponent {
  render() {
    const {text, last} = this.props;
    if(!last) return null;

    const delta = text - last.text
    return <>Today: {numfmt.sign.format(delta)}</>
  }
}
