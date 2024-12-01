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
import {elemAsText, elemName, filterCtrlElems} from "../../document";
import {elemNumbered, wcCumulative} from "../../document/util";
import { nodeIsContainer } from "../../document/elements";

//-----------------------------------------------------------------------------

function getCurrent(parents, include) {
  if(!parents) return
  const visible = parents
    .filter(e => nodeIsContainer(e))
    .filter(e => include.includes(e.type))
  //console.log("Parents", parents, "Visible:", visible)
  return visible[visible.length-1]
}

export function DocIndex({name, style, activeID, section, wcFormat, include, setActive, unfold, parents})
{
  //---------------------------------------------------------------------------
  // Blocks -> current
  //---------------------------------------------------------------------------

  const current = getCurrent(parents, include)
  //console.log(current)

  const refCurrent = useRef(null)

  useEffect(() => {
    if(refCurrent.current) refCurrent.current.scrollIntoViewIfNeeded()
  }, [current])

  //---------------------------------------------------------------------------
  // Activation function
  //---------------------------------------------------------------------------

  const onActivate = useCallback(id => {
    //console.log("Activate:", activeID, id)
    if(setActive) setActive(activeID, id)
  }, [activeID])

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
      key={elem.id}
      index={index}
      elem={elem}
      activeID={activeID}
      wcFormat={wcFormatFunction}
      include={include}
      onActivate={onActivate}
      unfold={unfold}
      current={current?.id}
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
    const {skipActName, elem, wcFormat, activeID, include, onActivate, unfold, current, refCurrent} = this.props

    const hasDropzone = (include.includes("chapter")) && (unfold || !elem.folded)
    //const hasDropzone = (unfold || !elem.folded)

    return <div>
      {!skipActName && <IndexItem
        id={elem.id}
        type={elem.type}
        name={elemName(elem)}
        words={elem.words}
        folded={!unfold && elem.folded}
        numbered={elemNumbered(elem)}
        wcFormat={wcFormat}
        onActivate={onActivate}
        current={current}
        refCurrent={refCurrent}
      />}
      {hasDropzone && <ChapterDropZone
        id={elem.id}
        folded={!unfold && elem.folded}
        chapters={elem.children}
        wcFormat={wcFormat}
        include={include}
        onActivate={onActivate}
        unfold={unfold}
        current={current}
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
    const {chapters, wcFormat, include, onActivate, unfold, current, refCurrent} = this.props
    const {innerRef, droppableProps, placeholder} = provided
    const {isDraggingOver} = snapshot

    return <div
      className={addClass("VBox ChapterDropZone", isDraggingOver && "DragOver")}
      ref={innerRef}
      {...droppableProps}
    >
    {filterCtrlElems(chapters).map((elem, index) => <ChapterItem
      key={elem.id}
      index={index}
      elem={elem}
      include={include}
      wcFormat={wcFormat}
      onActivate={onActivate}
      unfold={unfold}
      current={current}
      refCurrent={refCurrent}
      />)}
    {placeholder}
    </div>
  }
}

class ChapterItem extends React.PureComponent {

  render() {
    const {elem, index} = this.props
    return <Draggable
      draggableId={elem.id}
      index={index}
      type="chapter"
      >
      {this.Draggable.bind(this)}
    </Draggable>
  }

  Draggable(provided, snapshot) {
    const {elem, include, wcFormat, onActivate, unfold, current, refCurrent} = this.props
    const {innerRef, draggableProps, dragHandleProps} = provided

    const hasDropzone = (include.includes("scene")) && (unfold || !elem.folded)

    //console.log(include)

    return <div
      ref={innerRef}
      {...draggableProps}
      >
      <IndexItem
        id={elem.id}
        type={elem.type}
        name={elemName(elem)}
        words={elem.words}
        folded={!unfold && elem.folded}
        numbered={elemNumbered(elem)}
        wcFormat={wcFormat}
        onActivate={onActivate}
        current={current}
        refCurrent={refCurrent}
        {...dragHandleProps}
      />
      {hasDropzone && <SceneDropZone
        id={elem.id}
        scenes={elem.children}
        include={include}
        wcFormat={wcFormat}
        onActivate={onActivate}
        current={current}
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
    const {scenes, include, wcFormat, onActivate, current, refCurrent} = this.props
    const {innerRef, droppableProps, placeholder} = provided
    const {isDraggingOver} = snapshot

    return <div
      className={addClass("VBox SceneDropZone", isDraggingOver && "DragOver")}
      ref={innerRef}
      {...droppableProps}
    >
    {filterCtrlElems(scenes).map((elem, index) => <SceneItem
      key={elem.id}
      index={index}
      elem={elem}
      include={include}
      wcFormat={wcFormat}
      onActivate={onActivate}
      current={current}
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
    const {elem, index} = this.props
    return <Draggable
      draggableId={elem.id}
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
    const {elem, include, wcFormat, onActivate, current, refCurrent} = this.props

    const bookmarks = elem.children.filter(elem => include.includes(elem.type))

    return <div
      className="VBox Scene"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
    >
    <IndexItem
      id={elem.id}
      type={elem.content}
      name={elemName(elem)}
      folded={elem.folded}
      words={elem.words}
      wcFormat={wcFormat}
      onActivate={onActivate}
      current={current}
      refCurrent={refCurrent}
    />
    {!elem.folded && bookmarks.map(elem => <IndexItem
      key={elem.id}
      id={elem.id}
      type={elem.type}
      name={elemAsText(elem)}
      wcFormat={wcFormat}
      onActivate={onActivate}
      current={current}
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
    "synopsis": "Scene",
    "notes": "Scene",

    "bookmark": "Bookmark",
    "missing": "Bookmark",
    "comment": "Bookmark",
    "fill": "Bookmark",
    "tags": "Bookmark",
  }

  static numbered = ["act", "chapter"]

  render() {
    const {className, refCurrent, id, type, name, folded, numbered, words, wcFormat, onActivate, current, ...rest} = this.props

    //console.log("Render IndexItem:", type, id, name)
    const typeClasses = this.constructor.typeClasses

    const typeClass = type in typeClasses ? typeClasses[type] : ""

    const numClass = (numbered && (this.constructor.numbered.includes(type))) ? "Numbered" : ""

    const foldClass = (folded) ? "Folded" : ""

    function onClick(ev) {
      return onActivate && onActivate(id)
    }

    return <ScrollRef current={current} id={id} refCurrent={refCurrent}>
      <HBox className={addClass(className, "Entry", typeClass, numClass, foldClass)} onClick={onClick} {...rest}>
      <ItemIcon type={type}/>
      <ItemLabel name={ItemName(type, name)}/>
      {/*<ItemLabel name={id}/>*/}
      {wcFormat && <><Filler/><span className="WordCount">{wcFormat(id, words)}</span></>}
      </HBox>
    </ScrollRef>
  }
}

function ScrollRef({current, id, refCurrent, children}) {
  if(current === id) {
    //console.log("Match:", current, id)
    return <div className="Current" ref={refCurrent}>{children}</div>
  }
  return children
}

function ItemName(type, name) {
  switch(type) {
    case "synopsis": return "Synopsis" + (name ? `: ${name}` : "")
    case "notes":    return "Notes" + (name ? `: ${name}` : "")
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
      case "comment":
      case "tags":
        return <span className={addClass("Box", type)} />
    }
    return null
  }
}

class ItemLabel extends React.PureComponent {
  render() {
    const {name} = this.props
    return <span className="Name">{name}</span>
  }
}
