//*****************************************************************************
//*****************************************************************************
//
// File editor
//
// List of different editor frameworks:
// https://gist.github.com/manigandham/65543a0bc2bf7006a487
//
//*****************************************************************************
//*****************************************************************************

import "./editor.css"

/* eslint-disable no-unused-vars */

import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { useSelector, useDispatch } from "react-redux";
import { document } from "../../features/docSlice"

//*
import { Slate, Editable, withReact } from 'slate-react'
import { createEditor } from "slate"
import { withHistory } from "slate-history"
/**/

import {
  Icon,
  FlexBox, VBox, HBox, Filler,
  ToolBox, Button, Input,
  SearchBox, Inform, addHotkeys,
  Label,
} from "../component/factory";

import isHotkey from 'is-hotkey';

//*****************************************************************************
//*****************************************************************************
//
// NOTE!!! Slate is very picky that all its components are together. So, do
// not separate Slate from its state and such things. If you do that, it will
// not work!
//
// IT WILL NOT WORK!
//
// NOTE! Do not put the same state to two editor instances. It will not work.
// Find out ways to do split'd editing views.
//
//*****************************************************************************
//*****************************************************************************

export function EditFile({uuid}) {

  var {docs} = require("../../features/store")
  const doc = docs[uuid]

  console.log("Doc:", doc)
  const dispatch = useDispatch();

  const [content, setContent] = useState(deserialize(doc));

  console.log("Content:", content);
  console.log("Body:", content.body);

  function setBody(part)  { setContent({...content, body: part}) }
  function setNotes(part) { setContent({...content, notes: part}) }

  const inform = Inform();

  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  useEffect(() => addHotkeys({
    "mod+o": () => dispatch(document.close()),   // Go to file browser to open new file
    "mod+s": null,              // Serialize and save
    "mod+w": () => dispatch(document.close()),   // Close file
  }));

  //const mode="Centered";
  const mode="Primary";

  return (
    <React.Fragment>
      <ToolBar />
      <HBox style={{overflow: "auto", background: "#EEE"}}>
        <Outline />
        <div className={`Board ${mode}`}>
          <Slate editor={editor} value={content.body} onChange={setBody}>
            <Editable
              className="Sheet Shadow"
              autoFocus
              spellCheck={false} // Keep false until you find out how to change language
              renderElement={renderElement}
              renderLeaf={renderLeaf}
            />
          </Slate>
        </div>
      </HBox>
    </React.Fragment>
  )

  function ToolBar(props) {
    return (
      <ToolBox>
        <Label>{doc.file.name}</Label>
        <SearchBox style={{marginLeft: 8, marginRight: 8}}/>
        <Filler/>
        <Button size="small"><Icon.Search /></Button>
      </ToolBox>
    )
  }

  function Outline(props) {
    return (
      <div className="Outline">
      {content.body.filter(n => n.type === "scenename").map(n => <Entry text={n.children[0].text}/>)}
      </div>
    )

    function Entry(props) {
      return <div className="entry">{props.text}</div>
    }
  }

  function Element({element, attributes, children}) {
    switch(element.type) {
      case "title": return <h1 {...attributes}>{children}</h1>
      //case "scene": return <div className="scene" {...attributes}>{children}</div>
      case "scenename": return <h2 className="scene" {...attributes}>{children}</h2>
      case "br": return <br {...attributes}/>
      case "missing":
      case "comment":
      case "synopsis":
        return <p className={element.type} {...attributes}>{children}</p>
      default: return <p {...attributes}>{children}</p>
    }
  }

  function Leaf({leaf, attributes, children}) {
    return <span {...attributes}>{children}</span>
  }
}

//-----------------------------------------------------------------------------

function deserialize(doc) {
  const body = Story2Slate(doc.story);
  const notes = Part2Slate(doc.story.notes.part[0]);

  return {
    body: body,
    notes: notes,
  }

  function Story2Slate(story) {
    return [
      { type: "title", children: [{text: story.body.head.title}] },
      ]
      .concat(Part2Slate(story.body.part[0]))
      .concat([{type: "p", children: [{text: ""}]}])
  }

  function Part2Slate(part) {
    return part.children.map(Scene2Slate).flat(1);
  }

  function Scene2Slate(scene) {
    return [{
      type: "scenename",
      children: [{text: scene.attr.name}]
    }].concat(scene.children.map(Paragraph2Slate))
  }

  function Paragraph2Slate(p) {
    const type = p.tag;
    return {
      type: type,
      children: [{ text: p.text }]
    }
  }
}
