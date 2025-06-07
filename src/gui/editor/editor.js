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

import { useImmer } from "use-immer";

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

  function getLeftSettings() {
    const draft = elemFind(settings, "draft")
    if(!draft) return {}

    const {attributes} = draft

    if(!attributes) return {}

    const {words, indexed} = attributes

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
    active: "draft",
    focusTo: undefined,
    left: {
      style: {maxWidth: "400px", width: "400px", borderRight: "1px solid lightgray"},
      indexed: ["act", "chapter", "scene", "bookmark"],
      words: "numbers",
      ...getLeftSettings()
    },
    right: {
      style: {maxWidth: "300px", width: "300px", borderLeft: "1px solid lightgray"},
      selected: "index",
      indexed: ["act", "chapter", "scene", "bookmark"],
      words: undefined,
    },
    indexing: {
      storybook: false,
      draft: "left",
      notes: "right",
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
        type: "draft",
        attributes: {
          words: settings.left.words,
          indexed: settings.left.indexed.join(",")
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
  //console.log("Draft:", doc.draft.acts)

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
    draft: getUIEditor(),
    notes: getUIEditor(),
    storybook: getUIEditor(),
    //trashcan: getUIEditor(),
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
  // Section selection + focusing + indexing
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
    //console.log("setActive:", id)
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
  // Search hotkeys
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
  ]), [getActiveEdit, searchText]);

  //---------------------------------------------------------------------------
  // Debug/development view

  /*
  return <>
    <HBox style={{overflow: "auto"}}>
      <EditorBox settings={settings} mode="Regular"/>
      <SlateAST editor={drafteditor}/>
    </HBox>
    </>
  /**/

  /*
  return <>
  <HBox style={{overflow: "auto"}}>
    <EditorBox settings={settings} mode="Regular"/>
    <Pre style={{width: "50%"}} content={drafteditor}/>
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

const LeftIndexChoices = {
  visible: ["scene", "bookmark", "missing", "comment", "tags"],
  words: ["off", "numbers", "compact", "cumulative", "percent"]
}

function LeftPanel({settings}) {
  const {doc} = settings

  const {left} = doc.ui.editor

  const {style, indexed, words} = left

  return <VBox style={style}>
    <LeftPanelMenu settings={settings}/>
    <ShowIndices settings={settings} side="left" indexed={indexed} words={words}/>
  </VBox>
}

function LeftPanelMenu({settings}) {

  const {doc, updateDoc} = settings

  const {indexed, words} = doc.ui.editor.left
  const setIndexed = useCallback(value => updateDoc(doc => {doc.ui.editor.left.indexed = value}), [updateDoc])
  const setWords = useCallback(value => updateDoc(doc => {doc.ui.editor.left.words = value}), [updateDoc])

  return <ToolBox style={doc.ui.editor.toolbox.left}>
    {/* <ChooseLeftPanel disabled={disabled} selected={selected} setSelected={setSelected}/> */}
    <ChooseVisibleElements
      choices={LeftIndexChoices.visible}
      selected={indexed}
      setSelected={setIndexed}
    />
    {/*<Separator/>*/}
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

  const {right, left} = doc.ui.editor

  const {style, selected} = right

  const setSelectRight = useCallback(value => updateDoc(doc => {doc.ui.editor.right.selected = value}), [updateDoc])
  const disabled = useMemo(() => [left.selected], [left.selected])

  return <VFiller style={style}>
      <ToolBox style={doc.ui.editor.toolbox.right}>
        <ChooseRightPanel selected={selected} disabled={disabled} setSelected={setSelectRight}/>
        <Filler />
      </ToolBox>
      <RightPanelContent settings={settings} selected={selected}/>
    </VFiller>
}

class ChooseRightPanel extends React.PureComponent {

