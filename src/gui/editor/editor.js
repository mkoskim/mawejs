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
  useRef, useContext,
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
import {TagTable} from "./tagTable"

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup, MakeToggleGroup,
  Input,
  SearchBox,
  IsKey, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
  Menu, MenuItem,
  DeferredRender,
} from "../common/factory";

import {
  ChooseVisibleElements, ChooseWordFormat,
} from "../common/components";

import { wcElem } from "../../document/util";
import { elemFind } from "../../document/xmljs/load";
import { getFocusTo, setFocusTo } from "../app/views";

//*****************************************************************************
//
// Editor settings
//
//*****************************************************************************

export function loadEditorSettings(settings) {

  function getBodySettings() {
    const body = elemFind(settings, "body")
    if(!body) return {}
    const {words, indexed} = body.attributes

    return {
      ...(words ? {words} : {}),
      ...(indexed ? {indexed: indexed.split(",")} : {})
    }
  }

  return {
    body: {
      indexed: ["part", "scene", "synopsis"],
      words: "numbers",
      ...getBodySettings()
    },
    notes: {
      indexed: ["part", "scene", "synopsis"],
    },
  }
}

export function saveEditorSettings(settings) {
  return {
    type: "editor",
    attributes: {},
    elements: [
      {
        type: "body",
        attributes: {
          words: settings.body.words,
          indexed: settings.body.indexed.join(",")
        },
        elements: [
        ]
      },
    ]
  }
}

//*****************************************************************************
//
// Editor view
//
//*****************************************************************************

