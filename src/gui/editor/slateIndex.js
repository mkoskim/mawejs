//*****************************************************************************
//*****************************************************************************
//
// Index view for slate editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/TOC.css"

import React, {
  useCallback,
  useDeferredValue, useMemo,
} from "react"

import {Editor, Node, Transforms} from "slate"
import {useSlate, ReactEditor} from "slate-react"

import {
  section2edit, edit2section,
  elem2text,
} from "./slateEditor"

import { sleep } from "../../util"

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
} from "../common/factory";

import { styled } from '@mui/material/styles';

//-----------------------------------------------------------------------------

export function SlateTOC({settings, section, style})
{
  //const editor = useSlate()
  //const section = withWordCounts(edit2section(editor.children))

  //console.log(section)

  /*
  return (
    <VFiller style={{...style}}>
      <IndexToolbar settings={settings}/>
      <div style={{overflow: "auto", padding: "4pt"}}>
        <VBox className="TOC">
        {section.parts.map(part => <PartItem key={part.id} settings={settings} part={part}/>)}
        </VBox>
      </div>
    </VFiller>
  )
  /*/
  return (
    <VFiller style={{...style}}>
      <VBox className="TOC">
        {section.parts.map(part => <PartItem key={part.id} settings={settings} part={part}/>)}
      </VBox>
    </VFiller>
  )
  /**/
}

//-----------------------------------------------------------------------------

function PartItem({settings, part}) {
  const {id, name, type, words} = part;
  const props = {id, type, name, words}

  return <React.Fragment>
    <IndexItem className="PartName" settings={settings} {...props} />
    {settings.indexed.value.includes("br.scene") && part.children.map(scene => <SceneItem key={scene.id} settings={settings} scene={scene}/>)}
  </React.Fragment>
}

//-----------------------------------------------------------------------------

function SceneItem({settings, scene}) {
  const {id, name, type, words} = scene;
  const props = {id, type, name, words}

  const bookmarks = scene.children.filter(elem => settings.indexed.value.includes(elem.type))

  return <VBox className="Scene">
    <IndexItem className="SceneName" settings={settings} {...props}/>
    <DoBookmarks settings={settings} bookmarks={bookmarks}/>
  </VBox>
}

function DoBookmarks({settings, bookmarks}) {
  if(!bookmarks.length) return null;
  return <React.Fragment>
    {bookmarks.map(elem => <BookmarkItem key={elem.id} settings={settings} bookmark={elem}/>)}
    </React.Fragment>
}

function BookmarkItem({settings, bookmark}) {
  const {id, type} = bookmark;
  const name = elem2text(bookmark)

  return <IndexItem settings={settings} id={id} type={type} name={name}/>
}

function IndexItem({ className, settings, id, type, name, words }) {
  const editor = useSlate()

  const onItemClick = useCallback(async (event) => {
    // TODO: Find better way to search node
    const match = Array
      .from(Node.elements(editor))
      .filter(([n, p]) => n.id === id)
    if(match?.length) {
      const [node, path] = match[0]
      const start = Editor.start(editor, path)
      console.log(node, path, start)
      //console.log("onClick:", id)
      //console.log("Node:", node)
      //console.log("Path:", Editor.first(editor, path))

      settings.activate()
      await sleep(20);
      Transforms.select(editor, start);
      ReactEditor.focus(editor)
    }
  }, [])

  return <HBox className={addClass(className, "Entry")} onClick={onItemClick}>
      <ItemIcon type={type}/>
      <ItemLabel name={name ? name : "<Unnamed>"}/>
      <HFiller/>
      <ItemWords settings={settings} words={words}/>
    </HBox>
}

function ItemIcon({type}) {
  switch (type) {
    case "missing":
    case "comment":
    case "synopsis":
      return <span className={addClass("Box", type)} />
  }
  return null
}

function ItemLabel({className, name}) {
  return <span className={addClass("Name", className)}>{name}</span>
  //return <div className="Name">{id}</div>
}

function ItemWords({settings, words}) {
  if(words) switch(settings.words.value) {
    case "numbers": return <span>{words.text}</span>
    case "percent": return <span>{Number(100.0 * words.text / settings.words.total).toFixed(1)}</span>
    case "cumulative": return <span>{words.cumulative !== undefined && Number(100.0 * words.cumulative / settings.words.total).toFixed(1)}</span>
    default: break;
  }
  return null;
}

//-----------------------------------------------------------------------------

function DocItem({ doc }) {
  const { n_words, n_chars } = { n_words: 0, n_chars: 0 };

  return (
    <HBox style={{ alignItems: "center" }}>
      <Label variant="body1" style={{ fontSize: "14pt" }}>{doc.story.name}</Label>
      <Filler />
      <Separator />
      <Label>{`Words: ${n_words}`}</Label>
      <Separator />
      <Label>{`Chars: ${n_chars}`}</Label>
      <Separator />
    </HBox>
  )
}
