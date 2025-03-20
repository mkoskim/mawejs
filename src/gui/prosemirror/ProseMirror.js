// ****************************************************************************
//
// Document exporting
//
// ****************************************************************************

import React, {
  useState,
} from 'react';

import { EditorState } from "prosemirror-state";
import {Schema} from "prosemirror-model"
import {undo, redo, history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"

import { schema as basicSchema } from "prosemirror-schema-basic";

import {
  ProseMirror,
  ProseMirrorDoc,
  reactKeys,
} from "@handlewithcare/react-prosemirror";

import {HBox} from "../common/factory";

import {
} from "../common/factory";

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
      group: "p",
      parseDOM: [{tag: "p"}],
      toDOM() { return ["p", 0] },
    },
    doc: {
      content: "p+",
    },
  }
})

const plugins = [
  reactKeys(),
  history(),
  keymap({"Mod-z": undo, "Mod-y": redo})
]

const state = {
  schema,
  plugins,
}

//*****************************************************************************
//
// Editor view
//
//*****************************************************************************

export function ProseEditView({doc, updateDoc}) {
  const [editorState, setEditorState] = useState(
    EditorState.create(state)
  );

  return (
    <HBox style={{overflow: "auto"}}>
    <div className="Filler Board Editor">
    <ProseMirror
      state={editorState}
      dispatchTransaction={(tr) => {
        setEditorState((s) => s.apply(tr));
      }}
    >
      <div className="Sheet Regular"><ProseMirrorDoc/></div>
    </ProseMirror>
    </div>
    </HBox>
  );
}
