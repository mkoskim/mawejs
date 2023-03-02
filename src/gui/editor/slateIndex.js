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

export function SlateTOC({activeID, setActive, wcFormat, wcTotal, include, section, style})
{
  return (
    <DeferredRender>
    <VFiller style={{...style}}>
      <Droppable droppableId={activeID} type="part">
      {TOCDroppable}
      </Droppable>
    </VFiller>
    </DeferredRender>
  )

  function TOCDroppable(provided, snapshot) {
    const {innerRef, droppableProps, placeholder} = provided

    //console.log("TOC update")

    return <div className="VBox TOC"
      ref={innerRef}
      {...droppableProps}
    >
      {section.parts.map((part, index) => <PartItem
        key={part.id}
        index={index}
        id={part.id}
        type={part.type}
        name={part.name}
        wcFormat={wcFormat}
        wcTotal={wcTotal}
        wcText={part.words?.text}
        wcMissing={part.words?.missing}
        wcCumulative={part.words?.cumulative}
        include={include}
        scenes={part.children}
        activeID={activeID}
        setActive={setActive}
      />
      )}
      {placeholder}
    </div>
  }
}

//-----------------------------------------------------------------------------

function PartItem({activeID, setActive, include, wcFormat, wcTotal, index, id, name, type, wcText, wcMissing, wcCumulative, scenes}) {

  return <Draggable
    draggableId={id}
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
        className="PartName"
        activeID={activeID}
        setActive={setActive}
        id={id}
        type={type}
        name={name}
        wcFormat={wcFormat}
        wcTotal={wcTotal}
        wcText={wcText}
        wcMissing={wcMissing}
        wcCumulative={wcCumulative}
      />
      <PartScenes />
    </div>
  }

  function PartScenes() {
    if(!include.includes("br.scene")) return null;
    return <Droppable droppableId={id} type="scene">
    {(provided, snapshot) => {
        const {innerRef, droppableProps, placeholder} = provided

        return <div className="VBox"
          ref={innerRef}
          {...droppableProps}
        >
          {scenes.map((scene, index) => <SceneItem
            key={scene.id}
            index={index}
            id={scene.id}
            type={scene.type}
            name={scene.name}
            wcFormat={wcFormat}
            wcTotal={wcTotal}
            wcText={scene.words?.text}
            wcMissing={scene.words?.missing}
            wcCumulative={scene.words?.cumulative}
            include={include}
            paragraphs={scene.children}
            activeID={activeID}
            setActive={setActive}
          />)}
          {placeholder}
        </div>

    }}
    </Droppable>
  }
}

//-----------------------------------------------------------------------------

function SceneItem({index, activeID, setActive, include, id, type, name, wcText, wcMissing, wcCumulative, wcFormat, wcTotal, paragraphs}) {
  const bookmarks = paragraphs.filter(elem => include.includes(elem.type))

  function sceneDraggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided

    return <div className="VBox Scene"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
    >
      <IndexItem
        className="SceneName"
        id={id}
        type={type}
        name={name}
        wcFormat={wcFormat}
        wcTotal={wcTotal}
        wcText={wcText}
        wcMissing={wcMissing}
        wcCumulative={wcCumulative}
        activeID={activeID}
        setActive={setActive}
      />
      <DoBookmarks activeID={activeID} setActive={setActive} bookmarks={bookmarks}/>
    </div>
  }

  return <Draggable
    draggableId={id}
    index={index}
    type="scene"
    >
      {sceneDraggable}
    </Draggable>

}

function DoBookmarks({activeID, setActive, bookmarks}) {
  if(!bookmarks.length) return null;
  return <React.Fragment>
    {bookmarks.map(elem => <IndexItem
      key={elem.id}
      id={elem.id}
      type={elem.type}
      name={elem2text(elem)}
      activeID={activeID}
      setActive={setActive}
    />)}
    </React.Fragment>
}

//-----------------------------------------------------------------------------

function IndexItem({ className, id, type, name, wcFormat, wcText, wcMissing, wcCumulative, wcTotal, setActive, activeID, ...props }) {
  const editor = useSlate()

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
        wcText={wcText}
        wcMissing={wcMissing}
        wcCumulative={wcCumulative}
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