  static buttons = {
    /*
    "draft": {
      tooltip: "Draft Index",
      icon: <Icon.View.Draft />
    },
    "notes": {
      tooltip: "Notes Index",
      icon: <Icon.View.Notes />
    },
    "storybook": {
      tooltip: "Storybook Index",
      icon: <Icon.View.StoryBook />
    },
    */
    "index": {
      tooltip: "Index",
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
    //"draft",
    //"storybook",
    //"notes",
    "index",
    "wordtable",
    "tagtable",
    //"trashcan"
  ]

  render() {
    const {disabled, selected, setSelected} = this.props
    const {buttons, choices} = this.constructor

    return <MakeToggleGroup
      buttons={buttons}
      choices={choices}
      disabled={disabled}
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
    case "index": {
      const {right} = doc.ui.editor
      const {indexed, words} = right

      return <ShowIndices settings={settings} side="right" indexed={indexed} words={words}/>
    }
    case "wordtable": {
      return <WordTable
        section={doc.draft}
        setSearchText={setSearchText}
        searchBoxRef={searchBoxRef}
      />
    }
    case "tagtable":
      return <TagTable
        editor={editors.draft}
        section={doc.draft}
      />
    default: break;
  }
}

//-----------------------------------------------------------------------------
// Index rendering
//-----------------------------------------------------------------------------

function ShowIndices({style, settings, side, indexed, words}) {
  const {
    doc,
    updateDoc,
    setActive,
    track,
  } = settings
  const {indexing} = doc.ui.editor
  const updateIndexing = useCallback((sectID, value) => updateDoc(doc => {doc.ui.editor.indexing[sectID] = value}), [updateDoc])

  return <VBox style={style} className="TOC">
    <SectionIndex
      doc={doc}
      sectID="storybook"
      name="Storybook"
      side={side}
      indexing={indexing}
      updateIndexing={updateIndexing}
      indexed={indexed}
      words={words}
      setActive={setActive}
      track={track}
    />
    <SectionIndex
      doc={doc}
      sectID="draft"
      name="Draft"
      side={side}
      indexing={indexing}
      updateIndexing={updateIndexing}
      indexed={indexed}
      words={words}
      setActive={setActive}
      track={track}
    />
    <SectionIndex
      doc={doc}
      sectID="notes"
      name="Notes"
      side={side}
      indexing={indexing}
      updateIndexing={updateIndexing}
      indexed={indexed}
      words={words}
      setActive={setActive}
      track={track}
    />
  </VBox>
}

class SectionIndex extends React.PureComponent {

  render() {
    const {doc, sectID, name, side, indexing, updateIndexing, indexed, words, setActive, track} = this.props
    const visible = indexing[sectID] === side

    return <div className="SectionZone">
      <SectionName
        name={name}
        side={side}
        sectID={sectID}
        indexing={indexing}
        updateIndexing={updateIndexing}
      />
      {visible && <DocIndex
        //style={style}
        sectID={sectID}
        section={doc[sectID]}
        include={indexed}
        wcFormat={words}
        setActive={setActive}
        current={track?.id}
      />}
    </div>
  }
}

class SectionName extends React.PureComponent {

  render() {
    const {sectID, name, side, indexing, updateIndexing} = this.props
    const visible = indexing[sectID] === side
    const className = addClass("HBox Entry Section", visible ? null : "Folded")
    return <div className={className} onClick={e => toggleIndexing(indexing, updateIndexing, sectID, side)}>
      <div className="Name">{name}</div>
      <Filler/>
      {visible ? <Icon.Arrow.Head.Up/> : <Icon.Arrow.Head.Down/>}
    </div>
  }
}

function toggleIndexing(indexing, updateIndexing, sectID, side) {
  updateIndexing(sectID, indexing[sectID] === side ? false : side)
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

  const updateDraft = useCallback(buffer => updateSection("draft", buffer), [updateSection])
  const updateNotes = useCallback(buffer => updateSection("notes", buffer), [updateSection])
  const updateStorybook = useCallback(buffer => updateSection("storybook", buffer), [updateSection])
  //const updateTrash = useCallback(buffer => updateSection("trashcan", buffer), [updateSection])

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

      <Slate editor={editors.draft} initialValue={doc.draft.acts} onChange={updateDraft}>
        <SlateEditable visible={active === "draft"} className="Sheet Regular" highlight={highlightText}/>
      </Slate>

      <Slate editor={editors.notes} initialValue={doc.notes.acts} onChange={updateNotes}>
        <SlateEditable visible={active === "notes"} className="Sheet Regular" highlight={highlightText}/>
      </Slate>

      <Slate editor={editors.storybook} initialValue={doc.storybook.acts} onChange={updateStorybook}>
        <SlateEditable visible={active === "storybook"} className="Sheet Regular" highlight={highlightText}/>
      </Slate>

      {/*
      <Slate editor={editors.trashcan} initialValue={doc.trashcan.acts} onChange={updateTrash}>
        <SlateEditable visible={active === "trashcan"} className="Sheet Regular" highlight={highlightText}/>
      </Slate>
      */}
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
