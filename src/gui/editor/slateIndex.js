//*****************************************************************************
//*****************************************************************************
//
// Index view for slate editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/outline.css"

import React, {
  useCallback,
  useDeferredValue, useMemo,
} from "react"

import {Editor, Node, Transforms} from "slate"
import {useSlate, ReactEditor} from "slate-react"

import {
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
// Complete word counts. Might be useful elsewhere, too.

function wordCounts(doc) {

  function Scene(scene) {

    function wordCount(elems, type) {
      return (
        elems
        .filter(elem => elem.type === type)
        .map(elem => elem2text(elem))
        .join(" ")
        .split(/\s+/g)
        .filter(s => s.length)
      ).length
    }

    return {
      ...scene,
      words: {
        text: wordCount(scene.children, "p"),
        missing: wordCount(scene.children, "missing"),
        comment: wordCount(scene.children, "comment")
      },
    }
  }

  function Part(part) {
    const scenes = part.children.map(Scene)

    return {
      ...part,
      children: scenes
    }
  }

  return {
    ...doc,
    story: {
      ...doc.story,
      body: {
        ...doc.story.body,
        parts: doc.story.body.parts.map(Part)
      }
    }
  }
}

//-----------------------------------------------------------------------------

export function SlateIndex({state, doc, style})
{
  // Fill in word counts
  doc = wordCounts(doc)
  const body = doc.story.body

  //const content = doc.story.body.parts;

  //console.log("Indexing:")
  //console.log("Indexing: Content:", content)

  //console.log("ViewIndex")
  //console.log("- Indexed:", state.indexed)

  //const scenes = content.map(Scene)
  //console.log(scenes)

  return (
    <VFiller className="Outline" style={{...style}}>
      <IndexToolbar state={state}/>
      <div style={{overflow: "auto", padding: "4pt"}}>
        <VBox>
        {body.parts.map(part => <PartItem key={part.id} state={state} part={part}/>)}
        </VBox>
      </div>
    </VFiller>
  )
}

//-----------------------------------------------------------------------------

function IndexToolbar({state}) {
  return <ToolBox style={{background: "white"}}>
    <BorderlessToggleButtonGroup value={state.indexed} onChange={(e, value) => state.setIndexed(value)}>
      <ToggleButton value="synopsis"><Tooltip title="Show synopses"><Icon.BlockType.Synopsis /></Tooltip></ToggleButton>
      <ToggleButton value="missing"><Tooltip title="Show missing"><Icon.BlockType.Missing /></Tooltip></ToggleButton>
      <ToggleButton value="comment"><Tooltip title="Show comments"><Icon.BlockType.Comment /></Tooltip></ToggleButton>
    </BorderlessToggleButtonGroup>
    <Separator />
    <BorderlessToggleButtonGroup exclusive value={state.wordsAs} onChange={(e, value) => value && state.setWordsAs(value)}>
      <ToggleButton value="off"><Tooltip title="Don't show words"><Icon.StatType.Off /></Tooltip></ToggleButton>
      <ToggleButton value="numbers"><Tooltip title="Words as numbers"><Icon.StatType.Words /></Tooltip></ToggleButton>
      <ToggleButton value="percent"><Tooltip title="Words as percent"><Icon.StatType.Percent /></Tooltip></ToggleButton>
      <ToggleButton value="cumulative"><Tooltip title="Words as cumulative percent"><Icon.StatType.Cumulative /></Tooltip></ToggleButton>
    </BorderlessToggleButtonGroup>
  </ToolBox>
}

const BorderlessToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    //margin: 0,
    //marginRight: theme.spacing(0.5),
    padding: "5pt",
    //border: 0,
    '&.Mui-disabled': {
      //border: 0,
    },
    '&:first-of-type': {
      //borderRadius: theme.shape.borderRadius,
      //marginLeft: theme.spacing(0.5),
    },
    '&:not(:first-of-type)': {
      //borderRadius: theme.shape.borderRadius,
    },
  },
}));

//-----------------------------------------------------------------------------

function PartItem({state, part}) {
  const {id, name, exclude, type} = part;
  const props = {id, type, name, exclude}

  return <React.Fragment>
    <IndexItem className="PartName" state={state} {...props} />
    {part.children.map(scene => <SceneItem key={scene.id} state={state} scene={scene}/>)}
  </React.Fragment>
}

//-----------------------------------------------------------------------------

function SceneItem({state, scene}) {
  const {id, name, type, exclude, words} = scene;
  const props = {id, type, name, exclude, words}

  const bookmarks = scene.children.filter(elem => state.indexed.includes(elem.type))

  //const className = addClass("SceneName", attributes.exclude || "SceneNumber")

  return <VBox className="Scene">
    <IndexItem className="SceneName" state={state} {...props}/>
    <DoBookmarks state={state} bookmarks={bookmarks}/>
  </VBox>
}

function DoBookmarks({state, bookmarks}) {
  if(!bookmarks.length) return null;
  return <React.Fragment>
    {bookmarks.map(elem => <BookmarkItem key={elem.id} state={state} bookmark={elem}/>)}
    </React.Fragment>
}

function BookmarkItem({state, bookmark}) {
  const {id, type} = bookmark;
  const name = elem2text(bookmark)

  return <IndexItem state={state} id={id} type={type} name={name}/>
}

function IndexItem({ className, state, id, type, name, exclude, words }) {
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

      await sleep(20);
      Transforms.select(editor, start);
      ReactEditor.focus(editor)
    }
  }, [])

  words = exclude ? undefined : words

  return <HBox className={addClass(className, "Entry")} onDoubleClick={onItemClick}>
      <ItemIcon type={type} exclude={exclude}/>
      <ItemLabel className={exclude ? "Excluded" : "Included"} name={name ? name : "<Unnamed>"}/>
      <HFiller/>
      <ItemWords state={state} words={words}/>
    </HBox>
}

function ItemIcon({type}) {
  switch (type) {
    case "missing":
    case "comment":
    case "synopsis":
      return <div className={addClass("Box", type)} />
  }
  return null
}

function ItemLabel({className, name}) {
  return <div className={addClass("Name", className)}>{name}</div>
  //return <div className="Name">{id}</div>
}

function ItemWords({state, words}) {
  if(words) switch(state.wordsAs) {
    default: break;
    case "numbers": return <div>{words?.text}</div>
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
