//*****************************************************************************
//*****************************************************************************
//
// Index view for slate editor
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useCallback, useRef,
  useEffect,
  useDeferredValue,
} from "react"

import { Droppable, Draggable } from "@hello-pangea/dnd";

import {
  VBox, HBox, Filler,
  addClass,
  DeferredRender
} from "./factory";

import {FormatWords} from "./components";
import {
  nodeAsText, nodeName,
  nodeNumbered, nodeIsCtrl, wcCumulative,
  nodeID, childID, IDtoPath,
} from "../../document/nodeutil";

//*****************************************************************************
//
// Helpers
//
//*****************************************************************************

function getAt(activeID, current) {
  if(!current) return {}
  const {sectID, path} = IDtoPath(current)
  if(sectID !== activeID) return {}
  return {
    act: path[0],
    chapter: path.length > 1 ? path[1] : undefined,
    scene: path.length > 2 ? path[2] : undefined,
  }
}

//*****************************************************************************
//
// Document index
//
//*****************************************************************************

export function DocIndex({style, sectID, section, wcFormat, include, setActive, unfold, current})
{
  //---------------------------------------------------------------------------
  // Path to section
  //---------------------------------------------------------------------------

  const at = getAt(sectID, current)
  //console.log(at)

  const refCurrent = useRef(null)

  useEffect(() => {
    if(refCurrent.current) refCurrent.current.scrollIntoViewIfNeeded()
  }, [current])

  //---------------------------------------------------------------------------
  // Activation function
  //---------------------------------------------------------------------------

  const onActivate = useCallback(id => {
    //console.log("Activate:", activeID, id)
    if(setActive) setActive(id)
  }, [setActive])

  //---------------------------------------------------------------------------
  // Word counts
  //---------------------------------------------------------------------------

  const cumulative = useDeferredValue((["percent", "cumulative"].includes(wcFormat))
    ? wcCumulative(section, sectID)
    : undefined
  )

  const total = (["percent"].includes(wcFormat))
    ? (section.words?.text + section.words?.missing)
    : undefined

  //if(activeID === "draft") console.log("Index:", total, cumulative)

  const wcFormatFunction = useCallback(
    (!wcFormat || wcFormat === "off")
    ? undefined
    : (id, words) => <FormatWords
      format={wcFormat}
      text={words?.text}
      missing={words?.missing}
      padding={words?.padding}
      cumulative={cumulative && id in cumulative && cumulative[id]}
      total={total}
    />,
    [wcFormat, total, cumulative]
  )
  //console.log(wcFormatFunction)

  //---------------------------------------------------------------------------
  // Single unnamed act -> don't show
  //---------------------------------------------------------------------------

  //const skipActName = (section.acts.length === 1 && !nodeName(section.acts[0]))

  //---------------------------------------------------------------------------
  // Index
  //---------------------------------------------------------------------------

  return <ActDropZone
    id={sectID}
    acts={section.acts}
    wcFormat={wcFormatFunction}
    include={include}
    onActivate={onActivate}
    unfold={unfold}
    atAct={at.act}
    atChapter={at.chapter}
    atScene={at.scene}
    refCurrent={refCurrent}
    />
  //return useDeferredValue(index)
}

//*****************************************************************************
//
// Act drop zone
//
//*****************************************************************************

class ActDropZone extends React.PureComponent {

  render() {
    const {id} = this.props

    //console.log("Index update:", activeID)

    return <Droppable droppableId={id} type="act">
      {this.DropZone.bind(this)}
    </Droppable>
  }

  DropZone(provided, snapshot) {
    const {acts, id, wcFormat, include, onActivate, unfold, atAct, atChapter, atScene, refCurrent} = this.props
    const {innerRef, droppableProps, placeholder} = provided
    const {isDraggingOver} = snapshot

    return <div
      className={addClass("VBox ActDropZone", isDraggingOver && "DragOver")}
      ref={innerRef}
      {...droppableProps}
    >
    {acts.map((node, index) => !nodeIsCtrl(node) && <ActItem
      key={index}
      id={childID(id, index)}
      index={index}
      node={node}
      include={include}
      wcFormat={wcFormat}
      onActivate={onActivate}
      unfold={unfold}
      atAct={atAct === index}
      atChapter={atAct === index ? atChapter : undefined}
      atScene={atAct === index ? atScene : undefined}
      refCurrent={refCurrent}
      />)}
    {placeholder}
    </div>
  }
}

