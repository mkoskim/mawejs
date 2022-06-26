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
import { action, docByID, docUpdate } from "../app/store"

import {
  SlateEdit, getEditor, ReactEditor,
  section2edit, edit2section,
  elem2text,
} from "./slateEditor"

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
} from "../common/factory";

import { styled } from '@mui/material/styles';
import { mawe } from "../../document";
const path = require("path")

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
    {loading ? <Loading/> : <SingleEdit id={edit.id} />}
  </VFiller>
}

//-----------------------------------------------------------------------------
// Single edit with sidebars

function SingleEdit({id}) {

  //---------------------------------------------------------------------------
  // TODO: We need to know what element is placed for editing
  //---------------------------------------------------------------------------

  function doc2slate(doc) { return section2edit(doc).body; }
  function slate2doc(doc, content) {
    const fromedit = edit2section(content)
    return {
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
  }

  //---------------------------------------------------------------------------
  // Slate uses content variable only when initializing. We need to manually
  // set children when doc changes between re-renders
  //---------------------------------------------------------------------------

  const doc = docByID(id)

  const editor = useMemo(() => getEditor(), [])

  const [_state, setState] = useState({
    id,
    content: doc2slate(doc),
    indexed: [
      "br.part",
      "br.scene",
      "synopsis",
      //"missing",
      //"comment",
    ],
    wordsAs: "numbers",
  })

  const state = {
    ..._state,
    setContent: content => setState({...state, content}),
    setID: id => setState({...state, id}),
    setIndexed: (indexed) => setState({...state, indexed}),
    setWordsAs: (wordsAs) => setState({...state, wordsAs})
  }

  //*

  useEffect(() => {
    state.setID(id)
    const content = doc2slate(doc);
    state.setContent(content)
    editor.children = content;
  }, [id])

  const edited = slate2doc(doc, state.content)
  if(state.id === id) {
    //console.log("Update:", id, doc.story.name, content)
    docUpdate(id, edited)
  }

  /**/

  //---------------------------------------------------------------------------
  //console.log(`SingleEdit: id=${id} stored=${storedid} refresh=${refresh}`)

  const dispatch = useDispatch();
  const cwd = useSelector(state => state.cwd.path)

  useEffect(() => addHotkeys({
    "mod+o": (e) => onClose(e, dispatch),
    "mod+w": (e) => onClose(e, dispatch),
    "mod+s": (e) => mawe.saveas(docByID(id), path.join(cwd, "/testwrite.mawe")),
  }));

  //console.log("Edit:", id)

  //*
  return (
    <HFiller style={{overflow: "auto", background: "#F6F7F8"}}>
      <VFiller style={{maxWidth: "300px", borderRight: "1px solid lightgray" }}>
        <ViewIndex
          editor={editor}
          state={state}
        />
      </VFiller>
      <EditorBox
        editor={editor}
        state={state}
        />
    </HFiller>
  )

  /*/
  // For development purposes:
  return <React.Fragment>
    <HBox>
    <Pre style={{ width: "50%" }} content={edited.story} />
    <EditorBox style={{width: "50%"}} editor={editor} content={content} setContent={setContent}/>
    </HBox>
  </React.Fragment>
  /**/

  /*
    <Pre style={{ width: "50%" }} content={doc.story} />
      <Pre style={{ width: "50%" }} content={edited.story.body} />
  */

  //---------------------------------------------------------------------------
}

//-----------------------------------------------------------------------------

function EditorBox({style, mode="Regular", editor, state}) {
  return <VFiller style={style}>
  <EditToolbar />
  <VFiller className="Board">
    <div>
      <SlateEdit
        className={addClass(mode, "Sheet")}
        //className="Condensed Sheet"
        editor={editor}
        content={state.content}
        setContent={state.setContent}
      />
    </div>
  </VFiller>
  </VFiller>
}

function EditToolbar() {
  return <ToolBox style={{ background: "white" }}>
    <Button size="small">Test</Button>
  </ToolBox>
}

//-----------------------------------------------------------------------------

function ViewIndex({ editor, style, state}) {
  //console.log("ViewIndex")
  //console.log("- Indexed:", state.indexed)

  return <VBox className="Outline" style={style}>
    <IndexToolbar state={state}/>
    <VFiller className="Index">
      {indexElems(state.content).map(elem => <IndexItem key={elem.attributes.id} editor={editor} elem={elem} />)}
    </VFiller>
  </VBox>

  function indexElems(content) {
    return content ? content.filter(elem => state.indexed.includes(elem.type)) : []
  }
}

//-----------------------------------------------------------------------------

function IndexToolbar({state}) {
  return <ToolBox style={{ background: "white" }}>
    <Button size="small">Test</Button>
    <Filler />
    <Separator />
    <BorderlessToggleButtonGroup value={state.indexed} onChange={(e, value) => state.setIndexed(value)}>
      <ToggleButton value="missing"><Tooltip title="Show missing"><Icon.BlockType.Missing /></Tooltip></ToggleButton>
      <ToggleButton value="comment"><Tooltip title="Show comments"><Icon.BlockType.Comment /></Tooltip></ToggleButton>
    </BorderlessToggleButtonGroup>
    <Separator />
    <BorderlessToggleButtonGroup exclusive value={state.wordsAs} onChange={(e, value) => state.setWordsAs(value)}>
    <ToggleButton value="off">
      <Tooltip title="Don't show words"><Icon.StatType.Off /></Tooltip></ToggleButton>
      <ToggleButton value="numbers"><Tooltip title="Words as numbers"><Icon.StatType.Words /></Tooltip></ToggleButton>
      <ToggleButton value="percent"><Tooltip title="Words as percent"><Icon.StatType.Percent /></Tooltip></ToggleButton>
      <ToggleButton value="cumulative"><Tooltip title="Words as cumulative percent"><Icon.StatType.Cumulative /></Tooltip></ToggleButton>
    </BorderlessToggleButtonGroup>
  </ToolBox>
}

const BorderlessToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    padding: "1pt",
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

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

  /*
  return <ItemLabel type={elem.type} name={name === "" ? "|" : name} />
  /*/
  return <ItemLink editor={editor} id={id}>
    <HBox className={className} style={{ alignItems: "center" }}>
      <ItemIcon type={elem.type} />
      <ItemLabel type={elem.type} name={name === "" ? "|" : name} />
    </HBox>
  </ItemLink>
  /**/
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
  return <a href={`#${id}`} onClick={e => setTimeout(() => onItemClick(e, editor, id), 0)} {...props}>
    {children}
  </a>

  function onItemClick(e, editor, id) {
    //console.log("onClick:", id)
    const target = document.getElementById(id)
    if (!target) {
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

  return <HBox style={{background: "#EEE", alignItems: "center"}}>
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
