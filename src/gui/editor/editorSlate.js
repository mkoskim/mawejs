//*****************************************************************************
//*****************************************************************************
//
// File editor
//
// List of different editor frameworks:
// https://gist.github.com/manigandham/65543a0bc2bf7006a487
//
//*****************************************************************************
//*****************************************************************************

import "./editor.css"

/* eslint-disable no-unused-vars */

import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { useSelector, useDispatch } from "react-redux";
import { action, docByID } from "../app/store"

import { Slate, Editable, withReact } from 'slate-react'
import { createEditor } from "slate"
import { withHistory } from "slate-history"

import {ViewSection} from "./organizer"

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon,
  Input,
  SearchBox, addHotkeys,
  Label,
  Grid,
  Separator,
} from "../common/factory";

import isHotkey from 'is-hotkey';

//-----------------------------------------------------------------------------
// Choose the view
//-----------------------------------------------------------------------------

export function EditView({id}) {
  const dispatch = useDispatch();

  const doc = docByID(id)

  //console.log("ID", id, "Doc:", doc)

  useEffect(() => addHotkeys({
    "mod+o": (e) => onClose(e, dispatch),
    "mod+w": (e) => onClose(e, dispatch),
    "mod+s": null,
  }));

  //return <RawDoc doc={doc}/>
  //return <SlateDoc doc={doc}/>
  return <SingleEdit doc={doc}/>
}

//-----------------------------------------------------------------------------

function onClose(e, dispatch) {
  if(e) e.preventDefault()
  // Move modifications to doc
  dispatch(action.doc.close({}))
}

//-----------------------------------------------------------------------------
// Single edit with sidebars

function SingleEdit({doc, left, right, center}) {

  const [content, setContent] = useState(deserialize(doc).body);

  const info = getinfo(content)

  //function setBody(part)  { setContent({...content, body: part}) }
  //function setNotes(part) { setContent({...content, notes: part}) }

  const mode="Centered";
  //const mode="Primary";

  return <VFiller>
    <ToolBar doc={doc} info={info}/>
    <HFiller style={{overflow: "auto", background: "#F8F8F8"}}>
      <ViewSection
        section={doc.story.body}
        style={{minWidth: "25%", maxWidth: "25%", background: "#EEE"}}
      />
      <div
        style={{overflow: "auto"}}
        className={`Board ${mode}`}>
          <SlateEdit content={content} setContent={setContent}/>
        </div>
      </HFiller>
  </VFiller>
}

// Extract info from (living) slate buffer.

function getinfo(content) {
  // Word count from Slate buffer
  const chars = content
    .filter(elem => elem.type === "p")
    .map(elem => elem.children)
    .flat()
    .map(elem => elem.text)
    .join(" ")
    .replace(/\s+/g, ' ').trim()
    ;
  const words = chars
    .split(' ')
    ;
  return {
    words: words.length,
    chars: chars.length
  }
}

//-----------------------------------------------------------------------------

function Empty() {
  return null;
}

function RawDoc({doc}) {
  return <Grid container>
    <Grid item xs={6}>
      <pre style={{fontSize: "10pt"}}>{`${JSON.stringify(doc, null, 2)}`}</pre>
    </Grid>
    <Grid item xs={6}>
      <div className="Sheet">
        Testi.
      </div>
    </Grid>
  </Grid>
}

function SlateDoc({doc}) {
  const content = deserialize(doc).body;

  const printout = content;
  //const printout = wordcount(content)

  return <React.Fragment>
    <pre style={{fontSize: "10pt"}}>{`${JSON.stringify(printout, null, 2)}`}</pre>
  </React.Fragment>
}

//-----------------------------------------------------------------------------

function ToolBar({doc, info}) {
  const dispatch = useDispatch();
  const {words, chars} = info;

  return (
    <ToolBox>
      <Label>{doc.file.name}</Label>
      <Separator/>
      <Label>{`Words: ${words}`}</Label>
      <Separator/>
      <Label>{`Chars: ${chars}`}</Label>
      <Separator/>
      <Filler/>
      <Button onClick={(e) => onClose(e, dispatch)}><Icon.Close/></Button>
    </ToolBox>
  )
}

//-----------------------------------------------------------------------------

function SlateEdit({content, setContent}) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  return (
    <Slate editor={editor} value={content} onChange={setContent}>
    <Editable
      className="Sheet Shadow"
      autoFocus
      spellCheck={false} // Keep false until you find out how to change language
      renderElement={renderElement}
      renderLeaf={renderLeaf}
    />
  </Slate>
  )
}

//-----------------------------------------------------------------------------

function renderPlain({content}) {
}


function Element({element, attributes, children}) {
  switch(element.type) {
    case "title": return <h1 {...attributes}>{children}</h1>
    //case "scene": return <div className="scene" {...attributes}>{children}</div>
    case "scenename": return <h2 className="scene" {...attributes}>{children}</h2>
    case "br": return <br {...attributes}/>
    case "missing":
    case "comment":
    case "synopsis":
      return <p className={element.type} {...attributes}>{children}</p>
    default: return <p {...attributes}>{children}</p>
  }
}

function Leaf({leaf, attributes, children}) {
  return <span {...attributes}>{children}</span>
}

//-----------------------------------------------------------------------------

function deserialize(doc) {
  const head = Head2Slate(doc.story);
  const body = Section2Slate(doc.story.body);
  const notes = Section2Slate(doc.story.notes);

  return {
    body: head.concat(body),
    notes: notes,
  }

  function Head2Slate(story) {
    return [
      { type: "title", children: [{text: story.body.head.title}] },
    ]
  }

  function Section2Slate(section) {
    return section.parts.map(Part2Slate).flat(1)
      .concat([{type: "p", children: [{text: ""}]}])
  }

  function Part2Slate(part) {
    return part.children.map(Scene2Slate).flat(1);
  }

  function Scene2Slate(scene) {
    return [{
      type: "scenename",
      children: [{text: scene.attr.name}]
    }].concat(scene.children.map(Paragraph2Slate))
  }

  function Paragraph2Slate(p) {
    const type = p.tag;
    return {
      type: type,
      children: [{ text: p.text }]
    }
  }
}