//*****************************************************************************
//
// Act items
//
//*****************************************************************************

class ActItem extends React.PureComponent {

  render() {
    const {id, index} = this.props
    return <Draggable
      draggableId={id}
      index={index}
      type="act"
      >
      {this.Draggable.bind(this)}
    </Draggable>
  }

  Draggable(provided, snapshot) {
    const {node, wcFormat, id, index, include, onActivate, unfold, atAct, atChapter, atScene, refCurrent} = this.props
    const {innerRef, draggableProps, dragHandleProps} = provided

    const hasDropzone = (include.includes("chapter")) && (unfold || !node.folded)
    //const hasDropzone = (unfold || !node.folded)

    const isCurrent = (
      atAct &&
      (!hasDropzone || atChapter === undefined || node.children[atChapter].type === "hact")
    )

    return <div
      ref={innerRef}
      {...draggableProps}
      >
      <IndexItem
        id={id}
        type={node.type}
        name={node.name}
        words={node.words}
        folded={!unfold && node.folded}
        numbered={node.numbered}
        wcFormat={wcFormat}
        onActivate={onActivate}
        isCurrent={isCurrent}
        refCurrent={refCurrent}
        {...dragHandleProps}
      />
      {hasDropzone && <ChapterDropZone
        id={id}
        folded={!unfold && node.folded}
        chapters={node.children}
        wcFormat={wcFormat}
        include={include}
        onActivate={onActivate}
        unfold={unfold}
        atChapter={atChapter}
        atScene={atScene}
        refCurrent={refCurrent}
      />}
    </div>
  }
}

//-----------------------------------------------------------------------------

class ChapterDropZone extends React.PureComponent {

  render() {
    const {id} = this.props

    //console.log("Index update:", activeID)

    return <Droppable droppableId={id} type="chapter">
      {this.DropZone.bind(this)}
    </Droppable>
  }

  DropZone(provided, snapshot) {
    const {chapters, id, wcFormat, include, onActivate, unfold, atChapter, atScene, refCurrent} = this.props
    const {innerRef, droppableProps, placeholder} = provided
    const {isDraggingOver} = snapshot

    return <div
      className={addClass("VBox ChapterDropZone", isDraggingOver && "DragOver")}
      ref={innerRef}
      {...droppableProps}
    >
    {chapters.map((node, index) => !nodeIsCtrl(node) && <ChapterItem
      key={index}
      id={id}
      index={index}
      node={node}
      include={include}
      wcFormat={wcFormat}
      onActivate={onActivate}
      unfold={unfold}
      atChapter={atChapter === index}
      atScene={atChapter === index ? atScene : undefined}
      refCurrent={refCurrent}
      />)}
    {placeholder}
    </div>
  }
}

//*****************************************************************************
//
// Chapter items
//
//*****************************************************************************

class ChapterItem extends React.PureComponent {

  render() {
    const {id, index} = this.props
    return <Draggable
      draggableId={childID(id, index)}
      index={index}
      type="chapter"
      >
      {this.Draggable.bind(this)}
    </Draggable>
  }

  Draggable(provided, snapshot) {
    const {node, id, index, include, wcFormat, onActivate, unfold, atChapter, atScene, refCurrent} = this.props
    const {innerRef, draggableProps, dragHandleProps} = provided

    const ID = childID(id, index)
    const hasDropzone = (include.includes("scene")) && (unfold || !node.folded)

    const isCurrent = (
      atChapter &&
      (!hasDropzone || atScene === undefined || node.children[atScene].type === "hchapter")
    )

    //console.log(include)

    return <div
      ref={innerRef}
      {...draggableProps}
      >
      <IndexItem
        id={ID}
        type={node.type}
        name={node.name}
        words={node.words}
        folded={!unfold && node.folded}
        numbered={nodeNumbered(node)}
        wcFormat={wcFormat}
        onActivate={onActivate}
        isCurrent={isCurrent}
        refCurrent={refCurrent}
        {...dragHandleProps}
      />
      {hasDropzone && <SceneDropZone
        id={ID}
        scenes={node.children}
        include={include}
        wcFormat={wcFormat}
        onActivate={onActivate}
        atScene={atScene}
        refCurrent={refCurrent}
      />}
    </div>
  }
}

//-----------------------------------------------------------------------------

class SceneDropZone extends React.PureComponent {

  render() {
    const {id} = this.props

    return <Droppable droppableId={id} type="scene">
      {this.DropZone.bind(this)}
    </Droppable>
  }

