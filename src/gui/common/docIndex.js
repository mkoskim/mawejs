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
  useDeferredValue, useMemo,
} from "react"

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass, DeferredRender,
} from "./factory";

import {FormatWords} from "./components";
import {elemAsText} from "../../document";
import {wcCumulative} from "../../document/util";

//-----------------------------------------------------------------------------

export function DocIndex({style, activeID, section, wcFormat, include, setActive})
{
  const onActivate = useCallback(id => {
    //console.log("Activate:", activeID, id)
    setActive(activeID, id)
  }, [activeID])

  const total = (["percent", "cumulative"].includes(wcFormat))
    ? section.words?.text
    : undefined

  const cumulative = (wcFormat == "cumulative")
    ? wcCumulative(section)
    : undefined

  //if(activeID === "body") console.log("Index:", total, cumulative)

  const wcFormatFunction = useCallback(
    (!wcFormat || wcFormat === "off")
    ? undefined
    : (id, wcText) => <FormatWords
      format={wcFormat}
      words={wcText}
      cumulative={cumulative && id in cumulative && cumulative[id]}
      total={total}
    />,
    [wcFormat, total, cumulative]
  )

  return <VBox style={style} className="TOC">
    <PartDropZone
      activeID={activeID}
      parts={section?.parts}
      wcFormat={wcFormatFunction}
      include={include}
      onActivate={onActivate}
    />
    </VBox>

  //return useDeferredValue(index)
}

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
    const {parts, wcFormat, include, onActivate} = this.props
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
    const {elem, include, wcFormat, onActivate} = this.props
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
        wcFormat={wcFormat}
        onActivate={onActivate}
        {...dragHandleProps}
      />
      <SceneDropZone
        id={elem.id}
        scenes={elem.children}
        include={include}
        wcFormat={wcFormat}
        onActivate={onActivate}
      />
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
      words={elem.words}
      wcFormat={wcFormat}
      onActivate={onActivate}
    />
    {bookmarks.map(elem => <IndexItem
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
    const {id, type, name, words, wcFormat, onActivate, ...rest} = this.props

    //console.log("Render IndexItem:", type, id, name)

    const className = (type === "part") ? "PartName" :
      (type === "scene") ? "SceneName" :
      ""

    function onClick(ev) {
      onActivate(id)
    }

    return <HBox className={addClass(className, "Entry")} onClick={onClick} {...rest}>
      <ItemIcon type={type}/>
      <ItemLabel name={name ? name : "<Unnamed>"}/>
      <Filler/>
      <ItemWords
        id={id}
        words={words}
        wcFormat={wcFormat}
      />
    </HBox>
  }
}

class ItemIcon extends React.PureComponent {
  render() {
    const {type} = this.props
    switch (type) {
      case "missing":
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

class ItemWords extends React.PureComponent {
  render() {
    const {wcFormat, id, words} = this.props
    if(!wcFormat || !words) return null;

    const wcText = words?.text
    const wcMissing = words?.missing

    return <React.Fragment>{
      wcMissing
      ? (<React.Fragment>
        <span style={{color: "red"}}>{wcMissing}</span>
        <span>&nbsp;/&nbsp;</span>
        </React.Fragment>)
      : (wcText ? <Icon.Starred sx={{color: "#59F", fontSize: 14, marginRight: "4px"}}/> : null)
      }
      {wcFormat(id, wcText)}
    </React.Fragment>
  }
}
