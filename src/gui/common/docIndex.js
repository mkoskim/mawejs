//*****************************************************************************
//*****************************************************************************
//
// Index view for slate editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/TOC.css"

import React, {
  useCallback, memo, useRef,
  useEffect,
  useDeferredValue,
} from "react"

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import {
  VBox, HBox, Filler,
  addClass
} from "./factory";

import {FormatWords} from "./components";
import {elemAsText, elemName} from "../../document";
import {elemNumbered, nodeIsCtrl, wcCumulative} from "../../document/util";
import {IDappend, IDtoPath} from "../editor/slateDnD";

//*****************************************************************************
//
// Helpers
//
//*****************************************************************************

//-----------------------------------------------------------------------------

function getAt(activeID, current) {
  if(!current) return {}
  const {sectID, path} = IDtoPath(current)
  if(sectID !== activeID) return {}
  return {
    act: path[0],
    chapter: path.length > 1 ? path[1] : undefined,
    scene: path.length > 2 ? path[2] : undefined,
  }
}

//*****************************************************************************
//
// Document index
//
//*****************************************************************************

export function DocIndex({style, activeID, section, wcFormat, include, setActive, unfold, current})
{
  //---------------------------------------------------------------------------
  // Path to section
  //---------------------------------------------------------------------------

  const at = getAt(activeID, current)
  //const current = getCurrent(parents, include)
  //console.log(at)

  const refCurrent = useRef(null)

  useEffect(() => {
    if(refCurrent.current) refCurrent.current.scrollIntoViewIfNeeded()
  }, [current])

  //---------------------------------------------------------------------------
  // Activation function
  //---------------------------------------------------------------------------

  const onActivate = useCallback(id => {
    //console.log("Activate:", activeID, id)
    if(setActive) setActive(id)
  }, [setActive])

  //---------------------------------------------------------------------------
  // Word counts
  //---------------------------------------------------------------------------

  const cumulative = useDeferredValue((["percent", "cumulative"].includes(wcFormat))
    ? wcCumulative(section)
    : undefined
  )

  const total = (["percent"].includes(wcFormat))
    ? (section.words?.text + section.words?.missing)
    : undefined

  //if(activeID === "body") console.log("Index:", total, cumulative)

  const wcFormatFunction = useCallback(
    (!wcFormat || wcFormat === "off")
    ? undefined
    : (id, words) => <FormatWords
      format={wcFormat}
      text={words?.text}
      missing={words?.missing}
      padding={words?.padding}
      cumulative={cumulative && id in cumulative && cumulative[id]}
      total={total}
    />,
    [wcFormat, total, cumulative]
  )
  //console.log(wcFormatFunction)

  //---------------------------------------------------------------------------
  // Single unnamed act -> don't show
  //---------------------------------------------------------------------------

  const skipActName = (section.acts.length === 1 && !elemName(section.acts[0]))

  //---------------------------------------------------------------------------
  // Index
  //---------------------------------------------------------------------------

  return <VBox style={style} className="TOC">
    {section.acts.map((elem, index) => <ActItem
      key={index}
      id={IDappend(activeID, index)}
      elem={elem}
      wcFormat={wcFormatFunction}
      include={include}
      onActivate={onActivate}
      unfold={unfold}
      atAct={at.act === index}
      atChapter={at.act === index ? at.chapter : undefined}
      atScene={at.act === index ? at.scene : undefined}
      refCurrent={refCurrent}
      skipActName={skipActName}
      />
    )}
    </VBox>
  //return useDeferredValue(index)
}

//-----------------------------------------------------------------------------

class ActItem extends React.PureComponent {

