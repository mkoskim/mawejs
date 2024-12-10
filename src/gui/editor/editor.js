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
  useState, useEffect,
  useMemo, useCallback,
  useDeferredValue,
  useRef,
} from 'react';

import {
  Slate, ReactEditor,
} from "slate-react"

import {
  Editor, Transforms, Range,
} from "slate";

import { DragDropContext } from "@hello-pangea/dnd";

import {
  getEditor, SlateEditable,
  searchFirst, searchForward, searchBackward,
  isAstChange,
} from "./slateEditor"

import {
  EditButtons,
  FoldButtons,
} from "./slateButtons"

import {DocIndex} from "../common/docIndex"
import {WordTable} from "./wordTable"
import {TagTable} from "./tagTable"

import {
  VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Icon, IconButton,
  MakeToggleGroup,
  SearchBox,
  IsKey, addHotkeys,
  Separator, addClass,
} from "../common/factory";

import {
  ChooseVisibleElements, ChooseWordFormat,
} from "../common/components";

import {wcElem} from "../../document/util";
import {elemFind} from "../../document/xmljs/tree";
import {focusByPath} from "./slateHelpers";
import {IDfromPath, IDtoPath, dndDrop} from "./slateDnD"

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

    const fixed = (indexed ?? ["scene"])
      .split(",")
      .filter(s => s !== "part")
      .filter(s => s !== "chapter")
      .filter(s => s !== "act")
      .filter(s => s !== "synopsis")
      .filter(s => s !== "fill")
      .concat(["act", "chapter"])

    return {
      ...(words ? {words} : {}),
      ...(indexed ? {indexed: fixed} : {})
    }
  }

  return {
    active: "body",
    focusTo: undefined,
    body: {
      indexed: ["act", "chapter", "scene", "bookmark"],
      words: "numbers",
      ...getBodySettings()
    },
    notes: {
      indexed: ["act", "chapter", "scene", "bookmark"],
      words: undefined,
    },
    left: {
      style: {maxWidth: "400px", width: "400px", borderRight: "2px solid lightgray"},
    },
    right: {
      style: {maxWidth: "300px", width: "300px", borderLeft: "2px solid lightgray"},
      selected: "noteindex"
    },
    toolbox: {
      left: {background: "white", borderRight: "2px solid lightgray"},
      mid: {background: "white"},
      right: {background: "white"},
    }
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

//-----------------------------------------------------------------------------

export function getFocusTo(doc) { return doc.ui.editor.focusTo.id; }
export function setFocusTo(updateDoc, id) {
  updateDoc(doc => {
    doc.ui.view.selected = "editor"
    const {sectID, path} = IDtoPath(id)
    doc.ui.editor.active = sectID
    doc.ui.editor.focusTo = path
    console.log("setFocusTo:", id)
  })
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

  //console.log("Doc:", doc)

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
  // Cursor movement tracking
  //---------------------------------------------------------------------------

  const [track, setTrack] = useState(undefined)

  const trackMarks = useCallback((editor, sectID) => {
    try {
      const {selection} = editor
      if(selection) {
        const {focus} = selection

        const match = Editor.parent(editor,
          focus,
          {
            match: n =>
              !Editor.isEditor(n) &&
              Element.isElement(n)
          }
        )
        if(match) {
          const [node, path] = match
          //console.log(node, path)
          const marks = Editor.marks(editor)
          setTrack({marks, node, id: IDfromPath(sectID, path)})
          return
        }
      }
    } catch(e) {
      //console.log("Track error:", e)
    }
    setTrack(undefined)
  }, [setTrack])

  //---------------------------------------------------------------------------
  // sections
  //---------------------------------------------------------------------------

  const bodyeditor = useMemo(() => getEditor(), [])
  const noteeditor = useMemo(() => getEditor(), [])

  const updateBody = useCallback(buffer => {
    trackMarks(bodyeditor, "body")
    if(isAstChange(bodyeditor)) {
      updateDoc(doc => {
        doc.body.acts = buffer;
        doc.body.words = wcElem({type: "sect", children: buffer})
      })
    }
  }, [bodyeditor])

  const updateNotes = useCallback(buffer => {
    trackMarks(noteeditor, "notes")
    if(isAstChange(noteeditor)) {
      updateDoc(doc => {
        doc.notes.acts = buffer
        doc.notes.words = wcElem({type: "sect", children: buffer})
      })
    }
  }, [noteeditor])

  //---------------------------------------------------------------------------
  // Section selection + focusing
  //---------------------------------------------------------------------------

  const {active, focusTo} = doc.ui.editor

  const getEditorBySectID = useCallback(sectID => {
    switch(sectID) {
      case "body": return bodyeditor;
      case "notes": return noteeditor;
    }
  }, [bodyeditor, noteeditor])

  const getActiveEdit = useCallback(() => {
    return getEditorBySectID(active)
  }, [getEditorBySectID, active])

  const setActive = useCallback(id => {
    //console.log("setActive:", sectID, path)
    setFocusTo(updateDoc, id)
  }, [updateDoc])

  useEffect(() => {
    //console.log("Focus to:", focusTo)

    if(focusTo) {
      //const {sectID, path} = IDtoPath(focusTo)
      console.log("Focus path", focusTo)
      const editor = getActiveEdit()
      focusByPath(editor, focusTo)
    }
  }, [getActiveEdit, focusTo])

  // Initially focus editor
  useEffect(() => {
    ReactEditor.focus(getActiveEdit())
  }, [])

  //---------------------------------------------------------------------------
  // Search
  //---------------------------------------------------------------------------

  const searchBoxRef = useRef(null)
  const [searchText, _setSearchText] = useState()
  const highlightText = useDeferredValue(searchText)

  const setSearchText = useCallback(text => {
    _setSearchText(text)
    searchFirst(getActiveEdit(), text)
  }, [getActiveEdit])

  //---------------------------------------------------------------------------
  // Render elements: what we want is to get menu items from subcomponents to
  // the toolbar.

  //---------------------------------------------------------------------------

  const settings = {
    doc,
    updateDoc,
    searchBoxRef,
    searchText,
    highlightText,
    setSearchText,
    setActive,
    focusTo,
    setFocusTo,
    track,
    body: {
      editor: bodyeditor,
      buffer: doc.body.acts,
      onChange: updateBody,
      },
    notes: {
      editor: noteeditor,
      buffer: doc.notes.acts,
      onChange: updateNotes,
    },
  }

  //---------------------------------------------------------------------------
  // Hotkeys
  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys([
    [IsKey.CtrlF, ev => {
      const editor = getActiveEdit()
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
        ReactEditor.focus(getActiveEdit())
      }
    }],
    [IsKey.CtrlG,  ev => searchForward(getActiveEdit(), searchText, true)],
    [IsKey.CtrlShiftG, ev => searchBackward(getActiveEdit(), searchText, true)]
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

  //console.log("Editor update")

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

    switch(type) {
      case "chapter":
      case "scene": {
        const {sectID: srcSectID, path: srcPath} = IDtoPath(draggableId)
        const {sectID: dstSectID, path: dstPath} = IDtoPath(destination.droppableId)
        const srcEdit = getEditorBySectID(srcSectID)
        const dstEdit = getEditorBySectID(dstSectID)

        const dropped = dndDrop(srcEdit, srcPath, dstEdit, dstPath, destination.index)
        setActive(IDfromPath(dstSectID, dropped))
        break;
      }

      default:
        console.log("Unknown draggable type:", type, result)
        break;
    }
  }
}

//---------------------------------------------------------------------------
// Left panels
//---------------------------------------------------------------------------

function LeftPanel({settings}) {
  const {doc, setActive, track} = settings
  const {style} = doc.ui.editor.left

  const {width, minWidth, maxWidth, ...rest} = style
  const widths={width, minWidth, maxWidth}

  return <VBox style={widths}>
    <LeftPanelMenu settings={settings}/>
    <DocIndex
      style={rest}
      section={doc.body}
      include={doc.ui.editor.body.indexed}
      wcFormat={doc.ui.editor.body.words}
      activeID="body"
      setActive={setActive}
      current={track?.id}
    />
  </VBox>
}

const LeftIndexChoices = {
  visible: ["scene", "bookmark", "missing", "comment", "tags"],
  words: ["off", "numbers", "compact", "cumulative", "percent"]
}

function LeftPanelMenu({settings}) {

  const {doc, updateDoc} = settings

  const indexed = doc.ui.editor.body.indexed;
  const setIndexed = useCallback(value => updateDoc(doc => {doc.ui.editor.body.indexed = value}), [updateDoc])
  const words = doc.ui.editor.body.words
  const setWords = useCallback(value => updateDoc(doc => {doc.ui.editor.body.words = value}), [updateDoc])

  return <ToolBox style={doc.ui.editor.toolbox.left}>
    <ChooseVisibleElements
      choices={LeftIndexChoices.visible}
      selected={indexed}
      setSelected={setIndexed}
    />
    <Separator/>
    <Filler/>
    <Separator/>
    <ChooseWordFormat
      choices={LeftIndexChoices.words}
      selected={words}
      setSelected={setWords}
    />
  </ToolBox>
}

//---------------------------------------------------------------------------
// Right panels
//---------------------------------------------------------------------------

function RightPanel({settings}) {
  const {
    doc, updateDoc,
  } = settings

  const {style} = doc.ui.editor.right
  const selectRight = doc.ui.editor.right.selected
  const setSelectRight = useCallback(value => updateDoc(doc => {doc.ui.editor.right.selected = value}), [updateDoc])

  return <VFiller style={style}>
      <ToolBox style={doc.ui.editor.toolbox.right}>
        <ChooseRightPanel selected={selectRight} setSelected={setSelectRight}/>
        <Filler />
      </ToolBox>
      <RightPanelContent settings={settings} selected={selectRight}/>
    </VFiller>
}

function RightPanelContent({settings, selected}) {
  const {
    doc,
    setActive,
    setSearchText, searchBoxRef,
    body, track,
  } = settings

  switch(selected) {
    case "noteindex":
      return <DocIndex
        section={doc.notes}
        include={doc.ui.editor.notes.indexed}
        wcFormat={doc.ui.editor.notes.words}
        activeID="notes"
        setActive={setActive}
        current={track?.id}
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

    // Render a search icon button if no search text is defined.
    if (typeof(searchText) !== "string") {
      return (
        <IconButton
          tooltip="Search text (Ctrl-F)"
          size="small"
          onClick={ev => setSearchText("")}
        >
          <Icon.Action.Search/>
        </IconButton>
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
        <IconButton tooltip="Search previous (Ctrl-Shift-G)" onClick={this.searchPrevious}><Icon.Arrow.Up/></IconButton>
        <IconButton tooltip="Search next (Ctrl-G)" onClick={this.searchNext}><Icon.Arrow.Down/></IconButton>
        {/*
        <button style={iconButtonStyle} onClick={this.searchPrevious} title="Previous search result">↑</button> {}
        <button style={iconButtonStyle} onClick={this.searchNext} title="Next search result">↓</button> {}
        */}
       </div>
    );
  }
}

//-----------------------------------------------------------------------------

function EditorBox({style, settings, mode="Condensed"}) {
  const {doc, track} = settings
  const {active} = doc.ui.editor

  const editor = {
    "body": settings.body.editor,
    "notes": settings.notes.editor,
  }[active]

  const {searchBoxRef, searchText, setSearchText} = settings
  const {highlightText} = settings

  return <VFiller>
    {/* Editor toolbar */}

    <ToolBox style={doc.ui.editor.toolbox.mid}>
      <EditButtons editor={editor} track={track}/>
      <Separator/>
      <Searching editor={editor} searchText={searchText} setSearchText={setSearchText} searchBoxRef={searchBoxRef}/>
      <Separator/>
      <Filler />
      <Separator/>
      <FoldButtons editor={editor} folded={track?.node?.folded}/>
    </ToolBox>

    {/* Editor board and sheet */}

    <div className="Filler Board" style={{...style}}>

      <Slate editor={settings.body.editor} initialValue={settings.body.buffer} onChange={settings.body.onChange}>
        <SlateEditable className={addClass("Sheet", mode, (active !== "body" && "Hidden"))} highlight={highlightText}/>
      </Slate>

      <Slate editor={settings.notes.editor} initialValue={settings.notes.buffer} onChange={settings.notes.onChange}>
        <SlateEditable className={addClass("Sheet", mode, (active !== "notes" && "Hidden"))} highlight={highlightText}/>
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
