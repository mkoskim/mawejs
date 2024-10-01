//*****************************************************************************
//*****************************************************************************
//
// Index view for slate editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/TOC.css"

import React, {
  useCallback, useEffect,
  useDeferredValue, useMemo, memo,
} from "react"

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass, DeferredRender,
} from "./factory";

import {FormatWords} from "./components";
import {elemAsText} from "../../document";
import {wcCumulative} from "../../document/util";

//-----------------------------------------------------------------------------

export function DocIndex({name, style, activeID, section, wcFormat, include, setActive, unfold})
{
  //---------------------------------------------------------------------------
  // Actiovation function
  //---------------------------------------------------------------------------

  const onActivate = useCallback(id => {
    //console.log("Activate:", activeID, id)
    if(setActive) setActive(activeID, id)
  }, [activeID])

  //---------------------------------------------------------------------------
  // Word counts
  //---------------------------------------------------------------------------

  const total = (["percent", "cumulative"].includes(wcFormat))
    ? (section.words?.text + section.words?.missing)
    : undefined

  const cumulative = (wcFormat == "cumulative")
    ? wcCumulative(section)
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

  const includeItems = include.includes("missing") ? [...include, "fill"] : include;

  //---------------------------------------------------------------------------
  // Index
  //---------------------------------------------------------------------------

  return <VBox style={style} className="TOC">
    <IndexHead
      //wcTotal={section.words.text}
      name={name}
      section={section}
      wcFormat={wcFormat}
      />
    <PartDropZone
      activeID={activeID}
      parts={section?.parts}
      wcFormat={wcFormatFunction}
      include={includeItems}
      onActivate={onActivate}
      unfold={unfold}
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
    const {parts, wcFormat, include, onActivate, unfold} = this.props
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
    const {elem, include, wcFormat, onActivate, unfold} = this.props
    const {innerRef, draggableProps, dragHandleProps} = provided

    return <div
      className="Part"
      ref={innerRef}
      {...draggableProps}
      >
      <IndexItem
        id={elem.id}
        type={elem.type}
        name={elem.name}
        words={elem.words}
        folded={!unfold && elem.folded}
        wcFormat={wcFormat}
        onActivate={onActivate}
        {...dragHandleProps}
      />
      {(unfold || !elem.folded) && <SceneDropZone
        id={elem.id}
        scenes={elem.children}
        include={include}
        wcFormat={wcFormat}
        onActivate={onActivate}
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
    const {scenes, include, wcFormat, onActivate} = this.props
    const {innerRef, droppableProps, placeholder} = provided
    const {isDraggingOver} = snapshot

    return <div
      className={addClass("VBox SceneDropZone", isDraggingOver && "DragOver")}
      ref={innerRef}
      {...droppableProps}
    >
    {include.includes("scene") && scenes.map((elem, index) => <SceneItem
      key={elem.id}
      index={index}
      elem={elem}
      include={include}
      wcFormat={wcFormat}
      onActivate={onActivate}
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
    const {elem, include, wcFormat, onActivate} = this.props

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
      name={elem.name}
      folded={elem.folded}
      words={elem.words}
      wcFormat={wcFormat}
      onActivate={onActivate}
    />
    {!elem.folded && bookmarks.map(elem => <IndexItem
      key={elem.id}
      id={elem.id}
      type={elem.type}
      name={elemAsText(elem)}
      onActivate={onActivate}
    />)}
    </div>
  }
}

//-----------------------------------------------------------------------------

class IndexItem extends React.PureComponent {
  render() {
    const {className, id, type, name, folded, words, wcFormat, onActivate, ...rest} = this.props

    //console.log("Render IndexItem:", type, id, name)

    const typeClass = (type === "part") ? "PartName" :
      (type === "scene") ? "SceneName" :
      (type === "section") ? "SectionName" :
      ""

    const foldClass = (folded) ? "Folded" : ""

    function onClick(ev) {
      return onActivate && onActivate(id)
    }

    return <HBox className={addClass(className, typeClass, foldClass, "Entry")} onClick={onClick} {...rest}>
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
  }
}

class ItemIcon extends React.PureComponent {
  render() {
    const {type} = this.props
    switch (type) {
      case "missing":
      case "fill":
        return <span className={addClass("Box", "missing")} />
      case "comment":
      case "synopsis":
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
