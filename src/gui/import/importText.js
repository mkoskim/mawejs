//*****************************************************************************
//
// Text import
//
//*****************************************************************************

import "../common/styles/TOC.css"
import "../common/styles/sheet.css"

import React, {
  useEffect
} from 'react';

import {
  Label,
  TextField,
  Menu, MenuItem,
} from "../common/factory";

import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';

import { nanoid } from "../../document/util";
import { text2lines} from "./util"
import { splitByLeadingElem } from '../../util';

export class ImportText extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      linebreak: "double",
      chapterprefix: "# ",
      sceneprefix: "## ",
    };
  }

  setLinebreak(linebreak) {
    this.setState({linebreak})
  }

  setChapterPrefix(chapterprefix) {
    this.setState({chapterprefix})
  }

  setScenePrefix(sceneprefix) {
    this.setState({sceneprefix})
  }

  render() {
    const {content, setImported} = this.props

    //console.log("Settings:", this.state)

    return <>
      <Label>Text import</Label>
      <TextField select label="Line break" value={this.state.linebreak} onChange={e => this.setLinebreak(e.target.value)}>
        <MenuItem value="double">Double</MenuItem>
        <MenuItem value="single">Single</MenuItem>
      </TextField>
      <TextField label="Chapter prefix" value={this.state.chapterprefix} onChange={e => this.setChapterPrefix(e.target.value)}/>
      <TextField label="Scene prefix" value={this.state.sceneprefix} onChange={e => this.setScenePrefix(e.target.value)}/>
      <UpdateImported content={content} setImported={setImported} settings={this.state}/>
    </>
  }
}

function UpdateImported({content, setImported, settings}) {
  useEffect(() => {
    setImported(importText(content, settings))
  }, [content, setImported, settings])
}

//-----------------------------------------------------------------------------

function getLinebreak(linebreak) {
  switch(linebreak) {
    case "single": return "\n"
    default:
    case "double": return "\n\n"
  }
}

function importText(content, settings) {

  if(!content) return undefined

  const linebreak = getLinebreak(settings.linebreak)
  const {chapterprefix, sceneprefix} = settings

  function isChapterBreak(line) {
    if(!chapterprefix) return false
    return line.startsWith(chapterprefix)
  }

  function isSceneBreak(line) {
    if(!sceneprefix) return false
    return line.startsWith(sceneprefix)
  }

  const lines = text2lines(content, linebreak)
  const chapters = splitByLeadingElem(lines, isChapterBreak)

  const elements = chapters.map(makeChapter)

  //console.log("Elements:", elements)

  return elements

  //---------------------------------------------------------------------------

  function makeChapter(lines) {
    const {first, rest} = getContent(lines)
    //console.log(first, rest)
    const scenes = splitByLeadingElem(rest, isSceneBreak).filter(e => e.length)
    return {
      type: "element", name: "chapter", id: nanoid(),
      attributes: { name: first },
      elements: scenes.map(makeScene)
    }

    function getContent(lines) {
      const [first, ...rest] = lines
      if(isChapterBreak(first)) return {first, rest}
      return {rest: [first].concat(rest)}
    }
  }

  function makeScene(lines) {
    const {first, rest} = getContent(lines)

    return {
      type: "element", name: "scene", id: nanoid(),
      attributes: { name: first },
      elements: rest.map(makeParagraph)
    }

    function getContent(lines) {
      const [first, ...rest] = lines
      if(isSceneBreak(first)) return {first, rest}
      return {rest: [first].concat(rest)}
    }
  }

  function makeParagraph(line) {
    return {
      type: "element", name: "p", id: nanoid(),
      elements: [{type: "text", text: line}]
    }
  }
}
