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

    const {source, destination} = result;

    if(!destination) return;

    //console.log(source, "-->", destination)

    // Move scene within a part
    if(source.droppableId === destination.droppableId) {
      if(source.index === destination.index) return;
    }

    const sourcePart = findPart(source.droppableId);
    const destinationPart = findPart(destination.droppableId);

    const scene = sourcePart.children[source.index]
    sourcePart.children.splice(source.index, 1)
    destinationPart.children.splice(destination.index, 0, scene)
    setDoc(doc)

    //const sourcePart = findPart(source.droppableId)
    //const destinationPart = findPart(destination.droppableId)

    //console.log(sourcePart, "-->", destinationPart)
  }
}

function OrganizerView({doc}) {
  console.log("Organizer: Doc:", doc)

  return <div className="Filler" style={{overflow: "auto"}}>
    <HBox style={{marginBottom: "1cm"}}>
      {doc.story.body.parts.map(part => <PartView key={part.id} part={part}/>)}
      </HBox>
    </div>
}

function PartView({part}) {
  return <div className="Part">
    <div className="Name">{part.name !== "" ? part.name : "???"}</div>
    <Droppable droppableId={part.id}>{droppable}</Droppable>
  </div>

  function droppable(provided, snapshot) {
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
  return <Draggable draggableId={scene.id} index={index}>
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
