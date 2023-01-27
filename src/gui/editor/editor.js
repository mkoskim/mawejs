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

/*
import { useSelector, useDispatch } from "react-redux";
import { action, docByID, docUpdate } from "../app/store"
*/

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
// Loading (temporary)
//-----------------------------------------------------------------------------

var docs = {}

export function docByID(id) {
  //console.log("docByID:", id)
  //console.log("Docs:", docs)
  return docs[id]
}

export function docUpdate(id, content) {
  docs[id] = content
}

//-----------------------------------------------------------------------------

async function docLoad(file) {
  console.log("docLoad:", file);
  const {id} = file;

  if(!(id in docs)) {
    console.log("docLoad: Loading:", file)
    //dispatch(docAction.loading({file}))
    try {
      const content = await mawe.load(file)
      docs[id] = content;
      //dispatch(docAction.loaded({file}))
      console.log("doc.open: Loaded", content)
    }
    catch(err) {
      console.log(err)
    }
  } else {
    //dispatch(docAction.loaded({file}))
  }
}

//-----------------------------------------------------------------------------
// Choose the view
//-----------------------------------------------------------------------------

export function EditView({id}) {

  // TODO: We need to wait loading here
  // TODO: If there is an error when loading, show it here
  // TODO: Get settings: general, file specific, current view, ...

  //const edit = useSelector(state => state.doc.edit)
  //const loading = useSelector(state => state.doc.loading)

  console.log("EditView:", id)

  /*
  return <VBox className="ViewPort">
    <WorkspaceTab />
    {loading ? <Loading/> : <SingleEdit id={edit.id} />}
  </VBox>
  /*/
  return <VBox className="ViewPort">
    <Loading/>
  </VBox>
  /**/
}

//-----------------------------------------------------------------------------
// Single edit with sidebars

function SingleEdit({id}) {

  const doc = docByID(id)

  /*
  // For development purposes:
  return <React.Fragment>
    <HBox>
    <Pre style={{ width: "50%" }} content={doc.story} />
    <Pre style={{ width: "50%" }} content={mawe.fromXML(mawe.buf2tree(mawe.tree2buf(mawe.toXML(slate2doc(doc, doc2slate(doc)).story))))} />
    </HBox>
  </React.Fragment>
  /**/

  /*
    <Pre style={{ width: "50%" }} content={doc2slate(doc)} />
    <EditorBox style={{width: "50%"}} editor={editor} content={content} setContent={setContent}/>
    <Pre style={{ width: "50%" }} content={edited.story} />
      <Pre style={{ width: "50%" }} content={edited.story.body} />
  */

  //---------------------------------------------------------------------------
  // TODO: We need to know what element is placed for editing
  //---------------------------------------------------------------------------

  function doc2slate(doc) {
    return section2edit(doc).body;
  }

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
    //docUpdate(id, edited)
  }

  /**/

  //---------------------------------------------------------------------------
  //console.log(`SingleEdit: id=${id} stored=${storedid} refresh=${refresh}`)

  //const dispatch = useDispatch();
  //const cwd = useSelector(state => state.cwd.path)

  useEffect(() => addHotkeys({
    //"mod+o": (e) => onClose(e, dispatch),
    //"mod+w": (e) => onClose(e, dispatch),
    //"mod+s": (e) => mawe.saveas(docByID(id), path.join(cwd, "/testwrite.mawe")),
  }));

  //console.log("Edit:", id)

  //*
  return (
    <HFiller style={{overflow: "auto"}}>
      <VFiller style={{maxWidth: "300px", borderRight: "1px solid lightgray" }}>
        <ViewIndex
          editor={editor}
          doc={edited}
          state={state}
        />
      </VFiller>
      <EditorBox
        editor={editor}
        state={state}
        mode="Regular"
        />
    </HFiller>
  )
  /*/
  return (
    <EditorBox
      editor={editor}
      state={state}
      />
  )
  /**/
}

//-----------------------------------------------------------------------------

function EditorBox({style, mode="Condensed", editor, state}) {
  return <VFiller style={{overflow: "auto", ...style}}>
    <EditToolbar />
    <div className="Board">
        <SlateEdit
        className={mode}
        editor={editor}
        content={state.content}
        setContent={state.setContent}
        />
    </div>
  </VFiller>
}

function EditToolbar() {
  return <ToolBox style={{ background: "white" }}>
    <Button>Test</Button>
    <Filler/>
    <Button><Icon.Settings /></Button>
  </ToolBox>
}

//-----------------------------------------------------------------------------

function ViewIndex({ editor, style, state}) {
  //console.log("ViewIndex")
  //console.log("- Indexed:", state.indexed)

  // TODO: Make index from document, not from slate children

  return <VBox className="Outline" style={style}>
    <IndexToolbar state={state}/>
    <VFiller className="Index">
      {indexElems(state.content).map(elem => <IndexItem key={elem.id} editor={editor} elem={elem} />)}
    </VFiller>
  </VBox>

  function indexElems(content) {
    return content ? content.filter(elem => state.indexed.includes(elem.type)) : []
  }
}

//-----------------------------------------------------------------------------

function IndexToolbar({state}) {
  return <ToolBox style={{ background: "white" }}>
    <Button>Test</Button>
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
  const id = elem.id

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
  return <pre style={{ fontSize: "10pt", ...style }}>
    {typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}`}
  </pre>
}

function Empty() {
  return null;
}

//-----------------------------------------------------------------------------

/*
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
*/
