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
  searchFirst, searchForward, searchBackward,
  isAstChange,
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
  isHotkey,
} from "../common/factory";

import {
  SectionWordInfo,
  ChooseVisibleElements, ChooseWordFormat,
} from "../common/components";

import { styled } from '@mui/material/styles';
import {withWordCounts} from "../../document";
import {sleep} from "../../util";

//import { mawe } from "../../document";

//-----------------------------------------------------------------------------

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

  const updateBody = useCallback(buffer => {
    //return
    //_setBodyBuffer(buffer)
    //const section = edit2section(buffer)

    if(!isAstChange(bodyeditor)) return

    //*
    setDoc(doc => {
      const updated = updateSection(buffer, doc.story.body)
      //console.log(updated)
      return {
        ...doc,
        story: {
          ...doc.story,
          body: updated,
        }
      }
    })
    /**/
  }, [bodyeditor])

  const updateNotes = useCallback(buffer => {
    //_setNoteBuffer(buffer)
    //const section = edit2section(buffer)

    if(!isAstChange(noteeditor)) return

    //*
    setDoc(doc => {
      const updated = updateSection(buffer, doc.story.notes)
      //console.log(updated)
      return {
        ...doc,
        story: {
          ...doc.story,
          notes: updated,
        }
      }
    })
    /**/
    //setNoteFromEdit(updated)
  }, [noteeditor])

  //---------------------------------------------------------------------------
  // Index settings: Change these to component props
  //---------------------------------------------------------------------------

  const [active, _setActive] = useState("body")
  const [focusTo, _setFocusTo] = useState(undefined)

  const setActive = useCallback((sectID, elemID) => {
    console.log("setActive:", sectID, elemID)
    _setActive(sectID)
    _setFocusTo({id: elemID})
  })

  const activeEdit = useCallback(() => {
    switch(active) {
      case "body": return bodyeditor
      case "notes": return noteeditor
    }
  }, [active])

  useEffect(() => {
    const editor = activeEdit()
    console.log("Focus to:", active, focusTo)
    focusByID(editor, focusTo && focusTo.id)
  }, [active, focusTo])

  const [indexed1, setIndexed1] = useState(["part", "scene", "synopsis"])
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

  const [indexed2, setIndexed2] = useState(["part", "scene", "synopsis"])

  const noteindex_settings = {
    indexed: {
      value: indexed2,
    }
  }

  //---------------------------------------------------------------------------
  // Search
  //---------------------------------------------------------------------------

  const [searchText, _setSearchText] = useState()
  const highlightText = useDeferredValue(searchText)

  const setSearchText = useCallback(text => {
    _setSearchText(text)
    searchFirst(activeEdit(), text)
  }, [activeEdit])

  useEffect(() => addHotkeys({
    "mod+f": ev => {
      const editor = activeEdit()
      const focused = ReactEditor.isFocused(editor)
      if(focused) {
        const {selection} = editor
        if(selection) {
          const text = Editor.string(editor, selection)
          if(text) {
            Transforms.select(editor, Range.start(selection))
            _setSearchText(text)
            return;
          }
        }
      }
      if(typeof(searchText) !== "string") _setSearchText("")
    },
    "escape": ev => {
      if(typeof(searchText) === "string") {
        _setSearchText(undefined)
        ReactEditor.focus(activeEdit())
      }
    },
    "mod+g": ev => searchForward(activeEdit(), searchText, true),
    "shift+mod+g": ev => searchBackward(activeEdit(), searchText, true)
  }));

  //---------------------------------------------------------------------------
  // When component is mounted, move focus to start of text in editor

  //useEffect(() => { focusByPath(activeEdit(), {path: [0], offset: 0})})

  //---------------------------------------------------------------------------
  // Debug/development view

  /*
  return <>
    <EditToolbar {...{bodyindex_settings, noteindex_settings, bodyFromEdit, searchText, setSearchText}}/>
    <HBox style={{overflow: "auto"}}>
      <Slate editor={bodyeditor} value={bodybuffer} onChange={updateBody}>
        <EditorBox mode="Condensed" visible={active === "body"} search={searchText}/>
        <SlateAST />
      </Slate>
    </HBox>
    </>
  /**/

  //---------------------------------------------------------------------------

  return <>
    <EditToolbar
      editor={activeEdit()}
      searchText={searchText}
      setSearchText={setSearchText}
      section={doc.story.body}
      {...{bodyindex_settings, noteindex_settings}}
      />
    <HBox style={{overflow: "auto"}}>
      <DragDropContext onDragEnd={onDragEnd}>
      <SlateTOC
        //editor={bodyeditor}
        style={{maxWidth: "400px", width: "400px"}}
        section={doc.story.body}
        include={indexed1}
        wcFormat={words1}
        activeID="body"
        setActive={setActive}
        />
      <EditorBox
        editor={bodyeditor}
        value={bodybuffer}
        onChange={updateBody}
        mode="Regular"
        visible={active === "body"}
        highlight={highlightText}
        />
      <EditorBox
        editor={noteeditor}
        value={notebuffer}
        onChange={updateNotes}
        mode="Regular"
        visible={active === "notes"}
        highlight={highlightText}
        />
      <SlateTOC
        //editor={noteeditor}
        style={{maxWidth: "300px", width: "300px"}}
        section={doc.story.notes}
        include={indexed2}
        activeID="notes"
        setActive={setActive}
        />
      </DragDropContext>
    </HBox>
    </>

  //---------------------------------------------------------------------------
  // Index DnD
  //---------------------------------------------------------------------------

  function onDragEnd(result) {

    //console.log("onDragEnd:", result)

    const {type, draggableId, source, destination} = result;

    if(!destination) return;

    if(source.droppableId === destination.droppableId) {
      if(source.index === destination.index) return;
    }

    //console.log(type, source, "-->", destination)

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

    function moveElem(srcEdit, srcId, dstEditID, dstEdit, dstId, dstIndex) {
      elemPushTo(dstEdit,
        elemPop(srcEdit, srcId),
        dstId,
        dstIndex
      )

      setActive(dstEditID, draggableId)
    }

    switch(type) {
      case "scene": {
        const srcEditID = getSectIDByElemID(source.droppableId)
        const dstEditID = getSectIDByElemID(destination.droppableId)
        const srcEdit = getEditor(srcEditID)
        const dstEdit = getEditor(dstEditID)

        moveElem(srcEdit, draggableId, dstEditID, dstEdit, destination.droppableId, destination.index)
        break;
      }

      case "part": {
        const srcEditID = source.droppableId
        const dstEditID = destination.droppableId
        const srcEdit = getEditor(srcEditID)
        const dstEdit = getEditor(dstEditID)

        moveElem(srcEdit, draggableId, dstEditID, dstEdit, null, destination.index)
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

function Searching({editor, searchText, setSearchText}) {
  if(typeof(searchText) !== "string") return <Button>
    <Icon.Action.Search onClick={ev => setSearchText("")}/>
  </Button>
  return <SearchBox
    key={searchText}
    size="small"
    value={searchText}
    autoFocus
    onChange={ev => setSearchText(ev.target.value)}
    onKeyDown={ev => {
      if(isHotkey("enter", ev)) {
        ev.preventDefault();
        ev.stopPropagation();
        if(searchText === "") setSearchText(undefined)
        searchFirst(editor, searchText, true)
      }
    }}
  />
}

function EditToolbar({bodyindex_settings, editor, section, searchText, setSearchText}) {

  return <ToolBox style={{ background: "white" }}>
    <ChooseVisibleElements elements={bodyindex_settings.indexed}/>
    <Separator/>
    <ChooseWordFormat format={bodyindex_settings.words}/>
    <Separator/>
    <SectionWordInfo sectWithWords={section}/>
    <Separator/>
    <Searching editor={editor} searchText={searchText} setSearchText={setSearchText}/>
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

function EditorBox({style, editor, value, onChange, mode="Condensed", visible=true, highlight=undefined}) {
  return <Slate editor={editor} value={value} onChange={onChange}>
    {visible
    ? <div className="Filler Board" style={{...style}}>
        <SlateEditable className={mode} highlight={highlight}/>
      </div>
    : null}
    </Slate>
}

//-----------------------------------------------------------------------------

/*
function IndexBox({settings, section, style}) {
  const props = {settings, section, style}

  return <SlateTOC {...props}/>
}
*/

//-----------------------------------------------------------------------------

function SlateAST({}) {
  const editor = useSlate()

  return <Pre style={{ width: "50%" }} content={editor.children} />
}

function Pre({ style, content }) {
  return <pre style={{ fontSize: "10pt", ...style }}>
    {typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}`}
  </pre>
}

function Empty() {
  return null;
}