  DropZone(provided, snapshot) {
    const {scenes, id, include, wcFormat, onActivate, atScene, refCurrent} = this.props
    const {innerRef, droppableProps, placeholder} = provided
    const {isDraggingOver} = snapshot

    return <div
      className={addClass("VBox SceneDropZone", isDraggingOver && "DragOver")}
      ref={innerRef}
      {...droppableProps}
    >
    {scenes.map((node, index) => !nodeIsCtrl(node) && <SceneItem
      key={index}
      id={childID(id, index)}
      index={index}
      node={node}
      include={include}
      wcFormat={wcFormat}
      onActivate={onActivate}
      isCurrent={index === atScene}
      refCurrent={refCurrent}
      />)}
    {placeholder}
    </div>
  }
}

//*****************************************************************************
//
// Scene items
//
//*****************************************************************************

class SceneItem extends React.PureComponent {

  render() {
    //*
    const {id, index} = this.props
    return <Draggable
      draggableId={id}
      index={index}
      type="scene"
    >
      {this.Draggable.bind(this)}
    </Draggable>
    /*/
    return this.Draggable()
    /**/
  }

  Draggable(provided, snapshot) {
    const {innerRef, draggableProps, dragHandleProps} = provided
    const {node, id, include, wcFormat, onActivate, isCurrent, refCurrent} = this.props

    const bookmarks = node.children
      .map((node, index) => [index, node])
      .filter(([index, node]) => include.includes(node.type))

    return <div
      className="VBox Scene"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
    >
    <IndexItem
      id={id}
      type={node.content}
      name={node.name}
      folded={node.folded}
      words={node.words}
      wcFormat={wcFormat}
      onActivate={onActivate}
      isCurrent={isCurrent}
      refCurrent={refCurrent}
    />
    {!node.folded && bookmarks.map(([index, node]) => <IndexItem
      key={index}
      id={childID(id, index)}
      type={node.type}
      name={nodeAsText(node)}
      wcFormat={wcFormat}
      onActivate={onActivate}
    />)}
    </div>
  }
}

//*****************************************************************************
//
// Index entries
//
//*****************************************************************************

class IndexItem extends React.PureComponent {

  static typeClasses = {
    "section": "Section",
    "act": "Act",
    "chapter": "Chapter",
    "scene": "Scene",
    "synopsis": "Scene Synopsis",
    "notes": "Scene Notes",

    "bookmark": "Bookmark",
    "missing": "Bookmark",
    "comment": "Bookmark",
    "fill": "Bookmark",
    "tags": "Bookmark",
  }

  static numbered = ["act", "chapter"]

  render() {
    const {className, isCurrent, refCurrent, id, type, name, folded, numbered, words, wcFormat, onActivate, ...rest} = this.props

    //console.log("Render IndexItem:", type, id, name)
    const typeClasses = this.constructor.typeClasses

    const classes = addClass(
      className,
      "HBox Entry",
      type in typeClasses ? typeClasses[type] : "",
      (numbered && (this.constructor.numbered.includes(type))) ? "Numbered" : "",
      (folded) ? "Folded" : "",
      (isCurrent) ? "Current" : "",
    )

    function onClick(ev) {
      return onActivate && onActivate(id)
    }

    return <div ref={isCurrent ? refCurrent : null} className={classes} onClick={onClick} {...rest}>
      <DeferredRender>
      <ItemIcon type={type}/>
      <ItemLabel type={type} name={name}/>
      {wcFormat && <><Filler/><div className="WordCount">{wcFormat(id, words)}</div></>}
      </DeferredRender>
    </div>
  }
}

class ItemIcon extends React.PureComponent {
  render() {
    const {type} = this.props
    switch (type) {
      case "bookmark":
      case "missing":
      case "fill":
      //case "synopsis":
      //case "notes":
      case "comment":
      case "tags":
        return <div className={addClass("Box", type)} />
    }
    return null
  }
}

function ItemName(type, name) {
  switch(type) {
    case "synopsis": return (name?.length) ? name : "Synopsis" // "Synopsis" + (name ? `: ${name}` : "")
    case "notes":    return (name?.length) ? name : "Notes" // return "Notes" + (name ? `: ${name}` : "")
    default: break;
  }
  return name ? name : "<Unnamed>"
}

class ItemLabel extends React.PureComponent {
  render() {
    const {type, name} = this.props
    return <div className="Name">{ItemName(type, name)}</div>
  }
}
