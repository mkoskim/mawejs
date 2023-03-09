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
  section2edit, updateSection,
  hasElem,
  focusByPath, focusByID,
  elemPop, elemPushTo,
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
  DataGrid,
} from "../common/factory";

import {
  SectionWordInfo,
  ChooseVisibleElements, ChooseWordFormat,
} from "../common/components";

import { styled } from '@mui/material/styles';
import {sleep} from "../../util";
import {section2words, createWordTable} from "../../document/util";

//import { mawe } from "../../document";

//-----------------------------------------------------------------------------

export function SingleEditView({doc, setDoc, focusTo, setFocusTo}) {

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

  //console.log(doc.story.body)
  //console.log(bodybuffer)

  //---------------------------------------------------------------------------
  // Get updates from Slate, and apply them to doc, too
  //---------------------------------------------------------------------------

  const updateBody = useCallback(buffer => {
    if(isAstChange(bodyeditor)) setDoc(doc => {
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
  }, [bodyeditor])

  const updateNotes = useCallback(buffer => {
    if(isAstChange(noteeditor)) setDoc(doc => {
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
  }, [noteeditor])

  //---------------------------------------------------------------------------
  // Section selection
  //---------------------------------------------------------------------------

  const [active, _setActive] = useState(focusTo?.sectID ?? "body")

  //console.log("ActiveID:", active)

  const setActive = useCallback((sectID, elemID) => {
    //console.log("setActive:", sectID, elemID)
    _setActive(sectID)
    setFocusTo({id: elemID})
  })

  const activeEdit = useCallback(() => {
    switch(active) {
      case "body": return bodyeditor
      case "notes": return noteeditor
    }
  }, [active])

  useEffect(() => {
    const editor = activeEdit()
    const id = focusTo?.id
    console.log("Focus to:", id)
    if(editor) focusByID(editor, id)
  }, [active, focusTo])

  //---------------------------------------------------------------------------
  // Search
  //---------------------------------------------------------------------------

  const [searchText, _setSearchText] = useState()
  const highlightText = useDeferredValue(searchText)

  const setSearchText = useCallback(text => {
    _setSearchText(text)
    searchFirst(activeEdit(), text)
  }, [activeEdit])

  //---------------------------------------------------------------------------
  // Index settings: Change these to component props
  //---------------------------------------------------------------------------

  const [indexed1, setIndexed1] = useState(["part", "scene", "synopsis"])
  const [words1, setWords1] = useState("numbers")

  const [indexed2, setIndexed2] = useState(["part", "scene", "synopsis"])

  //---------------------------------------------------------------------------
  // Render elements: what we want is to get menu items from subcomponents to
  // the toolbar.

  const [selectRight, setSelectRight] = useState("noteindex")

  const leftstyle  = {maxWidth: "400px", width: "400px"}
  //const right = RightPanel({style: })
  const rightstyle = {maxWidth: "300px", width: "300px"}

  //---------------------------------------------------------------------------

  const settings = {
    doc,
    selectRight,
    setSelectRight,
    searchText,
    highlightText,
    setSearchText,
    activeID: active,
    setActive,
    body: {
      indexed: indexed1,
      setIndexed: setIndexed1,
      words: words1,
      setWords: setWords1
    },
    notes: {
      indexed: indexed2,
      setIndexed: setIndexed2,
    }
  }

  //---------------------------------------------------------------------------
  // Hotkeys
  //---------------------------------------------------------------------------

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
    <ToolBox style={{ background: "white" }}>
      <LeftPanelMenu style={leftstyle} settings={settings}/>
      <Separator/>
      <Searching editor={activeEdit()} searchText={searchText} setSearchText={setSearchText}/>
      <Filler/>
      <Separator/>
      <SectionWordInfo sectWithWords={doc.story.body}/>
      <Separator/>
      <RightPanelMenu style={rightstyle} settings={settings}/>
    </ToolBox>
    <HBox style={{overflow: "auto"}}>
      <DragDropContext onDragEnd={onDragEnd}>
      <LeftPanel style={leftstyle} settings={settings}/>
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
      <RightPanel style={rightstyle} settings={settings} />
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
      if(!elemID) return undefined
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

//---------------------------------------------------------------------------
// Left panels
//---------------------------------------------------------------------------

function LeftPanelMenu({style, settings}) {
  const {width, minWidth, maxWidth} = style
  const menustyle={width, minWidth, maxWidth}

  return <HBox style={menustyle}>
    <ChooseVisibleElements
      choices={["scene", "synopsis", "missing", "comment"]}
      selected={settings.body.indexed}
      setSelected={settings.body.setIndexed}
    />
    <Separator/>
    <ChooseWordFormat
      choices={["off", "numbers", "percent", "cumulative"]}
      selected={settings.body.words}
      setSelected={settings.body.setWords}
    />
  </HBox>
}

function LeftPanel({style, settings}) {
  const {doc, setActive} = settings

  return <SlateTOC
    style={style}
    section={doc.story.body}
    include={settings.body.indexed}
    wcFormat={settings.body.words}
    activeID="body"
    setActive={setActive}
  />
}

//---------------------------------------------------------------------------
// Right panels
//---------------------------------------------------------------------------

function RightPanelMenu({style, settings}) {
  const {selectRight, setSelectRight} = settings

  const {width, minWidth, maxWidth} = style
  const menustyle={width, minWidth, maxWidth}

  switch(selectRight) {
    case "noteindex":
    case "wordtable":
      return <HBox style={menustyle}>
        <Filler />
        <ChooseRightPanel selected={selectRight} setSelected={setSelectRight}/>
        </HBox>
    default: break;
  }
  return null
}

function RightPanel({style, settings}) {
  const {doc, selectRight, setActive, setSearchText} = settings

  switch(selectRight) {
    case "noteindex":
      return <SlateTOC
        style={style}
        section={doc.story.notes}
        include={settings.notes.indexed}
        wcFormat={settings.notes.words}
        activeID="notes"
        setActive={setActive}
      />
    case "wordtable":
      return <WordTable
        style={style}
        section={doc.story.body}
        setSearchText={setSearchText}
      />
    default: break;
  }
}

//-----------------------------------------------------------------------------
// Wordtable
//-----------------------------------------------------------------------------

function WordTable({style, section, setSearchText}) {
  //console.log(doc.story.body.words)

  const wt = Array.from(createWordTable(section).entries()).map(([word, count]) => ({id: word, count}))
  //console.log(wt)

  // Use this to test performance of table generation
  /*
  return <VBox style={style}>
    Testing, testing...
  </VBox>
  /*/
  return <VBox style={style}>
    <DataGrid
    //style={style}
    onRowClick={params => setSearchText(params.row.id)}
    //throttleRowsMs={500}
    //width="100%"
    density="compact"
    columns={[
      {
        field: "id",
        headerName: "Word",
      },
      {
        field: "count",
        headerName: "Count",
        align: "right", headerAlign: "right",
      }
    ]}
    rows={wt}
  />
  </VBox>
  /**/
}

//-----------------------------------------------------------------------------
// Toolbar
//-----------------------------------------------------------------------------

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

class Searching extends React.PureComponent {

  render() {
    const {editor, searchText, setSearchText} = this.props

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
}

class ChooseRightPanel extends React.PureComponent {

  buttons = {
    "noteindex": {
      tooltip: "Notes Index",
      icon: <Icon.Placeholder />
    },
    "wordtable": {
      tooltip: "Word frequeny",
      icon: <Icon.Placeholder />
    },
  }

  render() {
    const {selected, setSelected} = this.props

    return <MakeToggleGroup
      buttons={this.buttons}
      choices={["noteindex", "wordtable"]}
      selected={selected}
      setSelected={setSelected}
      exclusive={true}
    />
  }
}

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
