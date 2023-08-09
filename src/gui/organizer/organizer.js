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

import {elemAsText} from "../../document";
import {wcChildren, wcCumulative} from "../../document/util";
import {onDragEndUpdateDoc} from "../common/dndDocUpdate";

//-----------------------------------------------------------------------------
// Organizer
//-----------------------------------------------------------------------------

export function Organizer({doc, setDoc, setFocusTo}) {

  return <DragDropContext onDragEnd={onDragEnd}>
      <OrganizerView
        doc={doc}
        setFocusTo={setFocusTo}
      />
    </DragDropContext>

  function onDragEnd(result) {
    onDragEndUpdateDoc(doc, setDoc, result)
  }

  /*
  function onDragEnd(result) {
    console.log("onDragEnd:", result)

    const {type, source, destination} = result;
    //console.log(type)

    if(!destination) return;

    if(source.droppableId === destination.droppableId) {
      if(source.index === destination.index) return;
    }

    //console.log(source, "-->", destination)

    function updateSection(section) {
      const parts = section.parts.map(part => ({
        ...part,
        words: wcChildren(part.children)
      }))
      return {
        ...section,
        parts,
        words: wcChildren(parts)
      }
    }

    function updateDoc() {
      setDoc({
        ...doc,
        story: {
          ...doc.story,
          body: updateSection(doc.story.body),
          notes: updateSection(doc.story.notes)
        }
      })
    }

    switch(type) {
      case "scene": {
        const sourcePart = findPart(doc, source.droppableId);
        const destinationPart = findPart(doc, destination.droppableId);

        const scene = sourcePart.children[source.index]
        sourcePart.children.splice(source.index, 1)
        destinationPart.children.splice(destination.index, 0, scene)
        updateDoc()
        break;
      }
      case "part": {
        const sourceSect = findSect(doc, source.droppableId);
        const destinationSect = findSect(doc, destination.droppableId);

        const part = sourceSect.parts[source.index]
        sourceSect.parts.splice(source.index, 1)
        destinationSect.parts.splice(destination.index, 0, part)
        updateDoc()
        break;
      }
      default:
        console.log("Unknown draggable type:", type, result)
        break;
    }
  }
  */
}

//-----------------------------------------------------------------------------

function OutlinerToolbar({settings, section}) {
  const {indexed, words} = settings

  return <ToolBox style={{ background: "white" }}>
    <Label>Experimental</Label>
    <Separator/>
    <ChooseVisibleElements
      choices={indexed.choices}
      selected={indexed.value}
      setSelected={indexed.setValue}
      />
    <Separator/>
    <ChooseWordFormat
      choices={words.choices}
      selected={words.value}
      setSelected={words.setValue}
      />
    <Separator/>
    <SectionWordInfo section={section}/>
    <Separator/>
    <Filler/>
  </ToolBox>
}

//-----------------------------------------------------------------------------

function OrganizerView({doc, setFocusTo}) {
  //console.log("Organizer: Doc:", doc)

  const body = doc.story.body
  const notes = doc.story.notes

  const [indexed1, setIndexed1] = useState(["synopsis"])
  const [words1, setWords1] = useState("numbers")

  const body_settings = {
    indexed: {
      choices:  ["synopsis"],
      value:    indexed1,
      setValue: setIndexed1,
    },
    words: {
      choices:  ["off", "numbers", "percent", "cumulative"],
      value:    words1,
      setValue: setWords1,
      total: body.words.text,
      cumulative: wcCumulative(body)
    },
    focusTo: id => setFocusTo({sectID: "body", id}),
  }

  const note_settings = {
    indexed: {
      value: [],
    },
    words: {
      value: "off",
    },
    focusTo: id => setFocusTo({sectID: "notes", id}),
  }

  return <div className="Filler Organizer" style={{overflow: "auto"}}>
    <OutlinerToolbar settings={body_settings} section={body}/>
    <Droppable droppableId="body" direction="horizontal" type="part">
    {(provided, snapshot) => {
        const {innerRef, droppableProps, placeholder} = provided

        //console.log("Body update")
        return <div
          ref={innerRef}
          className="HBox Section"
          {...droppableProps}
          >
          {body.parts.map((part, index) => <PartView key={part.id} index={index} settings={body_settings} part={part}/>)}
          {placeholder}
        </div>
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

    return <div
      ref={innerRef}
      {...draggableProps}
      className="VBox Part"
      >
      <HBox
        className="Name"
        onDoubleClick={ev => settings.focusTo(part.id)}
        {...dragHandleProps}
      >
        {part.name && part.name !== "" ? part.name : "<Unnamed>"}
        <Filler/>
        {(settings.words?.value && settings.words.value !== "off")
          ? <FormatWords
            format={settings.words.value}
            words={words?.text}
            total={settings.words.total}
            cumulative={settings.words.cumulative[part.id]}
          />
          : null
        }
      </HBox>
      <Droppable
        droppableId={part.id}
        //direction="horizontal"
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

    return <div className="VBox List"
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
      onDoubleClick={ev => settings.focusTo(scene.id)}
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
