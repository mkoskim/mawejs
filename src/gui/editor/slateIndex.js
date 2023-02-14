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

export function SlateTOC({settings, section, style})
{
  function TOCDroppable(provided, snapshot) {
    const {innerRef, droppableProps, placeholder} = provided

    return <div className="VBox TOC"
      ref={innerRef}
      {...droppableProps}
    >
      {section.parts.map((part, index) => <PartItem key={part.id} index={index} settings={settings} part={part}/>
      )}
      {placeholder}
    </div>
  }

  return (
    <DeferredRender>
    <VFiller style={{...style}}>
      <Droppable droppableId={settings.sectID} type="part">
      {TOCDroppable}
      </Droppable>
    </VFiller>
    </DeferredRender>
  )
}

//-----------------------------------------------------------------------------

function PartItem({settings, index, part}) {
  const {id, name, type, words} = part;
  const props = {id, type, name, words}

  function PartDraggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided

    return <div
      className="Part"
      ref={innerRef}
      {...draggableProps}
    >
      <IndexItem className="PartName" settings={settings} {...dragHandleProps} {...props} />
      <PartScenes />
    </div>
  }

  function PartScenes() {
    if(!settings.indexed.value.includes("br.scene")) return null;
    return <Droppable droppableId={part.id} type="scene">
    {(provided, snapshot) => {
        const {innerRef, droppableProps, placeholder} = provided

        return <div className="VBox"
          ref={innerRef}
          {...droppableProps}
        >
          {part.children.map((scene, index) => <SceneItem key={scene.id} index={index} settings={settings} scene={scene}/>)}
          {placeholder}
        </div>

    }}
    </Droppable>
  }

  return <Draggable
    draggableId={id}
    index={index}
    type="part"
    >
      {PartDraggable}
    </Draggable>
}

//-----------------------------------------------------------------------------

function SceneItem({index, settings, scene}) {
  const {id, name, type, words} = scene;
  const props = {id, type, name, words}

  const bookmarks = scene.children.filter(elem => settings.indexed.value.includes(elem.type))

  function sceneDraggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided

    return <div className="VBox Scene"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
    >
      <IndexItem className="SceneName" settings={settings} {...props}/>
      <DoBookmarks settings={settings} bookmarks={bookmarks}/>
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

function DoBookmarks({settings, bookmarks}) {
  if(!bookmarks.length) return null;
  return <React.Fragment>
    {bookmarks.map(elem => <BookmarkItem key={elem.id} settings={settings} bookmark={elem}/>)}
    </React.Fragment>
}

function BookmarkItem({settings, bookmark}) {
  const {id, type} = bookmark;
  const name = elem2text(bookmark)

  return <IndexItem settings={settings} id={id} type={type} name={name}/>
}

function IndexItem({ className, settings, id, type, name, words, ...props }) {
  const editor = useSlate()

  const onItemClick = useCallback(async (event) => {
    // TODO: Find better way to search node
    settings.activate()
    focusByID(editor, id)
  }, [])

  return <HBox className={addClass(className, "Entry")} onClick={onItemClick} {...props}>
      <ItemIcon type={type}/>
      <ItemLabel name={name ? name : "<Unnamed>"}/>
      <HFiller/>
      <ItemWords settings={settings} words={words} />
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

function ItemWords({settings, words}) {
  if(!words?.text) return null;

  return <React.Fragment>{
    words?.missing
    ? (<React.Fragment>
      <span style={{color: "red"}}>{words.missing}</span>
      <span>&nbsp;/&nbsp;</span>
      </React.Fragment>)
    : null
    }
    <FormatWords settings={settings} words={words}/>
  </React.Fragment>
}