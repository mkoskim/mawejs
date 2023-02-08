//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import "./styles/editor.css"

/* eslint-disable no-unused-vars */

import React, {
  useState, useEffect, useReducer,
  useMemo, useCallback,
  useDeferredValue,
  StrictMode,
} from 'react';

import {
  Slate, useSlate, ReactEditor,
} from "slate-react"

import {
  Editor, Node, Transforms, Range, Point,
} from "slate";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  getEditor, SlateEditable,
  section2edit, edit2section,
  elem2text,
  elemByID,
  focusByPath, focusByID,
  elemByTypes,
  elemsByRange,
} from "./slateEditor"

import {
  SlateTOC,
} from "./slateIndex"

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
import {docLoad, docSave, docUpdate} from "./doc"
import {withWordCounts} from "../../document";

//import { mawe } from "../../document";

//-----------------------------------------------------------------------------
// Single edit with sidebars

export function SingleEdit({id}) {
  const [doc, setDoc] = useState(undefined)

  useEffect(() => {
    console.log("SingleEdit: Updating doc...")
    if(id) docLoad(id)
      .then(content => setDoc(content))
  }, [id])

  if(!doc) return <Loading/>
  //*
  return <VFiller>
    <ToolBox>Placeholder: Workspace</ToolBox>
    <SingleEditView id={id} doc={doc}/>
    </VFiller>
  /*/
  return <SingleEditView id={id} doc={doc}/>
  /**/
}

