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
  memo, useMemo, useCallback,
  useDeferredValue,
  StrictMode,
  useRef,
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
  dndElemPop, dndElemPushTo,
  searchFirst, searchForward, searchBackward,
  isAstChange,
} from "./slateEditor"

import {DocIndex} from "../common/docIndex"
import {WordTable} from "./wordTable"

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
  DeferredRender,
} from "../common/factory";

import {
  SectionWordInfo,
  ChooseVisibleElements, ChooseWordFormat,
} from "../common/components";
import { mawe } from "../../document";

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

  const searchBoxRef = useRef(null)
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

  //---------------------------------------------------------------------------

  const settings = {
    doc,
    setDoc,
    selectRight,
    setSelectRight,
    searchBoxRef,
    searchText,
    highlightText,
    setSearchText,
    activeID: active,
    setActive,
    focusTo,
    setFocusTo,
    body: {
      indexed: indexed1,
      setIndexed: setIndexed1,
      words: words1,
      setWords: setWords1,
      editor: bodyeditor,
      buffer: bodybuffer,
      onChange: updateBody,
      },
    notes: {
      indexed: indexed2,
      setIndexed: setIndexed2,
      editor: noteeditor,
      buffer: notebuffer,
      onChange: updateNotes,
    },
    leftstyle:    {maxWidth: "400px", width: "400px"},
    rightstyle:   {maxWidth: "300px", width: "300px"},
  }

  //---------------------------------------------------------------------------
  // Hotkeys
  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys({
    "mod+f": ev => {
      const editor = activeEdit()
      const {selection} = editor
      //console.log(selection)

      if(selection && !Range.isCollapsed(selection)) {
        const text = Editor.string(editor, selection)
        //console.log(text)
        if(text) {
          Transforms.select(editor, {
            focus: Range.start(selection),
            anchor: Range.end(selection)
          })
          setSearchText(text)
        }
      }
      else {
        if(typeof(searchText) !== "string") setSearchText("")
      }
      if(searchBoxRef.current) searchBoxRef.current.focus()
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
    <HBox style={{overflow: "auto"}}>
      <EditorBox settings={settings} mode="Regular"/>
      <SlateAST editor={bodyeditor}/>
    </HBox>
    </>
  /**/

  /*
  return <>
  <HBox style={{overflow: "auto"}}>
    <EditorBox settings={settings} mode="Regular"/>
    <Pre style={{width: "50%"}} content={bodyeditor}/>
  </HBox>
  </>
  /**/

  //---------------------------------------------------------------------------

  return <HBox style={{overflow: "auto"}}>
    <DragDropContext onDragEnd={onDragEnd}>
    <LeftPanel settings={settings}/>
    <EditorBox
      settings={settings}
      mode="Regular"
    />
    <RightPanel settings={settings} />
    </DragDropContext>
  </HBox>

  //---------------------------------------------------------------------------
  // Index DnD
  //---------------------------------------------------------------------------

  function onDragEnd(result) {

    console.log("onDragEnd:", result)

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
      console.log("moveElem", srcId, dstId, dstIndex)

      dndElemPushTo(dstEdit,
        dndElemPop(srcEdit, srcId),
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
// Toolbar styles
//---------------------------------------------------------------------------

const styles = {
  toolbox: {
    left: {background: "white", borderRight: "1px solid lightgray"},
    mid: {background: "white"},
    right: {background: "white", borderLeft: "1px solid lightgray"},
  }
}

//---------------------------------------------------------------------------
// Left panels
//---------------------------------------------------------------------------

function LeftPanel({settings}) {
  const {doc, setActive} = settings
  const {leftstyle: style} = settings

  const {width, minWidth, maxWidth, ...rest} = style
  const widths={width, minWidth, maxWidth}

  return <VBox style={widths}>
    <LeftPanelMenu settings={settings}/>
    <DocIndex
      name={mawe.info(doc.story.body.head).title}
      style={rest}
      section={doc.story.body}
      include={settings.body.indexed}
      wcFormat={settings.body.words}
      activeID="body"
      setActive={setActive}
    />
  </VBox>
}

const LeftIndexChoices = {
  visible: ["scene", "synopsis", "missing", "comment"],
  words: ["off", "numbers", "percent", "cumulative"]
}

function LeftPanelMenu({settings}) {

  return <ToolBox style={styles.toolbox.left}>
    <ChooseVisibleElements
      choices={LeftIndexChoices.visible}
      selected={settings.body.indexed}
      setSelected={settings.body.setIndexed}
    />
    <Separator/>
    <ChooseWordFormat
      choices={LeftIndexChoices.words}
      selected={settings.body.words}
      setSelected={settings.body.setWords}
    />
  </ToolBox>
}

//---------------------------------------------------------------------------
// Right panels
//---------------------------------------------------------------------------

function RightPanel({settings}) {
  const {
    rightstyle: style, doc,
    selectRight, setSelectRight, setActive,
    setSearchText, searchBoxRef,
  } = settings

  switch(selectRight) {
    case "noteindex":
      return <VFiller style={style}>
      <ToolBox style={styles.toolbox.right}>
        <Filler />
        <ChooseRightPanel selected={selectRight} setSelected={setSelectRight}/>
      </ToolBox>
      <DocIndex
        name="Notes"
        style={style}
        section={doc.story.notes}
        include={settings.notes.indexed}
        wcFormat={settings.notes.words}
        activeID="notes"
        setActive={setActive}
      />
      </VFiller>
    case "wordtable":
      return <VFiller style={style}>
      <ToolBox style={styles.toolbox.right}>
        <Filler />
        <ChooseRightPanel selected={selectRight} setSelected={setSelectRight}/>
      </ToolBox>
      <WordTable
        section={doc.story.body}
        setSearchText={setSearchText}
        searchBoxRef={searchBoxRef}
      />
      </VFiller>
    default: break;
  }
}

class ChooseRightPanel extends React.PureComponent {

  buttons = {
    "noteindex": {
      tooltip: "Notes Index",
      icon: <Icon.View.Index />
    },
    "wordtable": {
      tooltip: "Word frequency",
      icon: <Icon.View.List />
    },
  }

  render() {
    const {selected, setSelected} = this.props

    return <MakeToggleGroup
      buttons={this.buttons}
      choices={["wordtable", "noteindex",]}
      selected={selected}
      setSelected={setSelected}
      exclusive={true}
    />
  }
}

//-----------------------------------------------------------------------------
// Editor toolbar
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
    const {editor, searchText, setSearchText, searchBoxRef} = this.props

    if(typeof(searchText) !== "string") return <Button
      tooltip="Search text"
      size="small"
    >
      <Icon.Action.Search onClick={ev => setSearchText("")}/>
    </Button>

    return <SearchBox
      inputRef={searchBoxRef}
      size="small"
      //defaultValue={searchText}
      value={searchText}
      autoFocus
      onChange={ev => setSearchText(ev.target.value)}
      onBlur={ev => {if(!searchText) setSearchText(undefined)}}
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

//-----------------------------------------------------------------------------

function EditorBox({style, settings, mode="Condensed"}) {
  const {doc, activeID} = settings
  //const {editor, buffer, onChange} = (activeID === "body") ? settings.body : settings.notes
  const {searchBoxRef, searchText, setSearchText} = settings
  const {highlightText} = settings

  const {head} = doc.story.body
  const {title, author} = mawe.info(head)

  function activeEditor() {
    switch(activeID) {
      case "body": return settings.body.editor
      case "notes": return settings.notes.editor
    }
  }

  return <VFiller>
    <ToolBox style={styles.toolbox.left}>
      <Searching editor={activeEditor()} searchText={searchText} setSearchText={setSearchText} searchBoxRef={searchBoxRef}/>
      <Filler />
      {/* <EditHeadButton head={head} setDoc={settings.setDoc} /> */}
      {/* <Separator/> */}
      {/* <SectionWordInfo section={doc.story.body}/> */}
    </ToolBox>
    {/* Editor board and sheet */}
    <div className="Filler Board" style={{...style}}>
      <Slate editor={settings.body.editor} initialValue={settings.body.buffer} onChange={settings.body.onChange}>
      {
        activeID === "body"
        ? <SlateEditable className={addClass("Sheet", mode)} highlight={highlightText}/>
        : null
      }
      </Slate>
      <Slate editor={settings.notes.editor} initialValue={settings.notes.buffer} onChange={settings.notes.onChange}>
      {
        activeID === "notes"
        ? <SlateEditable className={addClass("Sheet", mode)} highlight={highlightText}/>
        : null
      }
      </Slate>
    </div>
  </VFiller>
}

//-----------------------------------------------------------------------------

/*
function IndexBox({settings, section, style}) {
  const props = {settings, section, style}

  return <SlateTOC {...props}/>
}
*/

//-----------------------------------------------------------------------------

class ASTChildren extends React.PureComponent {
  render() {
    const {children} = this.props
    return children && <div>
      {"children: ["}
      <div style={{paddingLeft: "0.5cm"}}>
      {children.map((elem, i) => <ASTElement key={elem.id ?? i} elem={elem}/>)}
      </div>
      {"]"}
    </div>
  }
}

class ASTElement extends React.PureComponent {
  render() {
    const {elem} = this.props
    const {type, children, words, ...props} = elem

    const entries = Object.entries(props)
    //console.log(entries.map(([key, value]) => ({[key]: value})))

    return <div>
    {`${type}: {`}
      <div style={{paddingLeft: "0.5cm"}}>
      {entries.map(([key, value]) => (<div key={key}>{key}: {value}</div>))}
      <ASTChildren children={children}/>
      </div>
    {"}"}
    </div>
  }
}

function SlateAST({editor}) {
  //return <Pre style={{ width: "50%" }} content={editor.children} />
  return <div style={{ width: "50%" }}>
    <ASTChildren children={editor.children}/>
    </div>
}

function Pre({ style, content }) {
  return <pre style={{ fontSize: "10pt", ...style }}>
    {typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}`}
  </pre>
}

function Empty() {
  return null;
}