  render() {
    const {skipActName, elem, wcFormat, id, include, onActivate, unfold, atAct, atChapter, atScene, refCurrent} = this.props

    const hasDropzone = (include.includes("chapter")) && (unfold || !elem.folded)
    //const hasDropzone = (unfold || !elem.folded)

    function isCurrent() {
      if(!atAct) return false
      if(!hasDropzone) return true
      if(atChapter === undefined) return true
      if(elem.children[atChapter].type === "hact") return true
      return false
    }

    return <div>
      {!skipActName && <IndexItem
        id={id}
        type={elem.type}
        name={elemName(elem)}
        words={elem.words}
        folded={!unfold && elem.folded}
        numbered={elemNumbered(elem)}
        wcFormat={wcFormat}
        onActivate={onActivate}
        isCurrent={isCurrent()}
        refCurrent={refCurrent}
      />}
      {hasDropzone && <ChapterDropZone
        id={id}
        folded={!unfold && elem.folded}
        chapters={elem.children}
        wcFormat={wcFormat}
        include={include}
        onActivate={onActivate}
        unfold={unfold}
        atChapter={atChapter}
        atScene={atScene}
        refCurrent={refCurrent}
      />}
    </div>
  }
}

//-----------------------------------------------------------------------------

class ChapterDropZone extends React.PureComponent {

  render() {
    const {chapters, id} = this.props

    if(!chapters) return null

    //console.log("Index update:", activeID)

    return <Droppable droppableId={id} type="chapter">
      {this.DropZone.bind(this)}
    </Droppable>
  }

  DropZone(provided, snapshot) {
    const {chapters, id, wcFormat, include, onActivate, unfold, atChapter, atScene, refCurrent} = this.props
    const {innerRef, droppableProps, placeholder} = provided
    const {isDraggingOver} = snapshot

    return <div
      className={addClass("VBox ChapterDropZone", isDraggingOver && "DragOver")}
      ref={innerRef}
      {...droppableProps}
    >
    {chapters.map((elem, index) => !nodeIsCtrl(elem) && <ChapterItem
      key={index}
      id={id}
      index={index}
      elem={elem}
      include={include}
      wcFormat={wcFormat}
      onActivate={onActivate}
      unfold={unfold}
      atChapter={atChapter === index}
      atScene={atChapter === index ? atScene : undefined}
      refCurrent={refCurrent}
      />)}
    {placeholder}
    </div>
  }
}

class ChapterItem extends React.PureComponent {

  render() {
    const {id, index} = this.props
    return <Draggable
      draggableId={IDappend(id, index)}
      index={index}
      type="chapter"
      >
      {this.Draggable.bind(this)}
    </Draggable>
  }

  Draggable(provided, snapshot) {
    const {elem, id, index, include, wcFormat, onActivate, unfold, atChapter, atScene, refCurrent} = this.props
    const {innerRef, draggableProps, dragHandleProps} = provided

    const ID = IDappend(id, index)
    const hasDropzone = (include.includes("scene")) && (unfold || !elem.folded)

    function isCurrent() {
      if(!atChapter) return false
      if(!hasDropzone) return true
      if(atScene === undefined) return true
      if(elem.children[atScene].type === "hchapter") return true
      return false
    }

    //console.log(include)

    return <div
      ref={innerRef}
      {...draggableProps}
      >
      <IndexItem
        id={ID}
        type={elem.type}
        name={elemName(elem)}
        words={elem.words}
        folded={!unfold && elem.folded}
        numbered={elemNumbered(elem)}
        wcFormat={wcFormat}
        onActivate={onActivate}
        isCurrent={isCurrent()}
        refCurrent={refCurrent}
        {...dragHandleProps}
      />
      {hasDropzone && <SceneDropZone
        id={ID}
        scenes={elem.children}
        include={include}
        wcFormat={wcFormat}
        onActivate={onActivate}
        atScene={atScene}
        refCurrent={refCurrent}
      />}
    </div>
  }
}

class SceneDropZone extends React.PureComponent {

  render() {
    const {id} = this.props

    return <Droppable droppableId={id} type="scene">
      {this.DropZone.bind(this)}
    </Droppable>
  }

  DropZone(provided, snapshot) {
    const {scenes, id, index, include, wcFormat, onActivate, atScene, refCurrent} = this.props
    const {innerRef, droppableProps, placeholder} = provided
    const {isDraggingOver} = snapshot

    return <div
      className={addClass("VBox SceneDropZone", isDraggingOver && "DragOver")}
      ref={innerRef}
      {...droppableProps}
    >
    {scenes.map((elem, index) => !nodeIsCtrl(elem) && <SceneItem
      key={index}
      id={IDappend(id, index)}
      index={index}
      elem={elem}
      include={include}
      wcFormat={wcFormat}
      onActivate={onActivate}
      isCurrent={index === atScene}
      refCurrent={refCurrent}
      />)}
    {placeholder}
    </div>
  }
}

