//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/editor.css"

/* eslint-disable no-unused-vars */

import React, {
  useState, useEffect,
  useMemo, useCallback,
  useDeferredValue,
  StrictMode,
} from 'react';

import {
  Slate, useSlate, ReactEditor,
} from "slate-react"

import {
  Editor, Node, Transforms, Range, Point,
} from "slate";

import {
  getEditor, SlateEditable,
  section2edit, edit2section,
  elem2text,
} from "./slateEditor"

import {
  SlateIndex,
} from "./slateIndex"

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
import {docLoad, docSave, docUpdate} from "./doc"

//import { mawe } from "../../document";

//-----------------------------------------------------------------------------
// Single edit with sidebars

export function SingleEdit({id}) {
  const [doc, setDoc] = useState(undefined)

  useEffect(() => {
    console.log("SingleEdit: Updating doc...")
    if(id) docLoad(id)
      .then(content => setDoc(content))
  }, [id])

  if(!doc) return <Loading/>
  return <SingleEditView id={id} doc={doc}/>
}

function SingleEditView({id, doc}) {

  //const {id, doc} = upstate;
  //const id = doc.file.id;

  //const doc = docByID(id)
  //console.log("Doc:", doc)

  /*
  // For development purposes:
  return <React.Fragment>
    <HBox>
    <Pre style={{ width: "50%" }} content={doc.story} />
    <Pre style={{ width: "50%" }} content={mawe.fromXML(mawe.buf2tree(mawe.tree2buf(mawe.toXML(slate2doc(doc, doc2slate(doc)).story))))} />
    </HBox>
  </React.Fragment>
  /**/

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
      //"synopsis",
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
    docUpdate(edited)
  }

  useEffect(() => addHotkeys({
    //"mod+o": (e) => onClose(e, dispatch),
    //"mod+w": (e) => onClose(e, dispatch),
    //"mod+s": (e) => mawe.saveas(docByID(id), path.join(cwd, "/testwrite.mawe")),
    "mod+s": (e) => docSave(doc),
  }));

  /*
  return <Slate editor={editor} value={state.content} onChange={state.setContent}>
    <EditorBox style={{width: "50%"}}/>
    <Pre style={{ width: "50%" }} content={state.content} />
    </Slate>
  /**/
/*
  <Pre style={{ width: "50%" }} content={edited.story} />
  <Pre style={{ width: "50%" }} content={edited.story.body} />
*/

  /**/

  //---------------------------------------------------------------------------
  //console.log(`SingleEdit: id=${id} stored=${storedid} refresh=${refresh}`)

  //console.log("Edit:", id)

  //*
  return (
    <Slate editor={editor} value={state.content} onChange={state.setContent}>
    <HFiller>
      <DeferredRender><SlateIndex
        state={state}
        doc={edited}
        style={{minWidth: "400px", maxWidth: "400px"}}
        /></DeferredRender>
      <EditorBox mode="Regular"/>
    </HFiller>
    </Slate>
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

function DeferredRender(props) {
  //return props.children
  return useDeferredValue(props.children)
}

//-----------------------------------------------------------------------------

function EditorBox({style, mode="Condensed"}) {
  return <VFiller style={{...style}}>
    <EditToolbar />
    <div className="Board">
      <SlateEditable className={mode}/>
    </div>
  </VFiller>
}

function EditToolbar() {
  const editor = useSlate()

  // Block type under cursor
  const [match] = Editor.nodes(editor, { match: n => Editor.isBlock(editor, n)})
  const nodetype = match ? match[0].type : undefined

  /*
  if(match) {
    const [node, path] = match;
    console.log(node)
  }
  */

  return <ToolBox style={{ background: "white" }}>
    <Button>Block: {nodetype}</Button>
    <Filler/>
    <Button><Icon.Settings /></Button>
  </ToolBox>
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
