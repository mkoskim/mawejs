//*****************************************************************************
//*****************************************************************************
//
// Doc index view
//
//*****************************************************************************
//*****************************************************************************

import "./styles/outline.css"

import React, {
  useDeferredValue, useMemo,
} from "react"

import {
  SlateEdit, getEditor, ReactEditor,
  section2edit, edit2section,
  elem2text,
} from "./slateEditor"

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

export function ViewIndex({state, doc, style})
{
  // Create index from doc content
  const content = doc.story.body.parts;
  //console.log("Indexing:")
  //console.log("Indexing: Content:", content)

  //console.log("ViewIndex")
  //console.log("- Indexed:", state.indexed)

  function Scene(scene) {

    function wordCount(elems) {
      return (
        elems
        .map(elem => elem2text(elem))
        .join(" ")
        .split(/\s+/g)
        .filter(s => s.length)
      ).length
    }

    const paras = scene.children.filter(elem => elem.type === "p")
    const other = scene.children.filter(elem => elem.type !== "p")
    const missing = other.filter(elem => elem.type === "missing")
    const comment = other.filter(elem => elem.type === "comment")
    const bookmarks = other.filter(elem => state.indexed.includes(elem.type))

    const {id, name, exclude, attributes} = scene

    return {
      id,
      name,
      exclude,
      attributes,
      words: !exclude && {
        text: wordCount(paras),
        missing: wordCount(missing),
        comment: wordCount(comment)
      },
      bookmarks
    }
  }

  function Parts(part) {

    const {id, name} = part;

    return {
      id,
      name,
      scenes: part.children.map(Scene)
    }
  }

  const parts = content.map(Parts)

  //const scenes = content.map(Scene)
  //console.log(scenes)

  return (
    <VBox className="Outline" style={style}>
      <IndexToolbar state={state}/>
      <VFiller className="Index">
        {parts.map(part => <PartItem key={part.id} state={state} part={part}/>)}
      </VFiller>
    </VBox>
  )
}

//-----------------------------------------------------------------------------

function IndexToolbar({state}) {
  return <ToolBox style={{ background: "white" }}>
    <Button>Test</Button>
    <Filler />
    <BorderlessToggleButtonGroup value={state.indexed} onChange={(e, value) => state.setIndexed(value)}>
      <ToggleButton value="missing"><Tooltip title="Show missing"><Icon.BlockType.Missing /></Tooltip></ToggleButton>
      <ToggleButton value="comment"><Tooltip title="Show comments"><Icon.BlockType.Comment /></Tooltip></ToggleButton>
    </BorderlessToggleButtonGroup>
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
    padding: "4pt",
    //border: 0,
    '&.Mui-disabled': {
      //border: 0,
    },
    '&:first-of-type': {
      //borderRadius: theme.shape.borderRadius,
      marginLeft: theme.spacing(0.5),
    },
    '&:not(:first-of-type)': {
      //borderRadius: theme.shape.borderRadius,
    },
  },
}));

//-----------------------------------------------------------------------------

function PartItem({state, part}) {
  const {id, name, type} = part;

  return <React.Fragment>
    <IndexItem className="PartName" state={state} id={id} type={type} name={name} />
    {part.scenes.map(scene => <SceneItem key={scene.id} state={state} scene={scene}/>)}
  </React.Fragment>
}

//-----------------------------------------------------------------------------

function SceneItem({state, scene}) {
  const {id, name, type, exclude, attributes, words, bookmarks} = scene;

  //const className = addClass("SceneName", attributes.exclude || "SceneNumber")

  return <VBox className={addClass("Scene", exclude && "Excluded")}>
    <IndexItem className="SceneName" state={state} id={id} type={type} name={name} words={words}/>
    <DoBookmarks state={state} bookmarks={bookmarks}/>
  </VBox>
}

function DoBookmarks({state, bookmarks}) {
  if(!bookmarks.length) return null;
  return <React.Fragment>
    <Separator/>
    {bookmarks.map(elem => <BookmarkItem key={elem.id} state={state} bookmark={elem}/>)}
    </React.Fragment>
}

function BookmarkItem({state, bookmark}) {
  const {id, type} = bookmark;
  const name = elem2text(bookmark)

  return <IndexItem state={state} id={id} type={type} name={name}/>
}

function IndexItem({ className, state, name, type, id, words }) {
  const {editor} = state

  return <ItemLink editor={editor} id={id}>
    <HBox className={addClass(className, "Entry")} style={{ alignItems: "center" }}>
      <ItemIcon type={type} />
      <ItemLabel type={type} name={name ? name : "???"} id={id}/>
      <HFiller/>
      <ItemWords state={state} words={words}/>
    </HBox>
  </ItemLink>
}

function ItemIcon({ type }) {
  switch (type) {
    case "missing":
    case "comment":
    case "synopsis":
      return <div className={addClass("Box", type)} />
  }
  return null
}

function ItemLabel({ type, name, id }) {
  return <div className="Name">{name}</div>
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

function ItemLink({ editor, id, children, ...props }) {

  return <a href={`#${id}`} onClick={e => setTimeout(() => onItemClick(e, editor, id), 0)} {...props}>
    {children}
  </a>
}

function onItemClick(event, editor, id) {
  //console.log("onClick:", id)
  const target = document.getElementById(id)
  if (!target) {
    console.log(`Index/onClick: ID ${id} not found.`)
    return;
  }

  //console.log("- Target:", target)

  var range = document.createRange()
  var sel = window.getSelection()

  range.setStart(target, 0)
  range.collapse(true)

  sel.removeAllRanges()
  sel.addRange(range)

  ReactEditor.focus(editor)
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