//-----------------------------------------------------------------------------

class SceneItem extends React.PureComponent {

  render() {
    //*
    const {id, index} = this.props
    return <Draggable
      draggableId={id}
      index={index}
      type="scene"
    >
      {this.Draggable.bind(this)}
    </Draggable>
    /*/
    return this.Draggable()
    /**/
  }

  Draggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided
    const {elem, id, include, wcFormat, onActivate, isCurrent, refCurrent} = this.props

    const bookmarks = elem.children
      .map((elem, index) => [index, elem])
      .filter(([index, elem]) => include.includes(elem.type))

    return <div
      className="VBox Scene"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
    >
    <IndexItem
      id={id}
      type={elem.content}
      name={elemName(elem)}
      folded={elem.folded}
      words={elem.words}
      wcFormat={wcFormat}
      onActivate={onActivate}
      isCurrent={isCurrent}
      refCurrent={refCurrent}
    />
    {!elem.folded && bookmarks.map(([index, elem]) => <IndexItem
      key={index}
      id={IDappend(id, index)}
      type={elem.type}
      name={elemAsText(elem)}
      wcFormat={wcFormat}
      onActivate={onActivate}
    />)}
    </div>
  }
}

//-----------------------------------------------------------------------------

class IndexItem extends React.PureComponent {

  static typeClasses = {
    "section": "Section",
    "act": "Act",
    "chapter": "Chapter",
    "scene": "Scene",
    "synopsis": "Scene Synopsis",
    "notes": "Scene Notes",

    "bookmark": "Bookmark",
    "missing": "Bookmark",
    "comment": "Bookmark",
    "fill": "Bookmark",
    "tags": "Bookmark",
  }

  static numbered = ["act", "chapter"]

  render() {
    const {className, isCurrent, refCurrent, id, type, name, folded, numbered, words, wcFormat, onActivate, ...rest} = this.props

    //console.log("Render IndexItem:", type, id, name)
    const typeClasses = this.constructor.typeClasses

    const typeClass = type in typeClasses ? typeClasses[type] : ""

    const numClass = (numbered && (this.constructor.numbered.includes(type))) ? "Numbered" : ""

    const foldClass = (folded) ? "Folded" : ""

    function onClick(ev) {
      return onActivate && onActivate(id)
    }

    return <ScrollRef isCurrent={isCurrent} refCurrent={refCurrent}>
      <HBox className={addClass(className, "Entry", typeClass, numClass, foldClass)} onClick={onClick} {...rest}>
      <ItemIcon type={type}/>
      <ItemLabel type={type} name={name}/>
      {wcFormat && <><Filler/><span className="WordCount">{wcFormat(id, words)}</span></>}
      </HBox>
    </ScrollRef>
  }
}

function ScrollRef({isCurrent, refCurrent, children}) {
  if(isCurrent) {
    //console.log("Match:", current, id)
    return <div className="Current" ref={refCurrent}>{children}</div>
  }
  return children
}

function ItemName(type, name) {
  switch(type) {
    case "synopsis": return (name?.length) ? name : "Synopsis" // "Synopsis" + (name ? `: ${name}` : "")
    case "notes":    return (name?.length) ? name : "Notes" // return "Notes" + (name ? `: ${name}` : "")
    default: break;
  }
  return name ? name : "<Unnamed>"
}

class ItemIcon extends React.PureComponent {
  render() {
    const {type} = this.props
    switch (type) {
      case "bookmark":
      case "missing":
      case "fill":
      //case "synopsis":
      //case "notes":
      case "comment":
      case "tags":
        return <span className={addClass("Box", type)} />
    }
    return null
  }
}

class ItemLabel extends React.PureComponent {
  render() {
    const {type, name} = this.props
    return <span className="Name">{ItemName(type, name)}</span>
  }
}
