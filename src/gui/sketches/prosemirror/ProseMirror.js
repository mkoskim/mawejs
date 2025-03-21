// ****************************************************************************
//
// Document exporting
//
// ****************************************************************************

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { EditorState } from "prosemirror-state";
import {Schema} from "prosemirror-model"
import {undo, redo, history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import { baseKeymap } from 'prosemirror-commands'

import {
  ProseMirror,
  ProseMirrorDoc,
  reactKeys,
  useEditorEffect,
} from "@handlewithcare/react-prosemirror";

import {HBox} from "../../common/factory";

import {
} from "../../common/factory";
import {TextSelection} from 'prosemirror-state';
import {elemAsText, filterCtrlElems} from '../../../document';

//*****************************************************************************
//
// Schema
//
//*****************************************************************************

const schema = new Schema({
  nodes: {
    text: {},
    paragraph: {
      content: "text*",
      toDOM: () => ["p", 0],
    },
    scene: {
      content: "paragraph*",
      toDOM: () => ["div", {class: "scene withBorders"}, 0],
    },
    chapter: {
      content: "scene*",
      toDOM: () => ["div", {class: "chapter withBorders"}, 0],
    },
    act: {
      content: "chapter*",
      toDOM: () => ["div", {class: "act withBorders"}, 0],
    },
    doc: {
      content: "act+",
    },
  }
})

const plugins = [
  reactKeys(),
  history(),
  keymap({"Mod-z": undo, "Mod-y": redo}),
  keymap(baseKeymap)
]

//*****************************************************************************
//
// Editor view
//
//*****************************************************************************

export function ProseEditView({doc, updateDoc}) {
  const section = useMemo(() => getDoc(doc), [])
  const [editorState, setEditorState] = useState(
    EditorState.create({
      schema,
      plugins,
      doc: section,
      selection: TextSelection.atStart(section.firstChild),
    })
  );
  const editorRef = useRef(null);

  useEffect(() => {
    console.log("EditorRef:", editorRef)
    editorRef.current.focus();
  }, []);

  return (
    <div className="Filler Board Editor">
    <ProseMirror
      state={editorState}
      dispatchTransaction={(tr) => {
        setEditorState((s) => s.apply(tr));
      }}
    >
      <div className="Sheet Regular debug">
        <ProseMirrorDoc ref={editorRef} spellCheck={false}/>
      </div>
    </ProseMirror>
    </div>
  );
}

//*****************************************************************************

function getDoc(doc) {
  const content = doc.body.acts.map(processAct).flat()
  //console.log("Content:", content)

  return schema.nodeFromJSON({
    type: "doc",
    content,
  })

  function processAct({name, folded, children}) {
    return {
      type: "act",
      attrs: {name, folded},
      content: filterCtrlElems(children).map(processChapter).flat()
    }
  }

  function processChapter({name, folded, children}) {
    return {
      type: "chapter",
      attrs: {name, folded},
      content: filterCtrlElems(children).map(processScene).flat()
    }
  }

  function processScene({name, folded, children}) {
    return {
      type: "scene",
      attrs: {name, folded},
      content: filterCtrlElems(children).map(processParagraph).flat()
    }
  }

  function processParagraph(paragraph) {
    const text = elemAsText(paragraph)
    if (text) {
      return {
        type: "paragraph",
        content: [{type: "text", text}]
      }
    }
    return {
      type: "paragraph",
      content: []
    }
  }
}
