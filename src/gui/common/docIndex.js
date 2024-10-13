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
} from "react"

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import {
  VBox, HBox, Filler,
  addClass
} from "./factory";

import {FormatWords} from "./components";
import {elemAsText, elemName, filterCtrlElems} from "../../document";
import {elemNumbered, wcCumulative} from "../../document/util";

//-----------------------------------------------------------------------------

export function DocIndex({name, style, activeID, section, wcFormat, include, setActive, unfold, current})
{
  const refCurrent = useRef(null)

  useEffect(() =>{
    if(refCurrent.current) refCurrent.current.scrollIntoViewIfNeeded()
  }, [refCurrent.current])

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

  const cumulative = (["percent", "cumulative"].includes(wcFormat))
    ? wcCumulative(section)
    : undefined

    const total = (["percent"].includes(wcFormat))
    ? (section.words?.text + section.words?.missing)
    : undefined

  //if(activeID === "body") console.log("Index:", total, cumulative)

  const wcFormatFunction = useCallback(
    (!wcFormat || wcFormat === "off")
    ? undefined
    : (id, words) => <FormatWords
      format={wcFormat}
      words={words.text}
      missing={words.missing}
      cumulative={cumulative && id in cumulative && cumulative[id]}
      total={total}
    />,
    [wcFormat, total, cumulative]
  )
  //console.log(wcFormatFunction)

  //---------------------------------------------------------------------------
  // Included items
  //---------------------------------------------------------------------------

  const includeItems = (include.includes("missing") && !include.includes("fill")) ? [...include, "fill"] : include;

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
      include={includeItems}
      onActivate={onActivate}
      unfold={unfold}
      current={current}
      refCurrent={refCurrent}
      />
    )}
    </VBox>
  //return useDeferredValue(index)
}

//-----------------------------------------------------------------------------

class ActItem extends React.PureComponent {

  render() {
    const {elem, wcFormat, activeID, include, onActivate, unfold, current, refCurrent} = this.props

    return <div>
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
      />
      <ChapterDropZone
        activeID={activeID}
        chapters={elem.children}
        wcFormat={wcFormat}
        include={include}
        onActivate={onActivate}
        unfold={unfold}
        current={current}
        refCurrent={refCurrent}
      />
    </div>
  }
}

//-----------------------------------------------------------------------------

class ChapterDropZone extends React.PureComponent {

  render() {
    const {chapters, activeID} = this.props

    if(!chapters) return null

    //console.log("Index update:", activeID)

    return <Droppable droppableId={activeID} type="chapter">
      {this.DropZone.bind(this)}
    </Droppable>
  }

  DropZone(provided, snapshot) {
    const {chapters, wcFormat, include, onActivate, unfold, current, refCurrent} = this.props
    const {innerRef, droppableProps, placeholder} = provided

    return <div
      className="VBox"
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
      type={elem.type}
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
      onActivate={onActivate}
      current={current}
    />)}
    </div>
  }
}

//-----------------------------------------------------------------------------

class IndexItem extends React.PureComponent {

  static typeClasses = {
    "section": "SectionName",
    "act": "ActName",
    "chapter": "ChapterName",
    "scene": "SceneName",

    "missing": "BookmarkName",
    "comment": "BookmarkName",
    "synopsis": "BookmarkName",
    "fill": "BookmarkName",
    "tags": "BookmarkName",
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
      <HBox className={addClass(className, typeClass, numClass, foldClass, "Entry")} onClick={onClick} {...rest}>
      <ItemIcon type={type}/>
      <ItemLabel name={name ? name : "<Unnamed>"}/>
      <Filler/>
      {wcFormat && wcFormat(id, words)}
      </HBox>
    </ScrollRef>
  }
}

function ScrollRef({current, id, refCurrent, children}) {
  if(current === id) {
    return <div className="Current" ref={refCurrent}>{children}</div>
  }
  return children
}

class ItemIcon extends React.PureComponent {
  render() {
    const {type} = this.props
    switch (type) {
      case "missing":
      case "fill":
      case "comment":
      case "synopsis":
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
