//*****************************************************************************
//*****************************************************************************
//
// Document organizer
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

import "./styles/organizer.css"

import React, {useState, useEffect, useMemo, useCallback} from 'react';

/*
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
*/

import {
  FlexBox,
  VBox, HBox, HFiller, VFiller,
  Filler,
  ToolBox, Button, Input,
  SearchBox, addHotkeys,
  Label,
  Loading,
} from "../common/factory";

import {docLoad, docSave, docUpdate} from "./doc"

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
  return <OrganizerView id={id} doc={doc}/>
}

function OrganizerView({doc}) {
  console.log("Organizer: Doc:", doc)

  return <HBox>
    {doc.story.body.parts.map(part => <PartView part={part}/>)}
  </HBox>
}

function PartView({part}) {
  return <VBox className="PartCard">
    {part.id}
    {part.children.map(scene => <SceneView key={scene.id} scene={scene}/>)}
  </VBox>
}

function SceneView({scene}) {
  return <div className="SceneCard">
    {scene.id}
    {scene.name}
  </div>
}

/*
export function ViewSection({section, ...props}) {
  return <div className="SectionCard" {...props}>
    <DndContext onDragEnd={onDrop}>
      <div style={{width: "95%"}}>
        {section.parts.map(p => <ViewPart key={p.id} part={p}/>)}
        </div>
    </DndContext>
  </div>

  function onDrop(event) {
    const { active, over } = event;
    console.log("Active", active)
    console.log("Over", over)
  }
}

function ViewPart({part}) {

  const [scenes, setScenes] = useState(
    part.children.map(scene => ({
      id: scene.id,
      name: scene.attr.name,
    }))
  )

  return (
    <SortableContext items={scenes}>
      <div className="PartCard">
        {scenes.map(scene => <ViewScene key={scene.id} id={scene.id} scene={scene}/>)}
        </div>
    </SortableContext>
  )
}

function ViewScene({id, scene, ...props}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      className="SceneCard"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}>
    <Label className="Name" text={scene.name}/>
    </div>
  );
}

function ViewParagraph({p}) {
  return <div>{p.text}</div>
}
*/
