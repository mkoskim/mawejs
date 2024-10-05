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
import {wcCumulative} from "../../document/util";

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
    <PartDropZone
      activeID={activeID}
      parts={section?.parts}
      wcFormat={wcFormatFunction}
      include={includeItems}
      onActivate={onActivate}
      unfold={unfold}
      current={current}
      refCurrent={refCurrent}
    />
    </VBox>
  //return useDeferredValue(index)
}

//-----------------------------------------------------------------------------

const IndexHead = memo(({name, section, wcFormat}) => {
  const wcFormatFunction = useCallback(
    (!wcFormat || wcFormat === "off")
    ? undefined
    : (id, words) => <FormatWords
      format={"numbers"}
      words={words.text}
      missing={words.missing}
      //cumulative={cumulative && id in cumulative && cumulative[id]}
      //total={total}
    />, [wcFormat]
  )

  return <IndexItem
    //id={elem.id}
    type={"section"}
    name={name}
    words={section.words}
    wcFormat={wcFormatFunction}
    //onActivate={onActivate}
    //{...dragHandleProps}
  />
})

//-----------------------------------------------------------------------------

class PartDropZone extends React.PureComponent {

  render() {
    const {parts, activeID} = this.props

    if(!parts) return null

    //console.log("Index update:", activeID)

    return <Droppable droppableId={activeID} type="part">
      {this.DropZone.bind(this)}
    </Droppable>
  }

  DropZone(provided, snapshot) {
    const {parts, wcFormat, include, onActivate, unfold, current, refCurrent} = this.props
    const {innerRef, droppableProps, placeholder} = provided

    return <div
      className="VBox"
      ref={innerRef}
      {...droppableProps}
    >
    {parts.map((elem, index) => <PartItem
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

class PartItem extends React.PureComponent {

  render() {
    const {elem, index} = this.props
    return <Draggable
      draggableId={elem.id}
      index={index}
      type="part"
      >
      {this.Draggable.bind(this)}
    </Draggable>
  }

  Draggable(provided, snapshot) {
    const {elem, include, wcFormat, onActivate, unfold, current, refCurrent} = this.props
    const {innerRef, draggableProps, dragHandleProps} = provided

    return <div
      className="Part"
      ref={innerRef}
      {...draggableProps}
      >
      <IndexItem
        id={elem.id}
        type={elem.type}
        name={elemName(elem)}
        words={elem.words}
        folded={!unfold && elem.folded}
        wcFormat={wcFormat}
        onActivate={onActivate}
        current={current}
        refCurrent={refCurrent}
        {...dragHandleProps}
      />
      {(unfold || !elem.folded) && <SceneDropZone
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
    {include.includes("scene") && filterCtrlElems(scenes).map((elem, index) => <SceneItem
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
  render() {
    const {className, refCurrent, id, type, name, folded, words, wcFormat, onActivate, current, ...rest} = this.props

    //console.log("Render IndexItem:", type, id, name)

    const typeClass = (type === "part") ? "PartName" :
      (type === "scene") ? "SceneName" :
      (type === "section") ? "SectionName" :
      ""

    const foldClass = (folded) ? "Folded" : ""

    function onClick(ev) {
      return onActivate && onActivate(id)
    }

    return <ScrollRef current={current} id={id} refCurrent={refCurrent}>
      <HBox className={addClass(className, typeClass, foldClass, "Entry")} onClick={onClick} {...rest}>
      <ItemIcon type={type}/>
      <ItemLabel name={name ? name : "<Unnamed>"}/>
      <Filler/>
      {wcFormat && wcFormat(id, words)}
      {/*
      <ItemWords
        id={id}
        words={words}
        wcFormat={wcFormat}
      />
      */}
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