function SingleEditView({id, doc}) {

  //---------------------------------------------------------------------------
  // For development purposes:
  //---------------------------------------------------------------------------

  /*
  return <React.Fragment>
    <HBox>
    <Pre style={{ width: "50%" }} content={doc.story} />
    <Pre style={{ width: "50%" }} content={mawe.fromXML(mawe.buf2tree(mawe.tree2buf(mawe.toXML(slate2doc(doc, doc2slate(doc)).story))))} />
    </HBox>
  </React.Fragment>
  /**/

  /*
  return <Pre content={doc.story.notes} />
  /**/

  //---------------------------------------------------------------------------
  // Slate uses content variable only when initializing. We need to manually
  // set children when doc changes between re-renders
  //---------------------------------------------------------------------------

  const bodyeditor = useMemo(() => getEditor(), [])
  const noteeditor = useMemo(() => getEditor(), [])

  //---------------------------------------------------------------------------
  // slate buffers

  const [bodybuffer, setBodyBuffer] = useState(section2edit(doc.story.body))
  const [notebuffer, setNoteBuffer] = useState(section2edit(doc.story.notes))

  // Update doc from buffers

  const bodyFromEdit  = edit2section(bodybuffer)
  const bodyWithWords = withWordCounts(bodyFromEdit)
  const notesFromEdit = edit2section(notebuffer)

  const edited = {
    ...doc,
    story: {
      ...doc.story,
      notes: {
        ...doc.story.notes,
        parts: notesFromEdit.parts,
      },
      body: {
        ...doc.story.body,
        head: {...doc.story.body.head, ...bodyFromEdit.head},
        parts: bodyFromEdit.parts,
      }
    }
  }

  docUpdate(edited);

  //---------------------------------------------------------------------------

  const [active, setActive] = useState("body")

  //---------------------------------------------------------------------------
  // Index settings
  //---------------------------------------------------------------------------

  const [indexed1, setIndexed1] = useState(["br.scene", "synopsis"])
  const [words1, setWords1] = useState("numbers")

  const bodyindex_settings = {
    sectID: "body",
    activate: () => setActive("body"),
    indexed: {
      choices:  ["br.scene", "synopsis", "missing", "comment"],
      value:    indexed1,
      setValue: setIndexed1,
    },
    words: {
      total:    bodyWithWords.words.text,
      choices:  ["off", "numbers", "percent", "cumulative"],
      value:    words1,
      setValue: setWords1,
    },
    numbering: true,
  }

  const noteindex_settings = {
    sectID: "notes",
    activate: () => setActive("notes"),
    indexed: {
      value: ["br.scene", "synopsis"],
    }
  }

  //---------------------------------------------------------------------------

  useEffect(() => addHotkeys({
    //"mod+o": (e) => onClose(e, dispatch),
    //"mod+w": (e) => onClose(e, dispatch),
    //"mod+s": (e) => mawe.saveas(docByID(id), path.join(cwd, "/testwrite.mawe")),
    "mod+s": (e) => docSave(edited),
  }));

  /*
  return <Slate editor={editor} value={state.content} onChange={state.setContent}>
    <EditorBox style={{width: "50%"}}/>
    <Pre style={{ width: "50%" }} content={state.content} />
    </Slate>
  /**/
/*
  <Pre style={{ width: "50%" }} content={edited.story} />
  <Pre style={{ width: "50%" }} content={edited.story.body} />
*/

  /**/

  //---------------------------------------------------------------------------
  //console.log(`SingleEdit: id=${id} stored=${storedid} refresh=${refresh}`)

  //console.log("Edit:", id)

  //*
  return <DragDropContext onDragEnd={onDragEnd}>
    <Toolbar />
    <HFiller style={{overflow: "auto"}}>
      <Slate editor={bodyeditor} value={bodybuffer} onChange={setBodyBuffer}>
        <IndexBox
          style={{maxWidth: "400px", width: "400px"}}
          settings={bodyindex_settings}
          section={bodyWithWords}/>
        <EditorBox mode="Regular" visible={active === "body"}/>
      </Slate>
      <Slate editor={noteeditor} value={notebuffer} onChange={setNoteBuffer}>
        <EditorBox mode="Regular" visible={active === "notes"}/>
        <IndexBox
          style={{maxWidth: "300px", width: "300px"}}
          settings={noteindex_settings}
          section={notesFromEdit}/>
      </Slate>
    </HFiller>
    </DragDropContext>
  /*/
  return <DragDropContext onDragEnd={onDragEnd}>
    <Toolbar />
    <HFiller style={{overflow: "auto"}}>
      <Slate editor={bodyeditor} value={bodybuffer} onChange={setBodyBuffer}>
        <IndexBox
          style={{maxWidth: "400px", width: "400px"}}
          settings={bodyindex_settings}
          section={bodyWithWords}/>
        <EditorBox mode="Regular" visible={active === "body"}/>
      </Slate>
      <div style={{overflowY: "auto"}}><table><tbody>
        {bodyeditor.children.map(elem => <tr key={elem.id}>
          <td>{elem.id}</td>
          <td>{elem.type}</td>
          <td>{elem2text(elem).slice(0, 20)}</td>
          </tr>)}
        </tbody></table></div>
    </HFiller>
    </DragDropContext>
  /**/

  //---------------------------------------------------------------------------
  // Toolbar
  //---------------------------------------------------------------------------

  function Toolbar() {
    return <ToolBox style={{ background: "white" }}>
      <Label>Words: {bodyWithWords.words?.text}</Label>
      <Separator/>
      <Label>Chars: {bodyWithWords.words?.chars}</Label>
      <Separator/>
      {getButtonGroup(bodyindex_settings.indexed)}
      <Separator/>
      {getButtonGroup(bodyindex_settings.words, true)}
      <Separator/>
      <Filler/>
    </ToolBox>
  }

  /*
  function EditToolbar() {
  const editor = useSlate()

  // Block type under cursor
  const [match] = Editor.nodes(editor, { match: n => Editor.isBlock(editor, n)})
  const nodetype = match ? match[0].type : undefined

  return <ToolBox style={{ background: "white" }}>
    <Button>Block: {nodetype}</Button>
    <Filler/>
  </ToolBox>
  }
*/


  //---------------------------------------------------------------------------
  // Brute force DnD
  //---------------------------------------------------------------------------

  function findEditor(sectID) {
    switch(sectID) {
      case "body": return bodyeditor;
      case "notes": return noteeditor;
    }
  }

  function findSect(sectID) {
    switch(sectID) {
      case "body": return doc.story.body;
      case "notes": return doc.story.notes;
    }
  }

  function findPart(partID) {
    return (
      doc.story.body.parts.find(part => part.id === partID) ||
      doc.story.notes.parts.find(part => part.id === partID)
    )
  }

  function findSectIDByElemID(elemID) {
    if(elemByID(bodyeditor, elemID).length) return "body"
    if(elemByID(noteeditor, elemID).length) return "notes"
    return undefined
  }

  async function onDragEnd(result) {
    console.log("onDragEnd:", result)

    const {type, source, destination} = result;

    if(!destination) return;

    if(source.droppableId === destination.droppableId) {
      if(source.index === destination.index) return;
    }

    //console.log(type, source, "-->", destination)

    switch(type) {
      case "scene": {
        //console.log(elemByID(bodyeditor, source.droppableId))
        const srcSectID = findSectIDByElemID(source.droppableId)
        const srcEdit = findEditor(srcSectID)
        console.log(srcSectID)
        // Find source container and pop it out

        const srcPath  = elemByID(srcEdit, source.droppableId)[0][1]
        //console.log("srcPart", srcPart[0], "@", srcPart[1])
        const srcParts = [
          ...elemByTypes(srcEdit, ["br.part", "br.scene"], Editor.after(srcEdit, srcPath)),
          [undefined, Editor.end(srcEdit, [])]
        ]
        //console.log(srcParts)

        const srcStart = Editor.start(srcEdit, srcParts[source.index][1])
        const srcEnd = Editor.before(srcEdit, srcParts[source.index+1][1])

        const block = elemsByRange(srcEdit, srcStart, srcEnd)

        Transforms.removeNodes(srcEdit, {at: {anchor: srcStart, focus: srcEnd}, hanging: true})

        // Find destination container and insert element there

        const dstSectID = findSectIDByElemID(destination.droppableId)
        const dstEdit = findEditor(dstSectID)

        const dstPath  = elemByID(dstEdit, destination.droppableId)[0][1]
        const dstParts = [
          ...elemByTypes(dstEdit, ["br.part", "br.scene"], Editor.after(dstEdit, dstPath)),
          [undefined, Editor.end(dstEdit, [])]
        ]
        const dstStart = dstParts[destination.index][1]
        Transforms.insertNodes(dstEdit, block, {at: dstStart})

        setActive(dstSectID)
        focusByID(dstEdit, result.draggableId)
        /*
        const srcPart = findPart(source.droppableId);
        const dstPart = findPart(destination.droppableId);

        const scene = srcPart.children[source.index]
        srcPart.children.splice(source.index, 1)
        dstPart.children.splice(destination.index, 0, scene)

        update(scene.id)
        */
        break;
      }

      case "part": {
        const srcEdit = findEditor(source.droppableId)

        // Find source container and pop element
        const srcParts = [
          ...elemByTypes(srcEdit, ["br.part"]),
          [undefined, Editor.end(srcEdit, [])]
        ]
        //console.log("srcParts", srcParts)
        const [srcStart, srcEnd] = [
          Editor.start(srcEdit, srcParts[source.index][1]),
          Editor.before(srcEdit, srcParts[source.index+1][1]),
        ]

        const block = elemsByRange(srcEdit, srcStart, srcEnd)
        Transforms.removeNodes(srcEdit, {at: {anchor: srcStart, focus: srcEnd}, hanging: true})

        // Find destination container and insert element there

        const dstEdit = findEditor(destination.droppableId)

        const dstParts = [
          ...elemByTypes(dstEdit, ["br.part"]),
          [undefined, Editor.end(dstEdit, [])]
        ]
        const dstStart = dstParts[destination.index][1]
        Transforms.insertNodes(dstEdit, block, {at: dstStart})

        setActive(destination.droppableId)
        focusByID(dstEdit, result.draggableId)

        /*
        const srcSect = findSect(source.droppableId)
        const dstSect = findSect(destination.droppableId)

        const part = srcSect.parts[source.index]
        srcSect.parts.splice(source.index, 1)
        dstSect.parts.splice(destination.index, 0, part)

        update(part.id)
        */
        break;
      }
      default:
        console.log("Unknown draggable type:", type, result)
        return;
    }
  }
}

