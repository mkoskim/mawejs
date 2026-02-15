//*****************************************************************************
//
// Slate Editable
//
//*****************************************************************************

import React, { useMemo, useCallback } from 'react';
import {
  Editor,
  Node, Text,
  Transforms,
  Element,
} from 'slate'
import { useSlate, Editable } from 'slate-react'

import {
  nodeShortcuts,
  markShortcuts,
} from '../../document/elements';

import { toggleMark } from './slateMarks';

import {
  searchOffsets, searchPattern,
} from './slateSearch';

import {
  toggleFold,
  foldByType,
  FOLD,
} from "./slateFolding"

import { addClass, IsKey } from '../common/factory';

//-----------------------------------------------------------------------------

export function SlateEditable({className, visible, highlight, ...props}) {
  //console.log("Search:", search)

  const editor = useSlate()

  const re = useMemo(() => searchPattern(highlight), [highlight])

  const highlighter = useCallback(
    re
    ?
    ([node, path]) => {
      if (!Text.isText(node)) return []

      const offsets = searchOffsets(Node.string(node), re)
      const ranges = offsets.map(offset => ({
        anchor: {path, offset},
        focus: {path, offset: offset + highlight.length},
        highlight: true,
      }))
      //if(ranges.length) console.log(ranges)

      return ranges
    }
    :
    undefined,
    [re]
  )

  return <Editable
    //readOnly={!active}
    className={addClass(className, !visible ? "Hidden" : undefined)}
    //className={className}
    spellCheck={false} // Keep false until you find out how to change language
    renderElement={renderElement}
    renderLeaf={renderLeaf}
    decorate={highlighter}
    onKeyDown={useCallback(e => onKeyDown(editor, e), [editor])}
    //onPaste={useCallback(e => onPaste(editor, e), [editor])}
    {...props}
  />
}

//*****************************************************************************
//
// Buffer rendering
//
//*****************************************************************************

// Turn some debug features on/off - off by default

const debug = {
  //blocks: "withBorders",  // Borders around chapter & scene div's to make them visible
}

function renderContainer(type, content, folded, attributes, children) {
  const foldClass = folded ? "folded" : undefined
  const [first, ...rest] = children
  return <div className={addClass(content ?? type, foldClass, debug?.blocks)} {...attributes}>
    {first}
    {folded ? null : rest}
  </div>
}

function renderElement({element, attributes, ...props}) {

  const {type, folded, numbered, content} = element
  const {children} = props
  const numClass = numbered ? "Numbered" : ""

  switch (type) {
    //-------------------------------------------------------------------------
    // Containers
    //-------------------------------------------------------------------------

    case "act":
    case "chapter":
    case "scene":
      return renderContainer(type, content, folded, attributes, children)

    //-------------------------------------------------------------------------
    // Container breaks
    //-------------------------------------------------------------------------

    case "hact": return <h4 className={numClass} {...attributes} {...props}/>
    case "hchapter": return <h5 className={numClass} {...attributes} {...props}/>
    case "hsynopsis":
    case "hnotes":
    case "hscene": return <h6 {...attributes} {...props}/>

    //-------------------------------------------------------------------------
    // Paragraph styles
    //-------------------------------------------------------------------------

    case "bookmark":
    case "comment":
    case "missing":
    case "tags":
    case "fill":
      return <p className={type} {...attributes} {...props}/>

    case "quote":
    case "br":
      return <div className={type} {...attributes} {...props}/>

    case "p":
    default: break;
  }

  return <p {...attributes} {...props}/>
}

function renderLeaf({ leaf, attributes, ...props}) {
  const className = [
    leaf.highlight ? "highlight" : undefined,
    leaf.bold ? "bold" : undefined,
    leaf.italic ? "italic" : undefined,
  ].filter(e => e).join(" ")

  return <span className={className} {...attributes} {...props}/>
}

//*****************************************************************************
//
// Custom paste
//
//*****************************************************************************

function onPaste(editor, event) {
  console.log("Paste:", event)
}

