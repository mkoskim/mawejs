//*****************************************************************************
//
// Marks
//
//*****************************************************************************

import {
  Editor,
} from 'slate'

export function isMarkActive(editor, format) {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

export function setMark(editor, format, active) {
  if (active) {
    Editor.addMark(editor, format, true)
  } else {
    Editor.removeMark(editor, format)
  }
}

export function toggleMark(editor, format) {
  setMark(editor, format, !isMarkActive(editor, format))
}
