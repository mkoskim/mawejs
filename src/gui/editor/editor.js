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
import {docLoad, docSave, docUpdate, docByID} from "./doc"

//import { mawe } from "../../document";

//-----------------------------------------------------------------------------
// Single edit with sidebars

export function SingleEdit({id, doc}) {

  //const {id, doc} = upstate;

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
      "missing",
      "comment",
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
    docUpdate(id, edited)
  }

  /**/

  //---------------------------------------------------------------------------
  //console.log(`SingleEdit: id=${id} stored=${storedid} refresh=${refresh}`)

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
