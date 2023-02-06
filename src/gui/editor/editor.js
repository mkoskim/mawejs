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
  SlateTOC,
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
import {withWordCounts} from "../../document";

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
  //*
  return <VFiller>
    <ToolBox>Placeholder: Workspace</ToolBox>
    <SingleEditView id={id} doc={doc}/>
    </VFiller>
  /*/
  return <SingleEditView id={id} doc={doc}/>
  /**/
}

function SingleEditView({id, doc}) {

  //---------------------------------------------------------------------------
  // For development purposes:
  //---------------------------------------------------------------------------

  /*
  return <React.Fragment>
    <HBox>
    <Pre style={{ width: "50%" }} content={doc.story} />
    <Pre style={{ width: "50%" }} content={mawe.fromXML(mawe.buf2tree(mawe.tree2buf(mawe.toXML(slate2doc(doc, doc2slate(doc)).story))))} />
    </HBox>
  </React.Fragment>
  /**/

  /*
  return <Pre content={doc.story.notes} />
  /**/

  //---------------------------------------------------------------------------
  // slate buffers

  const [body_buffer, setBodyBuffer] = useState(section2edit(doc.story.body))
  const [note_buffer, setNoteBuffer] = useState(section2edit(doc.story.notes))

  // Update doc from buffers

  const bodyFromEdit  = edit2section(body_buffer)
  const bodyWithWords = withWordCounts(bodyFromEdit)
  const notesFromEdit = edit2section(note_buffer)

  const edited = {
    ...doc,
    story: {
      ...doc.story,
      notes: {
        ...doc.story.notes,
        parts: notesFromEdit.parts,
      },
      body: {
        ...doc.story.body,
        head: {...doc.story.body.head, ...bodyFromEdit.head},
        parts: bodyFromEdit.parts,
      }
    }
  }

  docUpdate(edited);

  //---------------------------------------------------------------------------
  // Slate uses content variable only when initializing. We need to manually
  // set children when doc changes between re-renders
  //---------------------------------------------------------------------------

  const bodyeditor = useMemo(() => getEditor(), [])
  const noteeditor = useMemo(() => getEditor(), [])

  //---------------------------------------------------------------------------
  // TODO: Separate settings for different indices
  //---------------------------------------------------------------------------

  const [_state, setState] = useState({
    //id,
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
    //setID: id => setState({...state, id}),
    setContent: content => setState({...state, content}),
    setIndexed: indexed => setState({...state, indexed}),
    setWordsAs: wordsAs => setState({...state, wordsAs})
  }

  const noteindex_settings = {
    indexed: [
      "br.part",
      "br.scene",
      "synopsis",
      //"missing",
      //"comment",
    ],
    wordsAs: "off",
  }

  useEffect(() => addHotkeys({
    //"mod+o": (e) => onClose(e, dispatch),
    //"mod+w": (e) => onClose(e, dispatch),
    //"mod+s": (e) => mawe.saveas(docByID(id), path.join(cwd, "/testwrite.mawe")),
    "mod+s": (e) => docSave(edited),
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
    <HFiller style={{overflow: "auto"}}>
      <Slate editor={bodyeditor} value={body_buffer} onChange={setBodyBuffer}>
        <IndexBox state={state} section={bodyWithWords}/>
        <EditorBox mode="Regular"/>
      </Slate>
      <Slate editor={noteeditor} value={note_buffer} onChange={setNoteBuffer}>
        <EditorBox mode="Regular" visible={false}/>
        <IndexBox state={noteindex_settings} section={notesFromEdit}/>
      </Slate>
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

function DeferredRender(props) {
  //return props.children
  return useDeferredValue(props.children)
}

//-----------------------------------------------------------------------------

function EditorBox({style, visible=true, mode="Condensed"}) {
  //const display = visible ? undefined : "none"

  if(!visible) return null;

  return <VBox style={{...style}}>
    <EditToolbar />
    <div className="Board">
      <SlateEditable className={mode}/>
    </div>
  </VBox>
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
  </ToolBox>
}

//-----------------------------------------------------------------------------

function IndexBox({state, section}) {
  const props = {state, section}

  return <DeferredRender>
    <SlateTOC {...props}/>
    </DeferredRender>
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