/*
onPaste={useCallback(
  (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (
      !readOnly &&
      ReactEditor.hasEditableTarget(editor, event.target) &&
      !isEventHandled(event, attributes.onPaste)
    ) {
      // COMPAT: Certain browsers don't support the `beforeinput` event, so we
      // fall back to React's `onPaste` here instead.
      // COMPAT: Firefox, Chrome and Safari don't emit `beforeinput` events
      // when "paste without formatting" is used, so fallback. (2020/02/20)
      // COMPAT: Safari InputEvents generated by pasting won't include
      // application/x-slate-fragment items, so use the
      // ClipboardEvent here. (2023/03/15)
      if (
        !HAS_BEFORE_INPUT_SUPPORT ||
        isPlainTextOnlyPaste(event.nativeEvent) ||
        IS_WEBKIT
      ) {
        event.preventDefault()
        ReactEditor.insertData(editor, event.clipboardData)
      }
    }
  },
  [readOnly, editor, attributes.onPaste]
)}
*/

//*****************************************************************************
//
// Custom hotkeys
//
//*****************************************************************************

function onKeyDown(editor, event) {

  //---------------------------------------------------------------------------
  // Node & character styles
  //---------------------------------------------------------------------------

  for(const {shortcut, node} of nodeShortcuts) {
    if(shortcut(event)) {
      event.preventDefault();
      Transforms.setNodes(editor, node)
      return
    }
  }

  for(const {shortcut, mark} of markShortcuts) {
    if(shortcut(event)) {
      event.preventDefault();
      toggleMark(editor, mark)
      return
    }
  }

  //---------------------------------------------------------------------------
  // Folding
  //---------------------------------------------------------------------------

  if (IsKey.AltF(event)) {
    event.preventDefault()
    toggleFold(editor)
    return
  }
  if (IsKey.AltA(event)) {
    event.preventDefault()
    foldByType(editor, FOLD.foldAll)
    //foldAll(editor, true)
    return
  }
  if (IsKey.AltS(event)) {
    event.preventDefault()
    foldByType(editor, FOLD.unfoldAll)
    //foldAll(editor, false)
    return
  }

  //---------------------------------------------------------------------------
  // Moving
  //---------------------------------------------------------------------------

  if(IsKey.AltUp(event)) {
    event.preventDefault()

    const current = Editor.above(editor, {
      match: n => Element.isElement(n) && n.type === "scene"
    })
    if(!current) return

    const match = Editor.previous(editor, {
      at: current[1],
      match: n => Element.isElement(n) && n.type === "scene"
    })
    if(match) {
      const [,path] = match
      Transforms.select(editor, path)
      Transforms.collapse(editor)
    }
    return
  }

  if(IsKey.AltDown(event)) {
    event.preventDefault()

    const current = Editor.above(editor, {
      match: n => Element.isElement(n) && n.type === "scene"
    })
    if(!current) return

    const match = Editor.next(editor, {
      at: current[1],
      match: n => Element.isElement(n) && n.type === "scene"
    })
    if(match) {
      const [,path] = match
      Transforms.select(editor, path)
      Transforms.collapse(editor)
    }
    return
  }

  //---------------------------------------------------------------------------
  // Misc
  //---------------------------------------------------------------------------

  if(IsKey.AltL(event)) {
    event.preventDefault()
    Transforms.insertText(editor,
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sagittis " +
      "faucibus odio, sed fringilla lacus tempor eu. Curabitur lacinia ante quis " +
      "urna placerat, vitae ullamcorper dolor accumsan. Nam ex velit, dictum eget " +
      "porttitor vitae, aliquet at tortor. Vivamus dictum mauris ut dolor mattis, " +
      "ut pulvinar ligula scelerisque. Vivamus luctus neque nec urna sodales " +
      "fringilla. Ut gravida nibh risus, ac tempus mauris scelerisque nec. Vivamus " +
      "semper erat eget placerat imperdiet. Fusce non lorem eu diam vulputate porta " +
      "non eu nibh. Mauris egestas est tellus, id placerat libero tempus et. " +
      "Integer eget ultrices ante. Vestibulum est arcu, elementum a ornare convallis, " +
      "fringilla."
    )
    Transforms.insertNodes(editor, {type: "p", children: [{text: ""}]})
    return
  }
}
