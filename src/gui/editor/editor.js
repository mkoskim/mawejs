//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/editor.css"
import "../common/styles/sheet.css"

/* eslint-disable no-unused-vars */

import React, {
  useState, useEffect, useReducer,
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

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  getEditor, SlateEditable,
  section2edit, edit2section, updateSection,
  edit2grouped,
  elem2text,
  elemsByID, hasElem,
  focusByPath, focusByID,
  elemByTypes,
  elemsByRange,
  elemPop, elemPushTo, grouped2section,
} from "./slateEditor"

import {
  SlateTOC,
} from "./slateIndex"

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup, MakeToggleGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
  Menu, MenuItem,
} from "../common/factory";

import {
  SectionWordInfo,
  ChooseVisibleElements, ChooseWordFormat,
} from "../common/components";

import { styled } from '@mui/material/styles';
import {withWordCounts} from "../../document";

//import { mawe } from "../../document";

//-----------------------------------------------------------------------------

const fs = require("../../system/localfs");

export function SingleEditView({doc, setDoc}) {

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
  //---------------------------------------------------------------------------

  //console.log("Story ID:", doc.story.uuid)

  const bodyeditor = useMemo(() => getEditor(), [])
  const noteeditor = useMemo(() => getEditor(), [])

  const [bodybuffer, _setBodyBuffer] = useState(() => section2edit(doc.story.body))
  const [notebuffer, _setNoteBuffer] = useState(() => section2edit(doc.story.notes))

  //---------------------------------------------------------------------------
  // Get updates from Slate, and apply them to doc, too
  //---------------------------------------------------------------------------

  //const [bodyFromEdit, setBodyFromEdit] = useState(() => withWordCounts(doc.story.body))
  //const [notesFromEdit, setNotesFromEdit] = useState(doc.story.notes)

  function isAstChange(editor) {
    return editor.operations.some(op => 'set_selection' !== op.type)
  }

  function updateBody(buffer) {
    //_setBodyBuffer(buffer)
    //const section = edit2section(buffer)

    if(!isAstChange(bodyeditor)) return

    setDoc(doc => ({
      ...doc,
      story: {
        ...doc.story,
        body: {
          ...doc.story.body,
          ...updateSection(doc.story.body, buffer)
          //...doc.story.body,
          //parts: section.parts
        }
      }
    }))
  }

  function updateNotes(buffer) {
    //_setNoteBuffer(buffer)
    //const section = edit2section(buffer)

    if(!isAstChange(noteeditor)) return

    setDoc(doc => ({
      ...doc,
      story: {
        ...doc.story,
        notes: updateSection(doc.story.notes, buffer)
        //notes: section.parts,
      }
    }))
  }

  const bodyFromEdit = withWordCounts(doc.story.body)
  //const bodyFromEdit = doc.story.body
  const noteFromEdit = doc.story.notes

  //---------------------------------------------------------------------------
  // Index settings: Change these to component props
  //---------------------------------------------------------------------------

  const [active, setActive] = useState("body")

  const [indexed1, setIndexed1] = useState(["scene", "synopsis"])
  const [words1, setWords1] = useState("numbers")

  const bodyindex_settings = {
    indexed: {
      choices:  ["scene", "synopsis", "missing", "comment"],
      value:    indexed1,
      setValue: setIndexed1,
    },
    words: {
      choices:  ["off", "numbers", "percent", "cumulative"],
      value:    words1,
      setValue: setWords1,
    },
  }

  const noteindex_settings = {
    indexed: {
      value: ["scene", "synopsis"],
    }
  }

  //---------------------------------------------------------------------------

  /*
  return <HBox style={{overflow: "auto"}}>
      <Slate editor={bodyeditor} value={bodybuffer} onChange={setBodyBuffer}>
      <EditorBox style={{width: "50%"}} visible={true}/>
      <Pre style={{ width: "50%" }} content={edit2grouped(bodybuffer)} />
      </Slate>
    </HBox>
  /**/
/*
  <Pre style={{ width: "50%" }} content={edited.story} />
  <Pre style={{ width: "50%" }} content={edited.story.body} />
*/

  /**/

  //---------------------------------------------------------------------------
  //console.log(`SingleEdit: id=${id} stored=${storedid} refresh=${refresh}`)

  //console.log("Edit:", id)

  //
  //*
  return <React.Fragment>
    <EditToolbar {...{bodyindex_settings, noteindex_settings, bodyFromEdit}}/>
    <HBox style={{overflow: "auto"}}>
      <DragDropContext onDragEnd={onDragEnd}>
      <Slate editor={bodyeditor} value={bodybuffer} onChange={updateBody}>
        <SlateTOC
          style={{maxWidth: "400px", width: "400px"}}
          activeID="body"
          setActive={setActive}
          wcFormat={words1}
          include={["part", ...indexed1]}
          section={bodyFromEdit}
          />
        <EditorBox mode="Regular" visible={active === "body"}/>
      </Slate>
      <Slate editor={noteeditor} value={notebuffer} onChange={updateNotes}>
        <EditorBox mode="Regular" visible={active === "notes"}/>
        <SlateTOC
          style={{maxWidth: "300px", width: "300px"}}
          activeID="notes"
          setActive={setActive}
          include={["part", "scene", "synopsis"]}
          section={noteFromEdit}
          />
      </Slate>
      </DragDropContext>
    </HBox>
    </React.Fragment>
  /*/
  return <DragDropContext onDragEnd={onDragEnd}>
    <Toolbar />
    <HFiller style={{overflow: "auto"}}>
      <Slate editor={bodyeditor} value={bodybuffer} onChange={setBodyBuffer}>
        <IndexBox
          style={{maxWidth: "400px", width: "400px"}}
          settings={bodyindex_settings}
          section={bodyWithWords}/>
        <EditorBox mode="Regular" visible={active === "body"}/>
      </Slate>
      <div style={{overflowY: "auto"}}><table><tbody>
        {bodyeditor.children
          //.filter(n => ["br.part", "br.scene"].includes(n.type))
          .map(elem => <tr key={elem.id}>
          <td>{elem.id}</td>
          <td>{elem.type}</td>
          <td>{elem2text(elem).slice(0, 20)}</td>
          </tr>)}
        </tbody></table></div>
    </HFiller>
    </DragDropContext>
  /**/

  //---------------------------------------------------------------------------
  // Index DnD
  //---------------------------------------------------------------------------

  function onDragEnd(result) {

    function getSectIDByElemID(elemID) {
      if(hasElem(bodyeditor, elemID)) return "body"
      if(hasElem(noteeditor, elemID)) return "notes"
      return undefined
    }

    function getEditor(sectID) {
      switch(sectID) {
        case "body": return bodyeditor;
        case "notes": return noteeditor;
      }
    }

    //console.log("onDragEnd:", result)

    const {type, draggableId, source, destination} = result;

    if(!destination) return;

    if(source.droppableId === destination.droppableId) {
      if(source.index === destination.index) return;
    }

    //console.log(type, source, "-->", destination)

    switch(type) {
      case "scene": {
        const srcEditID = getSectIDByElemID(source.droppableId)
        const dstEditID = getSectIDByElemID(destination.droppableId)
        const srcEdit = getEditor(srcEditID)
        const dstEdit = getEditor(dstEditID)

        elemPushTo(dstEdit,
          elemPop(srcEdit, draggableId),
          destination.droppableId,
          destination.index
        )

        setActive(dstEditID)
        focusByID(dstEdit, draggableId)
        /*
        const srcPart = findPart(source.droppableId);
        const dstPart = findPart(destination.droppableId);

        const scene = srcPart.children[source.index]
        srcPart.children.splice(source.index, 1)
        dstPart.children.splice(destination.index, 0, scene)

        update(scene.id)
        */
        break;
      }

      case "part": {
        const srcEdit = getEditor(source.droppableId)
        const dstEdit = getEditor(destination.droppableId)

        elemPushTo(dstEdit,
          elemPop(srcEdit, draggableId),
          null,
          destination.index
        )

        setActive(destination.droppableId)
        focusByID(dstEdit, draggableId)

        /*
        const srcSect = findSect(source.droppableId)
        const dstSect = findSect(destination.droppableId)

        const part = srcSect.parts[source.index]
        srcSect.parts.splice(source.index, 1)
        dstSect.parts.splice(destination.index, 0, part)

        update(part.id)
        */
        break;
      }
      default:
        console.log("Unknown draggable type:", type, result)
        return;
    }
  }
}

