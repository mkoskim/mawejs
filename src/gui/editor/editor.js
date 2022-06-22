//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import "./editor.css"

/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { action, docByID } from "../app/store"

import {
  SlateEdit, deserialize,
} from "./slateEditor"

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  Grid,
  Separator, Loading,
} from "../common/factory";

import {ViewSection} from "./organizer"

import isHotkey from 'is-hotkey';

//-----------------------------------------------------------------------------
// Choose the view
//-----------------------------------------------------------------------------

export function EditView() {

  const edit = useSelector(state => state.doc.edit)
  const loading = useSelector(state => state.doc.loading)

  console.log("EditView:", loading, edit.id)

  // Force (slate) re-render when ID changes
  const [id, setID] = useState(edit.id)
  useEffect(() => setID(edit.id), [edit.id])

  const refresh = (id !== edit.id)

  //return <RawDoc doc={doc}/>
  //return <SlateDoc doc={doc}/>
  return <VFiller>
    <WorkspaceTab />
    {loading || refresh ? null : <SingleEdit id={id} />}
  </VFiller>
}

//-----------------------------------------------------------------------------
// Single edit with sidebars

function SingleEdit({ id, left, right, center, refresh }) {

  const doc = docByID(id)

  const [content, setContent] = useState(deserialize(doc).body);

  const info = getinfo(content)

  const dispatch = useDispatch();

  useEffect(() => addHotkeys({
    "mod+o": (e) => onClose(e, dispatch),
    "mod+w": (e) => onClose(e, dispatch),
    "mod+s": null,
  }));

  //console.log("Edit:", id)

  const mode = "Centered";
  //const mode="Primary";

  //*
  return <React.Fragment>
    <ToolBar doc={doc} info={info}/>
    <HFiller style={{overflow: "auto", background: "#F8F8F8"}}>
      <ViewSection
        section={doc.story.body}
        style={{width: "25%", maxWidth: "25%", background: "#EEE"}}
      />
      <div
        style={{overflow: "auto"}}
        className={`Board ${mode}`}>
        <SlateEdit content={content} setContent={setContent}/>
        </div>
      </HFiller>
  </React.Fragment>
  /*/
  return <React.Fragment>
    <ToolBar doc={doc} info={info} />
    <HBox>
      <Pre style={{ width: "50%" }} content={content} />
      <Pre style={{ width: "50%" }} content={info} />
    </HBox>
  </React.Fragment>
  /**/

  /*
    <SlateEdit style={{ minWidth: "50%", padding: "0.5cm" }} content={content} setContent={setContent} />
  */
}

//-----------------------------------------------------------------------------
// Extract info from (living) slate buffer.

function getinfo(content) {
  return {
    words: 0,
    chars: 0,
  }
}
/*
function getinfo(content) {
  const parts = content
    .filter(elem => elem.type === "part")
    .map(partinfo)

  return {
    parts: parts.map(part => ({
      id: part.id,
      name: part.name,
      summary: part.summary,
    })),
    //...summary(parts.map(part => part.summary)),
    parts,
  }

  function partinfo(part) {
    const childs = part.children
    const head = childs.find(elem => elem.type === "br.part")
    const scenes = childs
      .filter(elem => elem.type === "scene")
      .map(sceneinfo)

    return {
      id: part.attributes.id,
      name: elem2text([head]),
      scenes: scenes.map(scene => ({
        id: scene.id,
        name: scene.name,
        words: {
          words: scene.words.n_words,
          missing: scene.missing.n_words,
          comment: scene.comment.n_words,
        }
      })),
      summary: scene_summary(scenes.map(scene => scene.words)),
    }
  }

  function scene_summary(info) {
    return info.reduce((a, b) => ({
      n_chars: a.n_chars + b.n_chars,
      n_words: a.n_words + b.n_words,
      words: a.words.concat(b.words),
    }), { n_chars: 0, n_words: 0, words: [] })
  }

  function sceneinfo(scene) {
    const childs = scene.children
    const head = childs.find(elem => elem.type === "br.scene")
    const p = childs.filter(elem => elem.type === "p")
    const missing = childs.filter(elem => elem.type === "missing")
    const comment = childs.filter(elem => elem.type === "comment")

    return {
      id: scene.attributes.id,
      name: elem2text([head]),
      words: parainfo(p),
      missing: parainfo(missing),
      comment: parainfo(comment),
    }
  }

  function parainfo(list) {
    const text = elem2text(list)
    const words = text.match(/\w+/gu)
    return {
      n_chars: text ? text.length : 0,
      n_words: words ? words.length : 0,
      words: words ? words : [],
    }
  }

  function elem2text(block) {
    return block
      .map(elem => elem.children).flat(1)
      .map(elem => elem.text)
      .join(" ")
      .replace(/\s+/g, ' ').trim()
  }

}
*/

//-----------------------------------------------------------------------------

function Pre({ style, content }) {
  return <pre style={{ fontSize: "10pt", ...style }}>{`${JSON.stringify(content, null, 2)}`}</pre>
}

function Empty() {
  return null;
}

//-----------------------------------------------------------------------------

function WorkspaceTab() {
  const dispatch = useDispatch()
  const current = useSelector(state => state.workspace[state.workspace.selected])
  const { name, files, selected } = current;

  return <HBox style={{ background: "#EEE", alignItems: "center" }}>
    <Button onClick={(e) => onClose(e, dispatch)}>{`${name}:`}</Button>
    {files.map(f => <Button
      key={f.id} id={f.id}
      style={{ background: (f.id === selected.id) ? "white" : null }}
      onClick={(e) => onOpen(e, dispatch, f)}
    >
      {getName(f)}
    </Button>)}
  </HBox>

  function getName(file) {
    const doc = docByID(file.id)
    if (doc) return doc.story.name
    return file.name
  }
}

function ToolBar({ doc, info }) {
  const dispatch = useDispatch();
  const { n_words, n_chars } = info;

  return (
    <ToolBox>
      <Label>{doc.file.name}</Label>
      <Separator />
      <Label>{`Words: ${n_words}`}</Label>
      <Separator />
      <Label>{`Chars: ${n_chars}`}</Label>
      <Separator />
      <Filler />
    </ToolBox>
  )
}

function onOpen(event, dispatch, file) {
  event.stopPropagation()
  console.log("Opening:", file)
  dispatch(action.workspace.selectFile({ file }))
  dispatch(action.doc.open({ file }))
}

function onClose(e, dispatch) {
  if (e) e.preventDefault()
  // Move modifications to doc
  dispatch(action.doc.close({}))
}
