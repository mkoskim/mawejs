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
  SlateEdit, getEditor, ReactEditor,
  section2edit, edit2section,
  elem2text,
} from "./slateEditor"

import {
  ViewIndex,
} from "./docIndex"

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

//-----------------------------------------------------------------------------
// Loading (temporary)
//-----------------------------------------------------------------------------

var docs = {}

function docByID(id) {
  //console.log("docByID:", id)
  //console.log("Docs:", docs)
  return docs[id]
}

function docUpdate(id, content) {
  docs[id] = content
}

async function docLoad(file) {
  console.log("docLoad:", file);
  const {id} = file;

  if(id in docs) return docs[id]

  console.log("docLoad: Loading:", file)
  try {
    const content = await mawe.load(file)
    docs[id] = content;
    //dispatch(docAction.loaded({file}))
    console.log("docLoad: Loaded", content)
    return content;
  }
  catch(err) {
    console.log(err)
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

  const [doc, setDoc] = useState(undefined)

  console.log("EditView/ID:", id)
  console.log("EditView/Doc:", doc)

  useEffect(() => {
    docLoad(id).then(content => setDoc(content))
  }, [id])

  /*
  return <VBox className="ViewPort">
    <WorkspaceTab />
    {loading ? <Loading/> : <SingleEdit id={edit.id} />}
  </VBox>
  /*/
  return <VBox className="ViewPort">
    {doc ? <SingleEdit id={id} doc={doc}/> : <Loading/>}
  </VBox>
  /**/
}

//-----------------------------------------------------------------------------
// Single edit with sidebars

function SingleEdit({id, doc}) {

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
    editor,
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
        {useDeferredValue(
          <ViewIndex
            state={state}
            doc={edited}
            />
          )}
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
