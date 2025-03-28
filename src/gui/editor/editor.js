//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import "./editor.css"

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
  isAstChange,
  focusByPath,
} from "../slatejs/slateHelpers"

import {
  searchFirst, searchForward, searchBackward,
} from '../slatejs/slateSearch';

import {
  getUIEditor,
} from "../slatejs/slateEditor"

import {
  SlateEditable,
} from "../slatejs/slateEditable"

import {
  StyleButtons,
  FoldButtons,
} from "../slatejs/slateButtons"

import {dndDrop} from "../slatejs/slateDnD"

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
  Button,
} from "../common/factory";

import {
  ChooseVisibleElements, ChooseWordFormat,
} from "../common/components";

import {wcElem, nodeID, IDtoPath, nanoid} from "../../document/util";
import {elemFind} from "../../document/xmljs/tree";

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
    trashcan: {
      indexed: ["act", "chapter", "scene"],
      words: undefined,
      style: {background: "#FED"},
    },
    left: {
      style: {maxWidth: "400px", width: "400px", borderRight: "1px solid lightgray"},
    },
    right: {
      style: {maxWidth: "300px", width: "300px", borderLeft: "1px solid lightgray"},
      selected: "noteindex"
    },
    toolbox: {
      left: {background: "white"},
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
    doc.ui.editor.refocus = nanoid()
    doc.ui.editor.active = sectID
    doc.ui.editor.focusTo = path
    //console.log("setFocusTo:", sectID, path)
  })
}

//*****************************************************************************
//
// Editor view
//
//*****************************************************************************

