//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/editor.css"

/* eslint-disable no-unused-vars */

import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {action, docByID} from "../app/store"

import {
  SlateEdit, getEditor, section2edit, elem2text,
  ReactEditor,
} from "./slateEditor"

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon,
  ToggleButton, ToggleButtonGroup,
  Input,
  SearchBox, addHotkeys,
  Label, Link,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
} from "../common/factory";

import {ViewSection} from "./organizer"

import isHotkey from 'is-hotkey';

//-----------------------------------------------------------------------------
// Choose the view
//-----------------------------------------------------------------------------

export function EditView() {

  const edit = useSelector(state => state.doc.edit)
  const loading = useSelector(state => state.doc.loading)

  console.log("EditView:", loading, edit.id)

  // Force (slate) re-render when ID changes
  //const [id, setID] = useState(edit.id)
  //useEffect(() => setID(edit.id), [edit.id])

  //const refresh = (id !== edit.id)

  //return <RawDoc doc={doc}/>
  //return <SlateDoc doc={doc}/>
  return <VFiller>
    <WorkspaceTab />
    {loading ? null : <SingleEdit id={edit.id} />}
  </VFiller>
}

//-----------------------------------------------------------------------------
// Single edit with sidebars

function SingleEdit({id, left, right, center}) {

  const [storedid, setID] = useState(id)
  useEffect(() => setID(id), [id])

  const doc = docByID(id)
  function doc2slate() {return section2edit(doc).body;}

  //---------------------------------------------------------------------------
  /* Slate uses content variable only when initializing. We need to manually
   * set children when doc changes between re-renders
  */
  //---------------------------------------------------------------------------

  const [slateContent, setSlateContent] = useState(doc2slate());
  const editor = useMemo(() => getEditor(), [])

  function getContent() {
    const refresh = storedid !== id
    if (refresh) {
      const content = doc2slate()
      editor.children = content;
      //return content;
    }

    return slateContent;
  }

  const content = getContent();

  //---------------------------------------------------------------------------
  //console.log(`SingleEdit: id=${id} stored=${storedid} refresh=${refresh}`)

  const info = getinfo(slateContent)

  const dispatch = useDispatch();

  useEffect(() => addHotkeys({
    "mod+o": (e) => onClose(e, dispatch),
    "mod+w": (e) => onClose(e, dispatch),
    "mod+s": null,
  }));

  //console.log("Edit:", id)

  //*
  return <React.Fragment>
    <HFiller style={{overflow: "auto", background: "#F8F8F8"}}>
      <ViewIndex
        content={content}
        style={{maxWidth: "350px"}}
      />
      <VFiller className="Board">
        <div>
          <SlateEdit
            className={"Sheet Shadow"}
            editor={editor}
            content={slateContent}
            setContent={setSlateContent}
          />
        </div>
      </VFiller>
    </HFiller>
  </React.Fragment>
  /*/
  // For development purposes:
  return <React.Fragment>
    <ToolBar doc={doc} info={info} />
    <HBox>
      <Pre style={{ width: "50%" }} content={content} />
      <Pre style={{ width: "50%" }} content={info} />
    </HBox>
  </React.Fragment>
  /**/

  /*
    <SlateEdit style={{ minWidth: "50%", padding: "0.5cm" }} content={content} setContent={setContent} />
  */

  //-----------------------------------------------------------------------------

  function ViewIndex({content, style}) {
    //console.log("ViewIndex")
    return <VBox className="Outline" style={style}>
      <DocItem />
      <Separator />
      <VFiller className="Index">
        {indexElems(content).map(elem => <IndexItem key={elem.attributes.id} elem={elem} />)}
      </VFiller>
    </VBox>

    function indexElems(content) {
      return content ? content.filter(elem => isIndexElem(elem)) : []
    }

    //-------------------------------------------------------------------------

    function IndexTools() {
      return <ToolBox>
        <Button>Test</Button>
      </ToolBox>
    }

    function DocItem() {
        const {n_words, n_chars} = {n_words: 0, n_chars: 0};

        return (
          <HBox style={{alignItems: "center"}}>
            <Label variant="body1" style={{fontSize: "14pt"}}>{doc.story.name}</Label>
            <Filler />
            <Separator />
            <Label>{`Words: ${n_words}`}</Label>
            <Separator />
            <Label>{`Chars: ${n_chars}`}</Label>
            <Separator />
          </HBox>
        )
    }

    //-------------------------------------------------------------------------

    function IndexItem({elem}) {
      const className = addClass("Entry")
      const name = elem2text(elem).split(/[.:?!]/gu)[0]
      const id = elem.attributes.id

      return <Link id={id}>
        <HBox className={className} style={{alignItems: "center"}}>
        <ItemIcon type={elem.type}/>
        <ItemLabel type={elem.type} name={name}/>
        </HBox>
      </Link>
    }

    function ItemIcon({type}) {
      switch(type) {
        case "missing":
        case "comment":
        case "synopsis":
          //return <Icon.Circle className={type} fontSize="small"/>
          return <div className={addClass("Box", type)}/>
      }
      return null
    }

    function ItemLabel({type, name}) {
      //const style = (type === "br.scene") ? {fontWeight: "bold"} : {}
      const style = {}
      return <Label className="Name" style={style} text={name}/>
    }

    function Link({id, children, ...props}) {
      return <a href={`#${id}`} onClick={e => setTimeout(() => onClick(e, id), 0)} {...props}>
        {children}
      </a>
    }

    function onClick(e, id) {
      //console.log("onClick:", id)
      const target = document.getElementById(id)

      //console.log("- Target:", target)

      var range = document.createRange()
      var sel = window.getSelection()

      range.setStart(target, 0)
      range.collapse(true)

      sel.removeAllRanges()
      sel.addRange(range)

      ReactEditor.focus(editor)
    }

  }

  function isIndexElem(elem) {
    return [
      "br.scene",
      "synopsis",
      "missing",
      "comment",
    ].includes(elem.type)
  }
}

//-----------------------------------------------------------------------------
// Extract info from (living) slate buffer.

function getinfo(content) {
  return {
    words: 0,
    chars: 0,
  }
}

//-----------------------------------------------------------------------------

function Pre({style, content}) {
  return <pre style={{fontSize: "10pt", ...style}}>{`${JSON.stringify(content, null, 2)}`}</pre>
}

function Empty() {
  return null;
}

//-----------------------------------------------------------------------------

function WorkspaceTab() {
  const dispatch = useDispatch()
  const current = useSelector(state => state.workspace[state.workspace.selected])
  const {name, files, selected} = current;

  return <HBox style={{background: "#EEE", alignItems: "center"}}>
    <Button onClick={(e) => onClose(e, dispatch)}>{`${name}:`}</Button>
    {files.map(f => <Button
      key={f.id} id={f.id}
      style={{background: (f.id === selected.id) ? "white" : null}}
      onClick={(e) => onOpen(e, dispatch, f)}
    >
      {getName(f)}
    </Button>)}
  </HBox>

  function getName(file) {
    const doc = docByID(file.id)
    if (doc) return doc.story.name
    return file.name
  }
}

function onOpen(event, dispatch, file) {
  event.stopPropagation()
  console.log("Opening:", file)
  dispatch(action.workspace.selectFile({file}))
  dispatch(action.doc.open({file}))
}

function onClose(e, dispatch) {
  if (e) e.preventDefault()
  // Move modifications to doc
  dispatch(action.doc.close({}))
}
