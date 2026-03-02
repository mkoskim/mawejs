//*****************************************************************************
//
// Text import
//
//*****************************************************************************

import React, {
  useEffect
} from 'react';

import {
  DropDown,
  OutlinedInput,
} from "../common/factory";

import { text2lines} from "./util"
import { splitByLeadingElem } from '../../util';

export class ImportText extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      linebreak: "double",
      actprefix: "",
      chapterprefix: "",
      sceneprefix: "",
    };
  }

  setLinebreak(linebreak) {
    this.setState({linebreak})
  }

  setActPrefix(actprefix) {
    this.setState({actprefix})
  }

  setChapterPrefix(chapterprefix) {
    this.setState({chapterprefix})
  }

  setScenePrefix(sceneprefix) {
    this.setState({sceneprefix})
  }

  linebreaks = {
    single: {name: "Single"},
    double: {name: "Double"},
    choices: ["single", "double"],
  }

  render() {
    const {content, setImported} = this.props
    //console.log("Settings:", this.state)

    return <>
      <DropDown
        as="text"
        label="Line Breaks"
        choices={this.linebreaks.choices}
        selected={this.state.linebreak}
        selections={this.linebreaks}
        setSelected={value => this.setLinebreak(value)}
      />
      <OutlinedInput label="Act Prefix" value={this.state.actprefix} onChange={e => this.setActPrefix(e.target.value)}/>
      <OutlinedInput label="Chapter Prefix" value={this.state.chapterprefix} onChange={e => this.setChapterPrefix(e.target.value)}/>
      <OutlinedInput label="Scene Prefix" value={this.state.sceneprefix} onChange={e => this.setScenePrefix(e.target.value)}/>

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
  const {actprefix, chapterprefix, sceneprefix} = settings

  function isActBreak(line) {
    //console.log("Act prefix:", actprefix)
    if(!actprefix.length) return false
    if(!line) return false
    return line.toLowerCase().startsWith(actprefix.toLowerCase())
  }

  function isChapterBreak(line) {
    if(!chapterprefix) return false
    if(!line) return false
    return line.toLowerCase().startsWith(chapterprefix.toLowerCase())
  }

  function isSceneBreak(line) {
    if(!sceneprefix) return false
    if(!line) return false
    return line.toLowerCase().startsWith(sceneprefix.toLowerCase())
  }

  const lines = text2lines(content, linebreak)
  const acts = splitByLeadingElem(lines, isActBreak).filter(e => e.length)

  const elements = acts.map(makeAct)

  //console.log("Elements:", elements)

  return elements

  //---------------------------------------------------------------------------

  function makeAct(lines) {
    const {first, rest} = getContent(lines)
    //console.log(first, rest)
    const chapters = splitByLeadingElem(rest, isChapterBreak).filter(e => e.length)
    return {
      type: "element", name: "act",
      attributes: { name: first },
      elements: chapters.map(makeChapter)
    }

    function getContent(lines) {
      const [first, ...rest] = lines
      if(isActBreak(first)) return {first, rest}
      return {first: "", rest: [first].concat(rest)}
    }
  }

  function makeChapter(lines) {
    const {first, rest} = getContent(lines)
    //console.log(first, rest)
    const scenes = splitByLeadingElem(rest, isSceneBreak).filter(e => e.length)
    return {
      type: "element", name: "chapter",
      attributes: { name: first },
      elements: scenes.map(makeScene)
    }

    function getContent(lines) {
      const [first, ...rest] = lines
      if(isChapterBreak(first)) return {first, rest}
      return {first: "", rest: [first].concat(rest)}
    }
  }

  function makeScene(lines) {
    const {first, rest} = getContent(lines)

    return {
      type: "element", name: "scene",
      attributes: { name: first },
      elements: rest.map(makeParagraph)
    }

    function getContent(lines) {
      const [first, ...rest] = lines
      if(isSceneBreak(first)) return {first, rest}
      return {first: "", rest: [first].concat(rest)}
    }
  }

  function makeParagraph(line) {
    return {
      type: "element", name: "p",
      elements: [{type: "text", text: line}]
    }
  }
}
