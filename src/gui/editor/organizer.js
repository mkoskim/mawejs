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

import { DnDFrame, DnDSource, DnDTarget, DnDTypes } from "../common/dnd";
import {Container, Draggable} from "react-smooth-dnd"

//-----------------------------------------------------------------------------

export function Organizer({uuid}) {
  var {docs} = require("../store/store")
  const doc = docs[uuid]

  console.log("Doc:", doc)
  const dispatch = useDispatch();

  return <HFiller>
    <VFiller>
      <ViewSection section={doc.story.body}/>
      </VFiller>
    <VFiller>
      <ViewSection section={doc.story.notes}/>
      </VFiller>
    </HFiller>
}

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
    console.log(removedIndex)
    console.log(addedIndex)
    console.log(payload)
    console.log(element)
  }

  return <Container onDrop={onDrop} groupName="scenes">
    {scenes.map(item => {
      return <Draggable key={item.uuid}>
        <ViewScene scene={item}/>
        </Draggable>
      })
    }
    </Container>

  /*
  return <DnDTarget className="PartCard" accepts={[DnDTypes.SCENE]}>
    <div>Part:</div>
    {scenes.map(s => <ViewScene key={s.uuid} scene={s}/>)}
  </DnDTarget>
  */
}

function ViewScene({scene}) {
  //return <div>{scene.attr.name}</div>
  return <DnDSource className="SceneCard" type={DnDTypes.SCENE}>
    {scene.name}
    </DnDSource>
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