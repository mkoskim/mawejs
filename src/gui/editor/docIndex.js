//*****************************************************************************
//*****************************************************************************
//
// Doc index view
//
//*****************************************************************************
//*****************************************************************************

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
  const content = doc.story.body.parts[0].children;
  console.log("Indexing:")
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

    const {id, name} = scene

    return {
      id,
      name,
      words: {
        text: wordCount(paras),
        missing: wordCount(missing),
        comment: wordCount(comment)
      },
      bookmarks
    }
  }

  const scenes = content.map(Scene)
  //console.log(scenes)

  return (
    <VBox className="Outline" style={style}>
      <IndexToolbar state={state}/>
      <VFiller className="Index">
        {scenes.map(scene => <SceneItem state={state} scene={scene}/>)}
      </VFiller>
    </VBox>
  )
}

//-----------------------------------------------------------------------------

function IndexToolbar({state}) {
  return <ToolBox style={{ background: "white" }}>
    <Button>Test</Button>
    <Filler />
    <Separator />
    <BorderlessToggleButtonGroup value={state.indexed} onChange={(e, value) => state.setIndexed(value)}>
      <ToggleButton value="missing"><Tooltip title="Show missing"><Icon.BlockType.Missing /></Tooltip></ToggleButton>
      <ToggleButton value="comment"><Tooltip title="Show comments"><Icon.BlockType.Comment /></Tooltip></ToggleButton>
    </BorderlessToggleButtonGroup>
    <Separator />
    <BorderlessToggleButtonGroup exclusive value={state.wordsAs} onChange={(e, value) => state.setWordsAs(value)}>
    <ToggleButton value="off">
      <Tooltip title="Don't show words"><Icon.StatType.Off /></Tooltip></ToggleButton>
      <ToggleButton value="numbers"><Tooltip title="Words as numbers"><Icon.StatType.Words /></Tooltip></ToggleButton>
      <ToggleButton value="percent"><Tooltip title="Words as percent"><Icon.StatType.Percent /></Tooltip></ToggleButton>
      <ToggleButton value="cumulative"><Tooltip title="Words as cumulative percent"><Icon.StatType.Cumulative /></Tooltip></ToggleButton>
    </BorderlessToggleButtonGroup>
  </ToolBox>
}

const BorderlessToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    padding: "1pt",
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

//-----------------------------------------------------------------------------

function SceneItem({state, scene}) {
  const {id, name, type, words, bookmarks} = scene;

  return <React.Fragment>
    <IndexItem state={state} id={id} type={type} name={name} words={words}/>
    {bookmarks.map(elem => <BookmarkItem key={elem.id} state={state} bookmark={elem}/>)}
  </React.Fragment>
}

function BookmarkItem({state, bookmark}) {
  const {id, type} = bookmark;
  const name = elem2text(bookmark)

  return <IndexItem state={state} id={id} type={type} name={name}/>
}

function IndexItem({ state, name, type, id, words }) {
  const {editor} = state
  const className = addClass("Entry")

  return <ItemLink editor={editor} id={id}>
    <HBox className={className} style={{ alignItems: "center" }}>
      <ItemIcon type={type} />
      <ItemLabel type={type} name={name === "" ? ". . ." : name} />
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

function ItemLabel({ type, name }) {
  return <Label className="Name" text={name} />
}

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
