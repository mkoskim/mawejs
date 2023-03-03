//*****************************************************************************
//*****************************************************************************
//
// Index view for slate editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/TOC.css"

import React, {
  useCallback,
  useDeferredValue, useMemo,
} from "react"

import {Editor, Node, Transforms} from "slate"
import {useSlate, ReactEditor} from "slate-react"

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  section2edit, edit2section,
  elem2text,
  elemsByID,
  focusByID,
} from "./slateEditor"

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
} from "../common/factory";

import {FormatWords} from "../common/components";

//-----------------------------------------------------------------------------

export function SlateTOC({activeID, setActive, wcFormat, include, section, style})
{
  if(!section) return null;

  //---------------------------------------------------------------------------
  // Transform section to table of IDs
  //---------------------------------------------------------------------------

  /*
  function flatPart(part) {
    const {children, ...props} = part
    const ids = children.map(elem => elem.id)
    return [{...props, children: ids}, ...children.map(flatScene).flat()]
  }

  function flatScene(scene) {
    const {children, ...props} = scene
    const ids = children.map(elem => elem.id)
    return [{...props, children: ids}, ...children]
  }

  const parts = section.parts.map(elem => elem.id)
  const entries = section.parts
    .map(flatPart)
    .flat()
    .filter(entry => include.includes(entry.type))
    .reduce((acc, elem) => ({ ...acc, [elem.id]: elem }), {})
  */

  //console.log(flat)

  //---------------------------------------------------------------------------

  /*
  return <VFiller className="TOC" style={{...style}}>
    {parts.map((id, index) => <Elem2Index
      key={id}
      index={index}
      elem={entries[id]}
      activeID={activeID}
      setActive={setActive}
    />)}
  </VFiller>
  */

  const wcTotal = section.words?.text

  return <VFiller style={{...style}}>
    <Droppable droppableId={activeID} type="part">
    {TOCDroppable}
    </Droppable>
  </VFiller>

  function TOCDroppable(provided, snapshot) {
    const {innerRef, droppableProps, placeholder} = provided

    //console.log("TOC update")

    return <div className="VBox TOC"
      ref={innerRef}
      {...droppableProps}
    >
      {section.parts.map((elem, index) => <PartItem
        key={elem.id}
        elem={elem}
        index={index}
        wcFormat={wcFormat}
        wcTotal={wcTotal}
        activeID={activeID}
        setActive={setActive}
        include={include}
      />
      )}
      {placeholder}
    </div>
  }
}

//-----------------------------------------------------------------------------

function PartItem({elem, index, activeID, setActive, wcFormat, wcTotal, include}) {

  return <Draggable
    draggableId={elem.id}
    index={index}
    type="part"
    >
    {PartDraggable}
  </Draggable>

  function PartDraggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided

    return <div
      className="Part"
      ref={innerRef}
      {...draggableProps}
    >
      <IndexItem
        {...dragHandleProps}
        elem={elem}
        wcFormat={wcFormat}
        wcTotal={wcTotal}
        activeID={activeID}
        setActive={setActive}
      />
      <SceneDroppable
        id={elem.id}
        scenes={elem.children.filter(elem => include.includes(elem.type))}
        wcFormat={wcFormat}
        wcTotal={wcTotal}
        activeID={activeID}
        setActive={setActive}
        include={include}
        />
    </div>
  }
}

function SceneDroppable({id, scenes, wcFormat, wcTotal, activeID, setActive, include}) {
  return <Droppable droppableId={id} type="scene">
  {(provided, snapshot) => {
      const {innerRef, droppableProps, placeholder} = provided

      return <div className="VBox"
        ref={innerRef}
        {...droppableProps}
      >
        {scenes.map((elem, index) => <SceneItem
          key={elem.id}
          elem={elem}
          index={index}
          wcFormat={wcFormat}
          wcTotal={wcTotal}
          activeID={activeID}
          setActive={setActive}
          include={include}
        />)}
        {placeholder}
      </div>

  }}
  </Droppable>
}

//-----------------------------------------------------------------------------

function SceneItem({elem, index, wcFormat, wcTotal, activeID, setActive, include}) {

  return <DeferredRender><Draggable
    draggableId={elem.id}
    index={index}
    type="scene"
    >
      {sceneDraggable}
    </Draggable></DeferredRender>

  function sceneDraggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided

    return <div className="VBox Scene"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
    >
      <IndexItem
        elem={elem}
        wcFormat={wcFormat}
        wcTotal={wcTotal}
        activeID={activeID}
        setActive={setActive}
      />
      <DoBookmarks
        bookmarks={elem.children.filter(elem => include.includes(elem.type))}
        activeID={activeID}
        setActive={setActive}
        />
    </div>
  }
}

function DoBookmarks({bookmarks, activeID, setActive}) {
  if(!bookmarks.length) return null;
  return <React.Fragment>
    {bookmarks.map(elem => <IndexItem
      key={elem.id}
      elem={elem}
      activeID={activeID}
      setActive={setActive}
    />)}
    </React.Fragment>
}

//-----------------------------------------------------------------------------

function IndexItem({elem, wcFormat, wcTotal, setActive, activeID, ...props}) {
  const editor = useSlate()

  const {id, type} = elem
  const name = elem.name ?? elem2text(elem)

  const className = (type === "part") ? "PartName" :
    (type === "scene") ? "SceneName" :
    ""

  const onItemClick = useCallback(async (event) => {
    //settings.activate()
    setActive(activeID)
    focusByID(editor, id)
  }, [])

  return <HBox className={addClass(className, "Entry")} onClick={onItemClick} {...props}>
      <ItemIcon type={type}/>
      <ItemLabel name={name ? name : "<Unnamed>"}/>
      <HFiller/>
      <ItemWords
        wcFormat={wcFormat}
        wcText={elem.words?.text}
        wcMissing={elem.words?.missing}
        wcCumulative={elem.words?.cumulative}
        wcTotal={wcTotal}
      />
    </HBox>
}

function ItemIcon({type}) {
  switch (type) {
    case "missing":
    case "comment":
    case "synopsis":
      return <span className={addClass("Box", type)} />
  }
  return null
}

function ItemLabel({className, name}) {
  return <span className={addClass("Name", className)}>{name}</span>
  //return <div className="Name">{id}</div>
}

function ItemWords({wcFormat, wcText, wcMissing, wcCumulative, wcTotal}) {
  if(!wcFormat || wcFormat === "off") return null;

  return <React.Fragment>{
    wcMissing
    ? (<React.Fragment>
      <span style={{color: "red"}}>{wcMissing}</span>
      <span>&nbsp;/&nbsp;</span>
      </React.Fragment>)
    : (wcText ? <Icon.Starred sx={{color: "#59F", fontSize: 14, marginRight: "4px"}}/> : null)
    }
    <FormatWords format={wcFormat} words={wcText} cumulative={wcCumulative} total={wcTotal}/>
  </React.Fragment>
}