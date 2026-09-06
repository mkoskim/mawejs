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
  Input,
} from "../common/factory";

import { importText } from "../../document/import/text";

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
      <Input variant="outlined" label="Act Prefix" value={this.state.actprefix} onChange={e => this.setActPrefix(e.target.value)}/>
      <Input variant="outlined" label="Chapter Prefix" value={this.state.chapterprefix} onChange={e => this.setChapterPrefix(e.target.value)}/>
      <Input variant="outlined" label="Scene Prefix" value={this.state.sceneprefix} onChange={e => this.setScenePrefix(e.target.value)}/>

      <UpdateImported content={content} setImported={setImported} settings={this.state}/>
    </>
  }
}

function UpdateImported({content, setImported, settings}) {
  useEffect(() => {
    setImported(importText(content, settings))
  }, [content, setImported, settings])
}