//-----------------------------------------------------------------------------

function DeferredRender(props) {
  //return props.children
  return useDeferredValue(props.children)
}

//-----------------------------------------------------------------------------

function EditorBox({style, mode="Condensed", visible=true}) {
  //const display = visible ? undefined : "none"

  if(!visible) return null;

  return <VFiller style={{...style}}>
    <div className="Board">
      <SlateEditable className={mode}/>
    </div>
  </VFiller>
}

//-----------------------------------------------------------------------------

function IndexBox({settings, section, style}) {
  const props = {settings, section, style}

  return <DeferredRender>
    <SlateTOC {...props}/>
    </DeferredRender>
}

//-----------------------------------------------------------------------------

function Pre({ style, content }) {
  return <pre style={{ fontSize: "10pt", ...style }}>
    {typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}`}
  </pre>
}

function Empty() {
  return null;
}

//-----------------------------------------------------------------------------

function getButtonGroup(group, exclusive) {
  if(!group?.choices) return null;

  const buttons = {
    "br.scene": {
      tooltip: "Show scenes",
      icon: <Icon.BlockType.Scene/>
    },
    "synopsis": {
      tooltip: "Show synopses",
      icon: <Icon.BlockType.Synopsis />
    },
    "missing": {
      tooltip: "Show missing",
      icon: <Icon.BlockType.Missing />
    },
    "comment": {
      tooltip: "Show comments",
      icon: <Icon.BlockType.Comment />
    },

    "off": {
      tooltip: "Don't show words",
      icon: <Icon.StatType.Off />
    },
    "numbers": {
      tooltip: "Words as numbers",
      icon: <Icon.StatType.Words />,
    },
    "percent": {
      tooltip: "Words as percent",
      icon: <Icon.StatType.Percent />
    },
    "cumulative": {
      tooltip: "Words as cumulative percent",
      icon: <Icon.StatType.Cumulative />
    },
  }

  function getButton(choice) {
    if(!(choice in buttons)) return <ToggleButton key={choice} value={choice}>
      {choice}
    </ToggleButton>

    const {tooltip, icon} = buttons[choice]
    return <ToggleButton key={choice} value={choice}>
      <Tooltip title={tooltip}>
        {icon}
      </Tooltip>
    </ToggleButton>
  }

  return <BorderlessToggleButtonGroup
    exclusive={exclusive}
    value={group.value}
    onChange={(e, value) => (exclusive ? value : true) && group.setValue(value)}
  >
    {group.choices.map(choice => getButton(choice))}
  </BorderlessToggleButtonGroup>
}

const BorderlessToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    //margin: 0,
    //marginRight: theme.spacing(0.5),
    //padding: "5pt",
    padding: "4px",
    border: 0,
    borderRadius: 0,
    "&:hover": {
      background: "lightgrey",
    },
    '&.Mui-selected': {
      background: "lightblue",
    },
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

/*
function WorkspaceTab() {
  const dispatch = useDispatch()
  const current = useSelector(state => state.workspace[state.workspace.selected])
  const { name, files, selected } = current;

  return <HBox style={{background: "#EEE", alignItems: "center"}}>
    <Button onClick={(e) => onClose(e, dispatch)}>{`${name}:`}</Button>
    {files.map(f => <Button
      key={f.id} id={f.id}
      style={{ background: (f.id === selected.id) ? "white" : null }}
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
  dispatch(action.workspace.selectFile({ file }))
  dispatch(action.doc.open({ file }))
}

function onClose(e, dispatch) {
  if (e) e.preventDefault()
  // Move modifications to doc
  dispatch(action.doc.close({}))
}
*/
