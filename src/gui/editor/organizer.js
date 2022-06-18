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
  Icons,
  FlexBox,
  VBox, HBox, HFiller, VFiller,
  Filler,
  ToolBox, Button, Input,
  SearchBox, addHotkeys,
  Label,
} from "../common/factory";

import {Container, Draggable} from "react-smooth-dnd"
import {docByID} from "../app/store"

//-----------------------------------------------------------------------------

export function Organizer({id}) {
  const doc = docByID(id)

  console.log("Doc:", doc)
  const dispatch = useDispatch();

  return <HFiller style={{overflow: "auto"}}>
    <VBox style={{width: "200px"}}/>
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
    {section.part.map(p => <ViewPart key={p.uuid} part={p}/>)}
  </div>
}

function ViewPart({part}) {

  const [scenes, setScenes] = useState(
    part.children.map(scene => ({
      uuid: scene.uuid,
      name: scene.attr.name,
    }))
  )

  function onDrop(dropResult) {
    const { removedIndex, addedIndex, payload, element } = dropResult;
    console.log("Remove:", removedIndex)
    console.log("Add:", addedIndex)
    console.log("Payload", payload)
    console.log("Element", element)
  }

  return <div className="PartCard">
    <div>Part:</div>
    <Container
      onDrop={onDrop}
      groupName="scenes"
      animationDuration={50}
      dragClass="sceneDrag"
      //behaviour="drop-zone"
      dropPlaceholder={{
        animationDuration: 150,
        showOnTop: false,
        className: "sceneGhost"
      }}
    >
    {scenes.map(item => {
      return <Draggable key={item.uuid}>
        <ViewScene scene={item}/>
        </Draggable>
      })
    }
    </Container></div>

  /*
  return <DnDTarget className="PartCard" accepts={[DnDTypes.SCENE]}>
    {scenes.map(s => <ViewScene key={s.uuid} scene={s}/>)}
  </DnDTarget>
  */
}

function ViewScene({scene}) {
  //return <div>{scene.attr.name}</div>
  return <div className="SceneCard">
    {scene.name}
    </div>
/*
return <div>
    <div>{scene.attr.name}</div>
    {scene.children.map(p => <ViewParagraph p={p}/>)}
  </div>
*/
}

function ViewParagraph({p}) {
  return <div>{p.text}</div>
}