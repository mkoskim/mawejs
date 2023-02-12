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
  Filler, Separator,
  ToolBox, Button, Input,
  SearchBox, addHotkeys,
  Label,
  Loading,
} from "../common/factory";

import {
  SectionWordInfo,
  ChooseVisibleElements, ChooseWordFormat, FormatWords,
} from "../common/components";

import {elemAsText, withWordCounts} from "../../document";

//import {docByID} from "../app/store"

//-----------------------------------------------------------------------------
// Organizer
//-----------------------------------------------------------------------------

export function Organizer({doc, setDoc}) {

  return <DragDropContext onDragEnd={onDragEnd}>
      <OrganizerView doc={doc}/>
    </DragDropContext>

  function findPart(doc, partID) {
    return (
      doc.story.body.parts.find(part => part.id === partID) ||
      doc.story.notes.parts.find(part => part.id === partID)
    )
  }

  function findSect(doc, sectID) {
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
        const sourcePart = findPart(doc, source.droppableId);
        const destinationPart = findPart(doc, destination.droppableId);

        const scene = sourcePart.children[source.index]
        sourcePart.children.splice(source.index, 1)
        destinationPart.children.splice(destination.index, 0, scene)
        setDoc({...doc})
        //setDoc(doc => {...moveScene(doc, source, destination))
        break;
      }
      case "part": {
        const sourceSect = findSect(doc, source.droppableId);
        const destinationSect = findSect(doc, destination.droppableId);

        const part = sourceSect.parts[source.index]
        sourceSect.parts.splice(source.index, 1)
        destinationSect.parts.splice(destination.index, 0, part)
        setDoc({...doc})
        //setDoc(doc => movePart(doc, source, destination))
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

  const body = withWordCounts(doc.story.body)
  const notes = doc.story.notes

  const [indexed1, setIndexed1] = useState(["synopsis"])
  const [words1, setWords1] = useState("numbers")

  const body_settings = {
    indexed: {
      choices:  ["synopsis", "missing", "comment"],
      value:    indexed1,
      setValue: setIndexed1,
    },
    words: {
      total:    body.words.text,
      choices:  ["off", "numbers", "percent", "cumulative"],
      value:    words1,
      setValue: setWords1,
    },
    numbering: true,
  }

  const note_settings = {
    indexed: {
      value: [],
    }
  }

  return <div className="Filler Organizer" style={{overflow: "auto"}}>
    <OutlinerToolbar settings={body_settings} sectWithWords={body}/>
    <Droppable droppableId="body" direction="horizontal" type="part">
    {(provided, snapshot) => {
        const {innerRef, droppableProps, placeholder} = provided
        const {words} = body

        //console.log("Body update")
        return <React.Fragment>
          <div
            ref={innerRef}
            className="HBox Section"
            {...droppableProps}
            >
            {body.parts.map((part, index) => <PartView key={part.id} index={index} settings={body_settings} part={part}/>)}
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

        return <div
          ref={innerRef}
          className="HBox Section"
          {...droppableProps}
          >
          {notes.parts.map((part, index) => <PartView key={part.id} index={index} settings={note_settings} part={part}/>)}
          {placeholder}
          </div>
      }
    }
    </Droppable>

    <hr/>

    </div>
}

//-----------------------------------------------------------------------------

function OutlinerToolbar({settings, sectWithWords}) {

  return <ToolBox style={{ background: "white" }}>
    <SectionWordInfo sectWithWords={sectWithWords}/>
    <Separator/>
    <ChooseVisibleElements elements={settings.indexed}/>
    <Separator/>
    <ChooseWordFormat format={settings.words}/>
    <Separator/>
    <Filler/>
  </ToolBox>
}

//-----------------------------------------------------------------------------
// TODO: Empty parts can be removed
// TODO: Parts can be merged?
// TODO: Add part
// TODO: Add scene
// TODO: Double click -> editor + focus at scene/part

function PartView({settings, part, index}) {
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
        <Filler/>
        <FormatWords settings={settings} words={words}/>
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
      {part.children.map((scene, index) => <SceneView key={scene.id} index={index} settings={settings} scene={scene}/>)}
      {placeholder}
    </div>
  }
}

//-----------------------------------------------------------------------------
// TODO: Edit synopsis

function SceneView({index, settings, scene}) {
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

    const {indexed} = settings
    const bookmarks = scene.children.filter(p => indexed.value.includes(p.type));

    return <div className="VBox Scene"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}  // Move these inside to create handle
    >
      <div className="Name">{scene.name && scene.name !== "" ? scene.name : "<Unnamed>"}</div>
      {bookmarks.length
        ? <React.Fragment>
          <Separator/>
          {bookmarks.map(p => <div key={p.id} className="synopsis">{elemAsText(p)}</div>)}
        </React.Fragment>
        : null
      }
    </div>
  }
}
