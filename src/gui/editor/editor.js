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
  SlateEdit, section2edit,
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

import { ViewSection } from "./organizer"

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

  const [content, setContent] = useState(section2edit(doc).body);

  const info = getinfo(content)

  const dispatch = useDispatch();

  useEffect(() => addHotkeys({
    "mod+o": (e) => onClose(e, dispatch),
    "mod+w": (e) => onClose(e, dispatch),
    "mod+s": null,
  }));

  //console.log("Edit:", id)

  //*
  return <React.Fragment>
    <ToolBar doc={doc} info={info} />
    <HFiller style={{ overflow: "auto", background: "#F8F8F8" }}>
      <ViewSection
        section={doc.story.body}
        style={{ width: "25%", maxWidth: "25%", background: "#EEE" }}
      />
      <VFiller className="Board"><div>
        <SlateEdit className={"Sheet Shadow"} content={content} setContent={setContent} />
      </div></VFiller>
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