export function SingleEditView({doc, updateDoc}) {

  //---------------------------------------------------------------------------
  // For development purposes:
  //---------------------------------------------------------------------------

  /*
  return <React.Fragment>
    <HBox>
    <Pre style={{ width: "50%" }} content={doc} />
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

  //---------------------------------------------------------------------------
  // Get updates from Slate, and apply them to doc, too
  //---------------------------------------------------------------------------

  const updateBody = useCallback(buffer => {
    if(isAstChange(bodyeditor)) {
      updateDoc(doc => {
        doc.body.parts = buffer;
        doc.body.words = wcElem({type: "sect", children: buffer})
      })
    }
  }, [bodyeditor])

  const updateNotes = useCallback(buffer => {
    if(isAstChange(noteeditor)) {
      updateDoc(doc => {
        doc.notes.parts = buffer
        doc.notes.words = wcElem({type: "sect", children: buffer})
      })
    }
  }, [noteeditor])

  //---------------------------------------------------------------------------
  // Section selection + focusing
  //---------------------------------------------------------------------------

  const focusTo = getFocusTo(doc)
  const [active, _setActive] = useState(focusTo?.sectID ?? "body")

  //console.log("ActiveID:", active)

  const setActive = useCallback((sectID, elemID) => {
    //console.log("setActive:", sectID, elemID)
    _setActive(sectID)
    setFocusTo(updateDoc, {id: elemID})
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

  const indexed1 = doc.ui.editor.body.indexed;
  const setIndexed1 = useCallback(value => updateDoc(doc => {doc.ui.editor.body.indexed = value}), [updateDoc])
  const words1 = doc.ui.editor.body.words
  const setWords1 = useCallback(value => updateDoc(doc => {doc.ui.editor.body.words = value}), [updateDoc])

  const indexed2 = doc.ui.editor.notes.indexed
  const setIndexed2 = useCallback(value => updateDoc(doc => {doc.ui.editor.notes.indexed = value}), [updateDoc])

  //---------------------------------------------------------------------------
  // Render elements: what we want is to get menu items from subcomponents to
  // the toolbar.

  const [selectRight, setSelectRight] = useState("noteindex")

  //---------------------------------------------------------------------------

  const settings = {
    doc,
    updateDoc,
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
      buffer: doc.body.parts,
      onChange: updateBody,
      },
    notes: {
      indexed: indexed2,
      setIndexed: setIndexed2,
      editor: noteeditor,
      buffer: doc.notes.parts,
      onChange: updateNotes,
    },
    leftstyle:    {maxWidth: "400px", width: "400px"},
    rightstyle:   {maxWidth: "300px", width: "300px"},
  }

  //---------------------------------------------------------------------------
  // Hotkeys
  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys([
    [IsKey.CtrlF, ev => {
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
    }],
    [IsKey.Escape, ev => {
      if(typeof(searchText) === "string") {
        _setSearchText(undefined)
        ReactEditor.focus(activeEdit())
      }
    }],
    [IsKey.CtrlG,  ev => searchForward(activeEdit(), searchText, true)],
    [IsKey.CtrlShiftG, ev => searchBackward(activeEdit(), searchText, true)]
  ]));

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
      style={rest}
      section={doc.body}
      include={settings.body.indexed}
      wcFormat={settings.body.words}
      activeID="body"
      setActive={setActive}
    />
  </VBox>
}

const LeftIndexChoices = {
  visible: ["scene", "synopsis", "missing", "fill", "comment", "tags"],
  words: ["off", "numbers", "compact", "cumulative", "percent"]
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
    rightstyle: style,
    selectRight, setSelectRight
  } = settings

  return <VFiller style={style}>
      <ToolBox style={styles.toolbox.right}>
        <ChooseRightPanel selected={selectRight} setSelected={setSelectRight}/>
        <Filler />
      </ToolBox>
      <RightPanelContent settings={settings}/>
    </VFiller>
}

function RightPanelContent({settings}) {
  const {
    rightstyle: style, doc,
    selectRight, setActive,
    setSearchText, searchBoxRef,
    body,
  } = settings

  switch(selectRight) {
    case "noteindex":
      return <DocIndex
        style={style}
        section={doc.notes}
        include={settings.notes.indexed}
        wcFormat={settings.notes.words}
        activeID="notes"
        setActive={setActive}
      />
    case "wordtable":
      return <WordTable
        section={doc.body}
        setSearchText={setSearchText}
        searchBoxRef={searchBoxRef}
      />
    case "tagtable":
      return <TagTable
        editor={body.editor}
        section={doc.body}
      />
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
    "tagtable": {
      tooltip: "Tags",
      icon: <Icon.View.Tags />
    },
  }

  choices = ["noteindex", "wordtable", "tagtable"]

  render() {
    const {selected, setSelected} = this.props

    return <MakeToggleGroup
      buttons={this.buttons}
      choices={this.choices}
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
  // Simulates pressing ESC key
  handleEscBehavior = () => {
    // Call the method that you would normally call when ESC is pressed
    this.props.setSearchText(undefined);
  }

  /**
   * Clears the current search text.
   */
  clearSearch = () => {
    this.handleEscBehavior();
  }

  /**
   * Navigates to the next search result.
   */
  searchNext = () => {
    searchForward(this.props.editor, this.props.searchText, true);
  }

  /**
   * Navigates to the previous search result.
   */
  searchPrevious = () => {
    searchBackward(this.props.editor, this.props.searchText, true);
  }

  render() {
    const { editor, searchText, setSearchText, searchBoxRef } = this.props;

    // Define inline styles for icon-like buttons
    const iconButtonStyle = {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0',
      margin: '0 5px',
      fontSize: '16px',
      color: '#333',
      outline: 'none',
    };


    // Render a search icon button if no search text is defined.
    if (typeof(searchText) !== "string") {
      return (
        <Button
          tooltip="Search text"
          size="small"
        >
          <Icon.Action.Search onClick={ev => setSearchText("")}/>
        </Button>
      );
    }

    // Render the search box with additional controls for clearing the search text,
    // and navigating through search results.
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SearchBox
          inputRef={searchBoxRef}
          size="small"
          value={searchText}
          autoFocus
          onChange={ev => setSearchText(ev.target.value)}
          onBlur={ev => { if (!searchText) setSearchText(undefined) }}
          onKeyDown={ev => {
            if (IsKey.Enter(ev)) {
              ev.preventDefault();
              ev.stopPropagation();
              if (searchText === "") setSearchText(undefined);
              searchFirst(editor, searchText, true);
            }
          }}
        />
        <button style={iconButtonStyle} onClick={this.clearSearch} title="Clear search">✖️</button> {}
        <button style={iconButtonStyle} onClick={this.searchPrevious} title="Previous search result">↑</button> {}
        <button style={iconButtonStyle} onClick={this.searchNext} title="Next search result">↓</button> {}
       </div>
    );
  }
}




//-----------------------------------------------------------------------------

function EditorBox({style, settings, mode="Condensed"}) {
  const {doc, activeID} = settings
  //const {editor, buffer, onChange} = (activeID === "body") ? settings.body : settings.notes
  const {searchBoxRef, searchText, setSearchText} = settings
  const {highlightText} = settings

  function activeEditor() {
    switch(activeID) {
      case "body": return settings.body.editor
      case "notes": return settings.notes.editor
    }
  }

  return <VFiller>
    <ToolBox style={styles.toolbox.left}>
      {/* <EditHeadButton head={head} updateDoc={settings.updateDoc} expanded={true}/> */}
      <Searching editor={activeEditor()} searchText={searchText} setSearchText={setSearchText} searchBoxRef={searchBoxRef}/>
      <Filler />
      {/* <OpenFolderButton filename={doc.file?.id}/> */}
      {/* <Separator/> */}
      {/* <SectionWordInfo section={doc.body}/> */}
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
