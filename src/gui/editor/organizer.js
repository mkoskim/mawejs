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
import { useSelector, useDispatch } from "react-redux";

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

import {
  FlexBox,
  VBox, HBox, HFiller, VFiller,
  Filler,
  ToolBox, Button, Input,
  SearchBox, addHotkeys,
  Label,
} from "../common/factory";

import {docByID} from "../app/store"

//-----------------------------------------------------------------------------

export function Organizer({id}) {
  const doc = docByID(id)

  console.log("Doc:", doc)
  const dispatch = useDispatch();

  return <HFiller style={{overflow: "auto"}}>
    <VFiller>
      <ViewSection section={doc.story.body}/>
      </VFiller>
    <VFiller>
      <ViewSection section={doc.story.notes}/>
      </VFiller>
    </HFiller>
}

//-----------------------------------------------------------------------------
//
// Scene is the smallest individable unit of text. On the other hand, part
// is the largest amount of text you can edit at once. So lets encourage that
// writers keep parts flexible - it is just a division line you can change
// anytime you lie.
//
//-----------------------------------------------------------------------------

function ViewSection({section}) {
  return <div className="SectionCard">
    <div>Section: {section.tag}</div>
    <div>Name: {`[${section.name}]`}</div>
    <div>{section.part.map(p => <ViewPart key={p.id} part={p}/>)}</div>
  </div>
}

function ViewPart({part}) {

  const [scenes, setScenes] = useState(
    part.children.map(scene => ({
      id: scene.id,
      name: scene.attr.name,
    }))
  )

  function onDrop(event) {
    const { active, over } = event;
    console.log("Active", active)
    console.log("Over", over)
  }

  return <div className="PartCard">
      <div>Part:</div>
      <DndContext onDragEnd={onDrop}>
        <SortableContext items={scenes}>
          {scenes.map(scene => <ViewScene key={scene.id} id={scene.id} scene={scene}/>)}
        </SortableContext>
      </DndContext>
    </div>
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
    {scene.name}
    </div>
  );
}

function ViewParagraph({p}) {
  return <div>{p.text}</div>
}