export function EditView({doc, updateDoc}) {

  //---------------------------------------------------------------------------
  // For development purposes:
  //---------------------------------------------------------------------------

  //console.log("Doc:", doc)
  //console.log("Body:", doc.body.acts)

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
          setTrack({marks, node, id: nodeID(sectID, path)})
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

  const editors = useMemo(() => ({
    body: getUIEditor(),
    notes: getUIEditor(),
    trashcan: getUIEditor(),
  }), [])

  const updateSection = useCallback((key, buffer) => {
    const editor = editors[key]
    trackMarks(editor, key)
    if(isAstChange(editor)) {
      updateDoc(doc => {
        doc[key].acts = buffer
        doc[key].words = wcElem({type: "sect", children: buffer})
      })
    }
  }, [editors])

  //---------------------------------------------------------------------------
  // Section selection + focusing
  //---------------------------------------------------------------------------

  const {refocus, active, focusTo} = doc.ui.editor

  const getEditorBySectID = useCallback(sectID => {
    if(sectID in editors) return editors[sectID]
    return null
  }, [editors])

  const getActiveEdit = useCallback(() => {
    return getEditorBySectID(active)
  }, [getEditorBySectID, active])

  const setActive = useCallback(id => {
    //console.log("setActive:", sectID, path)
    setFocusTo(updateDoc, id)
  }, [updateDoc])

  useEffect(() => {
    //console.log("Focus to:", focusTo)
    const editor = getActiveEdit()
    focusByPath(editor, focusTo)
  }, [refocus, active, focusTo])

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
    updateSection,
    editors,
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
  ]), []);

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
    {//*
      <LeftPanel settings={settings}/>
    /**/}
    <EditorBox
      settings={settings}
    />
    {//*
      <RightPanel settings={settings} />
    /**/}
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
      case "act":
      case "chapter":
      case "scene": {
        const {sectID: srcSectID, path: srcPath} = IDtoPath(draggableId)
        const {sectID: dstSectID, path: dstPath} = IDtoPath(destination.droppableId)
        const srcEdit = getEditorBySectID(srcSectID)
        const dstEdit = getEditorBySectID(dstSectID)

        dndDrop(srcEdit, srcPath, dstEdit, dstPath ?? [], destination.index)
        setActive(nodeID(dstSectID))
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
  const {doc} = settings
  const {style} = doc.ui.editor.left

  return <VBox style={style}>
    <LeftPanelMenu settings={settings}/>
    {//*
      <SectionIndex sectID="body" settings={settings}/>
    /**/}
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

class ChooseRightPanel extends React.PureComponent {

  static buttons = {
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
    "trashcan": {
      tooltip: "Trashcan",
      icon: <Icon.View.Trashcan />
    },
  }

  static choices = [
    "noteindex",
    "wordtable",
    "tagtable",
    //"trashcan"
  ]

  render() {
    const {selected, setSelected} = this.props
    const {buttons, choices} = this.constructor

    return <MakeToggleGroup
      buttons={buttons}
      choices={choices}
      selected={selected}
      setSelected={setSelected}
      exclusive={true}
    />
  }
}

function RightPanelContent({settings, selected}) {
  const {
    doc,
    setSearchText, searchBoxRef,
    editors,
  } = settings

  switch(selected) {
    case "noteindex":
      return <>
        <SectionIndex sectID="notes" settings={settings}/>
        {/*
        <TrashcanIndex  settings={settings} style={{
          height: "25%",
          borderTop: "1px dashed #F64",
        }}/>
        */}
      </>
    case "wordtable": {
      return <WordTable
        section={doc.body}
        setSearchText={setSearchText}
        searchBoxRef={searchBoxRef}
      />
    }
    case "tagtable":
      return <TagTable
        editor={editors.body}
        section={doc.body}
      />
    case "trashcan":
      return <SectionIndex sectID="trashcan" settings={settings}/>
    default: break;
  }
}

//-----------------------------------------------------------------------------
// Index rendering
//-----------------------------------------------------------------------------

function SectionIndex({sectID, settings}) {
  const {
    doc,
    setActive,
    track,
  } = settings

  const {style, indexed, words} = doc.ui.editor[sectID]

  return <DocIndex
    style={style}
    sectID={sectID}
    section={doc[sectID]}
    include={indexed}
    wcFormat={words}
    setActive={setActive}
    current={track?.id}
  />
}

//-----------------------------------------------------------------------------
// Editor toolbar
//-----------------------------------------------------------------------------

class Searching extends React.PureComponent {
  // Simulates pressing ESC key
  handleEscBehavior = () => {
    // Call the method that you would normally call when ESC is pressed
    this.props.setSearchText(undefined);
    ReactEditor.focus(this.props.editor)
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


  static btn_sx = {borderRadius: "12px"}
  static input_style = {width: 250}

  render() {
    const { editor, searchText, setSearchText, searchBoxRef } = this.props;
    const {input_style, btn_sx} = this.constructor

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

    return <SearchBox
      inputRef={searchBoxRef}
      style={input_style}
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
      endAdornment={<HBox style={{borderLeft: "1px solid lightgray", paddingLeft: "4px"}}>
        <Button sx={btn_sx} tooltip="Search previous (Ctrl-Shift-G)" onClick={this.searchPrevious}><Icon.Arrow.Up fontSize="12pt"/></Button>
        <Button sx={btn_sx} tooltip="Search next (Ctrl-G)" onClick={this.searchNext}><Icon.Arrow.Down fontSize="12pt"/></Button>
        <Button sx={btn_sx} tooltip="Clear" onClick={this.clearSearch}><Icon.Close fontSize="12pt"/></Button>
      </HBox>}
    />
  }
}

//-----------------------------------------------------------------------------

function EditorBox({style, settings}) {
  const {doc, track} = settings
  const {active} = doc.ui.editor

  const {editors, updateSection} = settings
  const editor = editors[active]

  const {searchBoxRef, searchText, setSearchText} = settings
  const {highlightText} = settings

  const type = track?.node?.type
  const {bold, italic} = track?.marks ?? {}

  const updateBody = useCallback(buffer => updateSection("body", buffer), [updateSection])
  const updateNotes = useCallback(buffer => updateSection("notes", buffer), [updateSection])
  const updateTrash = useCallback(buffer => updateSection("trashcan", buffer), [updateSection])

  return <VFiller>
    {/* Editor toolbar */}

    <ToolBox style={doc.ui.editor.toolbox.mid}>
      <FoldButtons editor={editor}/>
      <Separator/>
      <StyleButtons editor={editor} type={type} bold={bold} italic={italic}/>
      <Separator/>
      <Searching editor={editor} searchText={searchText} setSearchText={setSearchText} searchBoxRef={searchBoxRef}/>
      <Separator/>
      <Filler />
    </ToolBox>

    {/* Editor board and sheet */}

    <div className="Board Editor" style={{...style}}>

      <Slate editor={editors.body} initialValue={doc.body.acts} onChange={updateBody}>
        <SlateEditable visible={active === "body"} className="Sheet Regular" highlight={highlightText}/>
      </Slate>

      <Slate editor={editors.notes} initialValue={doc.notes.acts} onChange={updateNotes}>
        <SlateEditable visible={active === "notes"} className="Sheet Regular" highlight={highlightText}/>
      </Slate>

      <Slate editor={editors.trashcan} initialValue={doc.trashcan.acts} onChange={updateTrash}>
        <SlateEditable visible={active === "trashcan"} className="Sheet Regular" highlight={highlightText}/>
      </Slate>
    </div>
  </VFiller>
}

//*****************************************************************************
//
// Debugging
//
//*****************************************************************************

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
