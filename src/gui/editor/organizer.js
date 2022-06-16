//*****************************************************************************
//*****************************************************************************
//
// Document organizer
//
//*****************************************************************************
//*****************************************************************************

import "./organizer.css"

import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { useSelector, useDispatch } from "react-redux";

export function Organizer({uuid}) {
  var {docs} = require("../store/store")
  const doc = docs[uuid]

  console.log("Doc:", doc)
  const dispatch = useDispatch();

  return <div>
    {doc.story.body.part.map(p => <ViewPart part={p}/>)}
    </div>
}

function ViewPart({part}) {
  return <div>
    {part.children.map(s => <ViewScene scene={s}/>)}
  </div>
}

function ViewScene({scene}) {
  return <div>{scene.attr.name}</div>
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