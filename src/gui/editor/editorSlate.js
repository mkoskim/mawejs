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
import { action, docByID } from "../app/store"

import { Slate, Editable, withReact } from 'slate-react'
import { createEditor } from "slate"
import { withHistory } from "slate-history"

import {ViewSection} from "./organizer"

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon,
  Input,
  SearchBox, addHotkeys,
  Label,
  Grid,
} from "../common/factory";

import isHotkey from 'is-hotkey';

//-----------------------------------------------------------------------------

export function ViewDoc({id}) {
  const doc = docByID(id)

  return <Grid container>
    <Grid item xs={6}>
      <pre style={{fontSize: "10pt"}}>{`${JSON.stringify(doc, null, 2)}`}</pre>
    </Grid>
    <Grid item xs={6}>
      <div className="Sheet">
        Testi.
      </div>
    </Grid>
  </Grid>
}

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

export function EditFile({id}) {

  const doc = docByID(id)

  console.log("ID", id, "Doc:", doc)
  const dispatch = useDispatch();

  useEffect(() => addHotkeys({
    "mod+o": (e) => onClose(e, dispatch),
    "mod+w": (e) => onClose(e, dispatch),
    "mod+s": null,
  }));

  const mode="Centered";
  //const mode="Primary";

  return <VFiller>
    <ToolBar doc={doc}/>
    <HFiller style={{overflow: "auto", background: "#F8F8F8"}}>
      <ViewSection
        section={doc.story.body}
        style={{minWidth: "25%", maxWidth: "25%", background: "#EEE"}}
      />
      <div
        style={{overflow: "auto"}}
        className={`Board ${mode}`}>
          <SlateEdit doc={doc}/>
        </div>
      </HFiller>
  </VFiller>

}

//-----------------------------------------------------------------------------

function onClose(e, dispatch) {
  if(e) e.preventDefault()
  dispatch(action.doc.close({}))
}

//-----------------------------------------------------------------------------

function ToolBar({doc}) {
  const dispatch = useDispatch();

  return (
    <ToolBox>
      <Label>{doc.file.name}</Label>
      <Filler/>
      <Button onClick={(e) => onClose(e, dispatch)}><Icon.Close/></Button>
    </ToolBox>
  )
}

//-----------------------------------------------------------------------------

function SlateEdit({doc}) {
  const [content, setContent] = useState(deserialize(doc));

  //console.log("Content:", content);
  //console.log("Body:", content.body);

  function setBody(part)  { setContent({...content, body: part}) }
  function setNotes(part) { setContent({...content, notes: part}) }

  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  return (
    <Slate editor={editor} value={content.body} onChange={setBody}>
    <Editable
      className="Sheet Shadow"
      autoFocus
      spellCheck={false} // Keep false until you find out how to change language
      renderElement={renderElement}
      renderLeaf={renderLeaf}
    />
  </Slate>
  )
}

//-----------------------------------------------------------------------------

function renderPlain({doc}) {
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
