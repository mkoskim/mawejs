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
  SearchBox,
  Label,
  Loading,
} from "../common/factory";

import {
  ChooseVisibleElements, ChooseWordFormat, FormatWords,
} from "../common/components";

import {elemAsText} from "../../document";
import {elemName, filterCtrlElems, wcCumulative} from "../../document/util";
import {onDragEndUpdateDoc} from "../common/dndDocUpdate";

//-----------------------------------------------------------------------------
// Organizer
//-----------------------------------------------------------------------------

export function Organizer({doc, updateDoc}) {

  return <DragDropContext onDragEnd={onDragEnd}>
      <OrganizerView
        doc={doc}
        updateDoc={updateDoc}
      />
    </DragDropContext>

  function onDragEnd(result) {
    onDragEndUpdateDoc(doc, updateDoc, result)
  }
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
    <Filler/>
  </ToolBox>
}

//-----------------------------------------------------------------------------

function OrganizerView({doc, updateDoc}) {
  //console.log("Organizer: Doc:", doc)

  const {body, notes} = doc

  const [indexed1, setIndexed1] = useState(["synopsis"])
  const [words1, setWords1] = useState("numbers")

  const body_settings = {
    indexed: {
      choices:  ["synopsis"],
      value:    indexed1,
      setValue: setIndexed1,
    },
    words: {
      choices:  ["off", "numbers", "compact", "percent", "cumulative"],
      value:    words1,
      setValue: setWords1,
      total: body.words.text + body.words.missing,
      cumulative: wcCumulative(body)
    },
  }

  const note_settings = {
    indexed: {
      value: [],
    },
    words: {
      value: "off",
    },
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
    const name = elemName(part)

    return <div
      ref={innerRef}
      {...draggableProps}
      className="VBox Part"
      >
      <HBox
        className="Name"
        //onDoubleClick={ev => settings.focusTo(part.id)}
        {...dragHandleProps}
      >
        {name && name !== "" ? name : "<Unnamed>"}
        <Filler/>
        {(settings.words?.value && settings.words.value !== "off")
          ? <FormatWords
            format={settings.words.value}
            words={words?.text}
            missing={words?.missing}
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
      {filterCtrlElems(part.children).map((scene, index) => <SceneView key={scene.id} index={index} settings={settings} scene={scene}/>)}
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
    const name = elemName(scene)
    const bookmarks = scene.children.filter(p => indexed.value.includes(p.type));

    return <div className="VBox Scene"
      ref={innerRef}
      //onDoubleClick={ev => settings.focusTo(scene.id)}
      {...draggableProps}
      {...dragHandleProps}  // Move these inside to create handle
    >
      <div className="Name">{name && name !== "" ? name : "<Unnamed>"}</div>
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
