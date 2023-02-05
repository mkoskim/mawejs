//*****************************************************************************
//*****************************************************************************
//
// Document organizer
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import "./organizer.css"

import React, {useState, useEffect, useMemo, useCallback} from 'react';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  FlexBox,
  VBox, HBox, HFiller, VFiller,
  Filler,
  ToolBox, Button, Input,
  SearchBox, addHotkeys,
  Label,
  Loading,
} from "../common/factory";

import {docLoad, docSave, docUpdate} from "../editor/doc"

//import {docByID} from "../app/store"

//-----------------------------------------------------------------------------

export function Organizer({id}) {
  const [doc, setDoc] = useState(undefined)

  useEffect(() => {
    console.log("Organizer: Updating doc...")
    if(id) docLoad(id)
      .then(content => setDoc(content))
  }, [id])

  if(!doc) return <Loading/>

  return <DragDropContext
    //onDragStart={onDragStart}
    //onDragUpdate={onDragUpdate}
    onDragEnd={onDragEnd}
    >
      <OrganizerView id={id} doc={doc}/>
    </DragDropContext>

  function findPart(partID) {
    return doc.story.body.parts.find(part => part.id === partID)
  }

  function onDragEnd(result) {
    //console.log("onDragEnd:", result)

    const {type, source, destination} = result;
    console.log(type)

    if(!destination) return;

    //console.log(source, "-->", destination)

    // Move scene within a part
    if(source.droppableId === destination.droppableId) {
      if(source.index === destination.index) return;
    }

    switch(type) {
      case "scene": {
        const sourcePart = findPart(source.droppableId);
        const destinationPart = findPart(destination.droppableId);

        const scene = sourcePart.children[source.index]
        sourcePart.children.splice(source.index, 1)
        destinationPart.children.splice(destination.index, 0, scene)
        setDoc(doc)
        break;
      }
      case "part": {
        const part = doc.story.body.parts[source.index]
        doc.story.body.parts.splice(source.index, 1)
        doc.story.body.parts.splice(destination.index, 0, part)
        setDoc(doc)
        break;
      }
      default: break;
    }
  }
}

function OrganizerView({doc}) {
  console.log("Organizer: Doc:", doc)

  return <div className="Filler" style={{overflow: "auto"}}>
    <Droppable droppableId="body" direction="horizontal" type="part">
      {partDroppable}
    </Droppable>
    </div>

  function partDroppable(provided, snapshot) {
    const {innerRef, droppableProps, placeholder} = provided

    return <div
      ref={innerRef}
      className="HBox Organizer" style={{marginBottom: "1cm"}}
      {...droppableProps}
      >
      {doc.story.body.parts.map((part, index) => <PartView key={part.id} index={index} part={part}/>)}
      {placeholder}
      </div>
  }
}

function PartView({part, index}) {
  return <Draggable
    draggableId={part.id}
    index={index}
    type="part"
    >
      {partDraggable}
    </Draggable>

  function partDraggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided

    return <div
      ref={innerRef}
      {...draggableProps}
      className="Part"
      >
      <div
        className="Name"
        {...dragHandleProps}  // Move these inside to create handle
      >
        {part.name !== "" ? part.name : "???"}
      </div>
      <Droppable
        droppableId={part.id}
        type="scene"
        >
        {sceneDroppable}
        </Droppable>
    </div>
  }

  function sceneDroppable(provided, snapshot) {
    const {innerRef, droppableProps, placeholder} = provided
    const {
      isDraggingOver,   // true/false
      draggingOverWith  // draggable id
    } = snapshot

    return <div className="List"
    ref={innerRef}
    {...droppableProps}
    >
      {part.children.map((scene, index) => <SceneView key={scene.id} index={index} scene={scene}/>)}
      {placeholder}
    </div>
  }
}

function SceneView({scene, index}) {
  return <Draggable
    draggableId={scene.id}
    index={index}
    type="scene"
    >
    {draggable}
  </Draggable>

  function draggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided
    const {
      isDragging,   // true/false
      draggingOver, // droppable id
    } = snapshot

    return <div className="HBox Scene"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}  // Move these inside to create handle
    >
    <div>{scene.name !== "" ? scene.name : "???"}</div>
    </div>
  }
}
