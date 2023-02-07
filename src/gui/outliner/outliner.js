//*****************************************************************************
//*****************************************************************************
//
// Document organizer
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import "./outliner.css"

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
import {withWordCounts} from "../../document";

//import {docByID} from "../app/store"

//-----------------------------------------------------------------------------
// Organizer
//-----------------------------------------------------------------------------

export function Organizer({id}) {
  const [doc, setDoc] = useState(undefined)

  useEffect(() => {
    console.log("Organizer: Updating doc...")
    if(id) docLoad(id)
      .then(content => setDoc(content))
  }, [id])

  if(!doc) return <Loading/>

  console.log("Update", doc)

  return <DragDropContext onDragEnd={onDragEnd}>
      <OrganizerView doc={doc}/>
    </DragDropContext>

  function findPart(partID) {
    return (
      doc.story.body.parts.find(part => part.id === partID) ||
      doc.story.notes.parts.find(part => part.id === partID)
    )
  }

  function findSect(sectID) {
    switch(sectID) {
      case "body": return doc.story.body;
      case "notes": return doc.story.notes;
    }
  }

  function onDragEnd(result) {
    console.log("onDragEnd:", result)

    const {type, source, destination} = result;
    //console.log(type)

    if(!destination) return;

    if(source.droppableId === destination.droppableId) {
      if(source.index === destination.index) return;
    }

    //console.log(source, "-->", destination)

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
        const sourceSect = findSect(source.droppableId);
        const destinationSect = findSect(destination.droppableId);

        const part = sourceSect.parts[source.index]
        sourceSect.parts.splice(source.index, 1)
        destinationSect.parts.splice(destination.index, 0, part)
        setDoc(doc)
        break;
      }
      default:
        console.log("Unknown draggable type:", type, result)
        break;
    }
  }
}

//-----------------------------------------------------------------------------

function OrganizerView({doc}) {
  //console.log("Organizer: Doc:", doc)

  return <div className="Filler Organizer" style={{overflow: "auto"}}>

    <Droppable droppableId="body" direction="horizontal" type="part">
    {(provided, snapshot) => {
        const {innerRef, droppableProps, placeholder} = provided
        const body = withWordCounts(doc.story.body)
        const {words} = body

        //console.log("Body update")
        return <React.Fragment>
          <Button>Words: {words?.text}</Button>
          <div
            ref={innerRef}
            className="HBox Section"
            {...droppableProps}
            >
            {body.parts.map((part, index) => <PartView key={part.id} index={index} part={part}/>)}
            {placeholder}
          </div>
          </React.Fragment>
      }
    }
    </Droppable>

    <hr/>

    <Droppable droppableId="notes" direction="horizontal" type="part">
    {(provided, snapshot) => {
        const {innerRef, droppableProps, placeholder} = provided
        const notes = doc.story.notes

        return <div
          ref={innerRef}
          className="HBox Section"
          {...droppableProps}
          >
          {notes.parts.map((part, index) => <PartView key={part.id} index={index} part={part}/>)}
          {placeholder}
          </div>
      }
    }
    </Droppable>
    </div>
}

//-----------------------------------------------------------------------------
// TODO: Empty parts can be removed
// TODO: Parts can be merged?
// TODO: Add part
// TODO: Add scene
// TODO: Double click -> editor + focus at scene/part

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
    const {words} = part;

    function Words() {
      if(words) return <React.Fragment><Filler style={{minWidth: "8pt"}}/>{words.text}</React.Fragment>
      return null;
    }

    return <div
      ref={innerRef}
      {...draggableProps}
      className="Part"
      >
      <HBox
        className="Name"
        {...dragHandleProps}
      >
        {part.name && part.name !== "" ? part.name : "<Unnamed>"}
        <Words />
      </HBox>
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

//-----------------------------------------------------------------------------
// TODO: Edit synopsis

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
      <div className="Name">{scene.name && scene.name !== "" ? scene.name : "<Unnamed>"}</div>
    </div>
  }
}
