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
} from "../../common/factory";

import {
  ChooseVisibleElements, ChooseWordFormat, FormatWords,
} from "../../common/components";

import {elemAsText} from "../../../document";
import {elemName, filterCtrlElems, wcCumulative} from "../../../document/util";
import {onDragEndUpdateDoc} from "../common/dndDocUpdate";

//-----------------------------------------------------------------------------
// Organizer
//-----------------------------------------------------------------------------

export function OrganizerView({doc, updateDoc}) {

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

  const {draft, notes} = doc

  const [indexed1, setIndexed1] = useState(["synopsis"])
  const [words1, setWords1] = useState("numbers")

  const draft_settings = {
    indexed: {
      choices:  ["synopsis"],
      value:    indexed1,
      setValue: setIndexed1,
    },
    words: {
      choices:  ["off", "numbers", "compact", "percent", "cumulative"],
      value:    words1,
      setValue: setWords1,
      total: draft.words.text + draft.words.missing,
      cumulative: wcCumulative(draft)
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
    <OutlinerToolbar settings={draft_settings} section={draft}/>
    <Droppable droppableId="draft" direction="horizontal" type="chapter">
    {(provided, snapshot) => {
        const {innerRef, droppableProps, placeholder} = provided

        //console.log("Draft update")
        return <div
          ref={innerRef}
          className="HBox Section"
          {...droppableProps}
          >
          {draft.chapters.map((chapter, index) => <ChapterView key={chapter.id} index={index} settings={draft_settings} chapter={chapter}/>)}
          {placeholder}
        </div>
      }
    }
    </Droppable>

    <hr/>

    <Droppable droppableId="notes" direction="horizontal" type="chapter">
    {(provided, snapshot) => {
        const {innerRef, droppableProps, placeholder} = provided

        return <div
          ref={innerRef}
          className="HBox Section"
          {...droppableProps}
          >
          {notes.chapters.map((chapter, index) => <ChapterView key={chapter.id} index={index} settings={note_settings} chapter={chapter}/>)}
          {placeholder}
          </div>
      }
    }
    </Droppable>

    <hr/>
    </div>
}

//-----------------------------------------------------------------------------
// TODO: Empty chapters can be removed
// TODO: Chapters can be merged?
// TODO: Add chapter
// TODO: Add scene
// TODO: Double click -> editor + focus at scene/chapter

function ChapterView({settings, chapter, index}) {
  return <Draggable
    draggableId={chapter.id}
    index={index}
    type="chapter"
    >
      {chapterDraggable}
    </Draggable>

  function chapterDraggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided
    const {words} = chapter;
    const name = elemName(chapter)

    return <div
      ref={innerRef}
      {...draggableProps}
      className="VBox Chapter"
      >
      <HBox
        className="Name"
        //onDoubleClick={ev => settings.focusTo(chapter.id)}
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
            cumulative={settings.words.cumulative[chapter.id]}
          />
          : null
        }
      </HBox>
      <Droppable
        droppableId={chapter.id}
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
      {filterCtrlElems(chapter.children).map((scene, index) => <SceneView key={scene.id} index={index} settings={settings} scene={scene}/>)}
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