//-----------------------------------------------------------------------------
// Toolbar
//-----------------------------------------------------------------------------

function EditToolbar({bodyindex_settings, bodyFromEdit}) {

  return <ToolBox style={{ background: "white" }}>
    <ChooseVisibleElements elements={bodyindex_settings.indexed}/>
    <Separator/>
    <ChooseWordFormat format={bodyindex_settings.words}/>
    <Separator/>
    <SectionWordInfo sectWithWords={bodyFromEdit}/>
    <Separator/>
    <Filler/>
  </ToolBox>
}

  /*
  function EditToolbar() {
  const editor = useSlate()

  // Block type under cursor
  const [match] = Editor.nodes(editor, { match: n => Editor.isBlock(editor, n)})
  const nodetype = match ? match[0].type : undefined

  return <ToolBox style={{ background: "white" }}>
    <Button>Block: {nodetype}</Button>
    <Filler/>
  </ToolBox>
  }
*/

//-----------------------------------------------------------------------------

function EditorBox({style, mode="Condensed", visible=true}) {
  //const display = visible ? undefined : "none"

  if(!visible) return null;

  return <div className="Filler Board" style={{...style}}>
      <SlateEditable className={mode}/>
    </div>
}

//-----------------------------------------------------------------------------

/*
function IndexBox({settings, section, style}) {
  const props = {settings, section, style}

  return <SlateTOC {...props}/>
}
*/

//-----------------------------------------------------------------------------

function Pre({ style, content }) {
  return <pre style={{ fontSize: "10pt", ...style }}>
    {typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}`}
  </pre>
}

function Empty() {
  return null;
}
