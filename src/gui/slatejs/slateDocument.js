//*****************************************************************************
//
// Document load & save
//
//*****************************************************************************

import { Editor } from "slate";
import { mawe } from "../../document"
import { nodeID, wcElem } from "../../document/util";
import { getUIEditor } from "./slateEditor";
import { isAstChange } from "./slateHelpers";

//-----------------------------------------------------------------------------
// TODO: Move the slate buffer specific code out of the document module here.
// It simplifies the document module, which can be then used in other contexts.
//-----------------------------------------------------------------------------

export function loadDocument(filename) {
  return mawe.load(filename);
}

export function createDocument(buffer) {
  return mawe.create(buffer);
}

export function saveDocument(doc) {
  return mawe.save(doc)
}

export function saveDocumentAs(doc, filename) {
  return mawe.saveas(doc, filename)
}

export function renameDocument(file, to) {
  return mawe.rename(file, to)
}

export function decodeBuffer(buffer) {
  return mawe.decodebuf(buffer);
}

export function documentInfo(doc) {
  return mawe.info(doc);
}

//---------------------------------------------------------------------------
// Cursor movement tracking
//---------------------------------------------------------------------------

function trackMarks(editor, sectID) {
  try {
    const { selection } = editor
    if (selection) {
      const { focus } = selection

      const match = Editor.parent(editor,
        focus,
        {
          match: n =>
            !Editor.isEditor(n) &&
            Element.isElement(n)
        }
      )
      if (match) {
        const [node, path] = match
        //console.log(node, path)
        const marks = Editor.marks(editor)
        return { marks, node, id: nodeID(sectID, path) }
      }
    }
  } catch (e) {
    //console.log("Track error:", e)
  }
  return undefined
}

//---------------------------------------------------------------------------
// Editor update callback
//---------------------------------------------------------------------------

function updateSection(editor, key, updateDoc) {
  const track = trackMarks(editor, key)
  if (isAstChange(editor)) {
    updateDoc(doc => {
      const { children } = editor
      //console.log("Update:", key, children)
      doc[key].acts = children
      doc[key].words = wcElem({ type: "sect", children })
      doc.track = track
    })
  } else {
    updateDoc(doc => {
      doc.track = track
    })
  }
}

function getEditor(key, section, updateDoc) {
  const editor = getUIEditor()
  editor.children = section.acts
  editor.onChange = () => updateSection(editor, key, updateDoc)
  return editor
}

//-----------------------------------------------------------------------------
// Binding editors to doc
//-----------------------------------------------------------------------------

export function bindEditors(doc, updateDoc) {
  const editors = {
    draft: getEditor("draft", doc.draft, updateDoc),
    notes: getEditor("notes", doc.notes, updateDoc),
    storybook: getEditor("storybook", doc.storybook, updateDoc),
  }
  //console.log("Editors bound:", editors)
  return editors
}

