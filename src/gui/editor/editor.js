//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/editor.css"

/* eslint-disable no-unused-vars */

import React from "react"
import {
  useState, useEffect,
  useMemo, useCallback,
  StrictMode,
} from 'react';

import { useSelector, useDispatch } from "react-redux";
import { action, docByID } from "../app/store"

import {
  SlateEdit, getEditor, ReactEditor,
  section2edit, edit2section,
  elem2text,
} from "./slateEditor"

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
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
  //const [id, setID] = useState(edit.id)
  //useEffect(() => setID(edit.id), [edit.id])

  //const refresh = (id !== edit.id)

  //return <RawDoc doc={doc}/>
  //return <SlateDoc doc={doc}/>
  return <VFiller>
    <WorkspaceTab />
    {loading ? null : <SingleEdit id={edit.id} />}
  </VFiller>
}

//-----------------------------------------------------------------------------
// Single edit with sidebars

function SingleEdit({ id, left, right, center }) {

  const doc = docByID(id)

  function doc2slate() { return section2edit(doc).body; }

  //---------------------------------------------------------------------------
  // Slate uses content variable only when initializing. We need to manually
  // set children when doc changes between re-renders
  //---------------------------------------------------------------------------

  //*
  const [content, setContent] = useState(doc2slate());
  const editor = useMemo(() => getEditor(), [])

  const [storedid, setID] = useState(id)
  useEffect(() => {
    setID(id)
    const content = doc2slate();
    setContent(content)
    editor.children = content;
  }, [id])

  // TODO: We need to know what element is placed for editing

  /*
  const fromedit = edit2section(content)
  const edited = {
    ...doc,
    story: {
      ...doc.story,
      body: {
        ...doc.story.body,
        head: {...doc.story.body.head, ...fromedit.head},
        parts: fromedit.parts,
      }
    }
  }
  /**/

  //---------------------------------------------------------------------------

  const indexed = {
    "br.part": true,
    "br.scene": true,
    "synopsis": true,
    "missing": false,
    "comment": false,
  }

  //---------------------------------------------------------------------------
  //console.log(`SingleEdit: id=${id} stored=${storedid} refresh=${refresh}`)

  const dispatch = useDispatch();

  useEffect(() => addHotkeys({
    "mod+o": (e) => onClose(e, dispatch),
    "mod+w": (e) => onClose(e, dispatch),
    "mod+s": null,
  }));

  //console.log("Edit:", id)

  //*
  return (
    <HFiller style={{ overflow: "auto", background: "#F8F8F8" }}>
      <ViewIndex
        editor={editor}
        content={content}
        indexed={indexed}
        style={{ maxWidth: "350px" }}
      />
      <VFiller className="Board">
        <div>
          <SlateEdit
            className={"Sheet Shadow"}
            editor={editor}
            content={content}
            setContent={setContent}
          />
        </div>
      </VFiller>
    </HFiller>
  )

  /*/
  // For development purposes:
  return <React.Fragment>
    <HBox>
    <Pre style={{ width: "50%" }} content={doc2slate()} />
    <Pre style={{ width: "50%" }} content={doc.story} />
    </HBox>
  </React.Fragment>
  /**/

  /*
      <Pre style={{ width: "50%" }} content={edited.story.body} />
  */

  //-----------------------------------------------------------------------------
}

function ViewIndex({ editor, content, indexed, style }) {
  console.log("ViewIndex")

  return <VBox className="Outline" style={style}>
    <Separator />
    <VFiller className="Index">
      {indexElems(content).map(elem => <IndexItem key={elem.attributes.id} editor={editor} elem={elem} />)}
    </VFiller>
  </VBox>

  function indexElems(content) {
    return content ? content.filter(elem => indexed[elem.type]) : []
  }
}

function IndexTools() {
  return <ToolBox>
    <Button>Test</Button>
  </ToolBox>
}

function DocItem({ doc }) {
  const { n_words, n_chars } = { n_words: 0, n_chars: 0 };

  return (
    <HBox style={{ alignItems: "center" }}>
      <Label variant="body1" style={{ fontSize: "14pt" }}>{doc.story.name}</Label>
      <Filler />
      <Separator />
      <Label>{`Words: ${n_words}`}</Label>
      <Separator />
      <Label>{`Chars: ${n_chars}`}</Label>
      <Separator />
    </HBox>
  )
}

function IndexItem({ editor, elem }) {
  const className = addClass("Entry")
  const name = elem2text(elem)
  const id = elem.attributes.id

  return <ItemLink editor={editor} id={id}>
    <HBox className={className} style={{ alignItems: "center" }}>
      <ItemIcon type={elem.type} />
      <ItemLabel type={elem.type} name={name === "" ? "|" : name} />
    </HBox>
  </ItemLink>
}

function ItemIcon({ type }) {
  switch (type) {
    case "missing":
    case "comment":
    case "synopsis":
      //return <Icon.Circle className={type} fontSize="small"/>
      return <div className={addClass("Box", type)} />
  }
  return null
}

function ItemLabel({ type, name }) {
  return <Label className="Name" text={name} />
}

function ItemLink({ editor, id, children, ...props }) {
  return <a href={`#${id}`} onClick={e => setTimeout(() => onClick(e, id), 0)} {...props}>
    {children}
  </a>

  function onClick(e, id) {
    //console.log("onClick:", id)
    const target = document.getElementById(id)
    if(!target) {
      console.log(`Index/onClick: ID ${id} not found.`)
      return;
    }

    //console.log("- Target:", target)

    var range = document.createRange()
    var sel = window.getSelection()

    range.setStart(target, 0)
    range.collapse(true)

    sel.removeAllRanges()
    sel.addRange(range)

    ReactEditor.focus(editor)
  }
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
