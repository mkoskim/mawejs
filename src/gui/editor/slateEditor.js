//*****************************************************************************
//*****************************************************************************
//
// Slate customizations
//
//*****************************************************************************
//*****************************************************************************

import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import { Slate, useSlate, Editable, withReact, ReactEditor } from 'slate-react'
import {
  Editor,
  Node, Text,
  Transforms,
  Range, Point, Path,
  createEditor,
  Descendant,
} from 'slate'

import { withHistory } from "slate-history"
import { addClass, Icon } from '../common/factory';
import { sleep, uuid, nanoid, splitByLeadingElem } from '../../util';
import {section2flat, section2lookup, wcElem, wordcount} from '../../document/util';

//*****************************************************************************
//
// Rendering
//
//*****************************************************************************

function searchOffsets(text, re) {
  return Array.from(text.matchAll(re)).map(match => match["index"])
}

function text2Regexp(text, opts = "gi") {
  if(!text) return undefined
  return new RegExp(text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), opts)
}

export function SlateEditable({className, highlight, ...props}) {
  //const renderElement = useCallback(props => <Element {...props} />, [])
  //const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  //console.log("Search:", search)

  const re = useMemo(() => text2Regexp(highlight), [highlight])

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
    className={addClass(className, "Sheet")}
    spellCheck={false} // Keep false until you find out how to change language
    renderElement={Element}
    renderLeaf={Leaf}
    decorate={highlighter}
    {...props}
  />
}

function Element({element, attributes, ...props}) {

  switch (element.type) {
    case "title": return <h1 {...attributes} {...props}/>

    case "part": return <h2 {...attributes} {...props}/>
    case "scene": return <h3 {...attributes} {...props}/>

    case "comment":
    case "missing":
    case "synopsis":
      return <p className={element.type} {...attributes} {...props}/>

    case "p":
    default:
      if (Node.string(element) === "") {
        return <div className="emptyline" {...attributes} {...props}/>
      }
      return <p {...attributes} {...props}/>
  }
}

function Leaf({ leaf, attributes, ...props }) {
  return <span
    style={{background: leaf.highlight && "#ffeeba"}}
    {...attributes}
    {...props}
  />

  /*
  {...(leaf.highlight && { 'data-cy': 'search-highlighted' })}
  className={css`
    font-weight: ${leaf.bold && 'bold'};
    background-color: ${leaf.highlight && '#ffeeba'};
  `}
  */
}

//*****************************************************************************
//
// Helper functions
//
//*****************************************************************************

//-----------------------------------------------------------------------------

function elemIsBlock(editor, elem) {
  return elem && !Editor.isEditor(elem) && Editor.isBlock(editor, elem);
}

function elemIsType(editor, elem, type) {
  return elemIsBlock(editor, elem) && elem.type === type
}

//-----------------------------------------------------------------------------

// Return true, if editor operations change content
// Return false, if operations only change selection

export function isAstChange(editor) {
  return editor.operations.some(op => 'set_selection' !== op.type)
}

//-----------------------------------------------------------------------------

export function elemByID(editor, id, anchor, focus) {
  if(!id) return undefined

  const match = Editor.nodes(editor, {
    at: {
      anchor: anchor ?? Editor.start(editor, []),
      focus: focus ?? Editor.end(editor, [])
    },
    match: (n, p) => Editor.isBlock(editor, n) && n.id === id
  }).next()

  if(match.done) return undefined
  return match.value
}

export function hasElem(editor, id) {
  return !!elemByID(editor, id)
}

export function elemByTypes(editor, types, anchor, focus) {
  if(!anchor) anchor = Editor.start(editor, [])
  if(!focus) focus = Editor.end(editor, [])

  return Array.from(
    Editor.nodes(editor, {
      at: {anchor, focus},
      match: (node, path) => types.includes(node.type),
    })
  )
}

export function elemsByRange(editor, anchor, focus) {
  return Array.from(
    Editor.nodes(editor, {
      at: {anchor, focus},
      match: (node, path) => path.length == 1 && Editor.isBlock(editor, node),
    })
  ).map(([n, p]) => n)
}

//-----------------------------------------------------------------------------
// Pop elems

export function elemPop(editor, id) {
  const match = elemByID(editor, id)
  if(!match) return

  const [node, path] = match
  const [focus, anchor] = range(node, path)
  if(!focus || !anchor) return

  const block = elemsByRange(editor, anchor, focus)
  Transforms.removeNodes(editor, {at: {anchor, focus}, hanging: true})
  return block

  function range(node, path) {
    if(node.type === "part")  return getRange(path, ["part"])
    if(node.type === "scene") return getRange(path, ["part", "scene"])
    return []
  }

  function getRange(path, types) {
    const match = Editor.next(editor, {
      at: path,
      match: (n, p) => Editor.isBlock(editor, n) && types.includes(n.type)
    })
    return [
      Editor.start(editor, path),
      match ? Editor.before(editor, match[1]) : Editor.end(editor, []),
    ]
  }
}

export function elemPushTo(editor, block, id, index) {
  const blocktype = block[0].type

  const blocks = [
    ...(blocktype == "part" ? getParts() : getScenes(id)),
    [undefined, Editor.end(editor, [])]
  ]

  //console.log("Pushto:", anchor, blocks, index)

  Transforms.insertNodes(editor, block, {at: blocks[index][1]})

  function getParts() {
    return elemByTypes(editor, ["part"])
  }

  function getScenes(partid) {
    const elem = elemByID(editor, partid)
    const anchor = Editor.after(editor, elem[1])
    if(!anchor) return []
    return elemByTypes(editor, ["part", "scene"], anchor)
  }

}

//-----------------------------------------------------------------------------
// Focusing elements

export function focusByID(editor, id) {
  const match = elemByID(editor, id)

  if(!match) {
    focusByPath(editor, undefined);
  } else {
    const [node, path] = match
    focusByPath(editor, Editor.start(editor, path))
  }
}

export async function focusByPath(editor, path) {
  //await sleep(20)
  if(!ReactEditor.isFocused(editor)) {
    ReactEditor.focus(editor)
    await sleep(40);
  }
  if(path) Transforms.select(editor, path);
}

async function scrollToPoint(editor, point, focus) {
  if(focus) {
    await focusByPath(editor, point)
  }

  const [dom] = ReactEditor.toDOMPoint(editor, point)
  //console.log("DOM:", dom)
  //Editable.scrollIntoView(editor, dom.parentElement)
  /*
  dom.parentElement.scrollIntoView({
    //behaviour: "smooth",
    block: "center",
  })
  /*/
  dom.parentElement.scrollIntoViewIfNeeded(false)
  /**/
}

export async function scrollToRange(editor, range, focus) {
  if(focus) {
    await focusByPath(editor, range)
  }

  scrollToPoint(editor, range.focus)
}

//*****************************************************************************
//
// Searching
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Search text within a node

function searchMatchNext(re, leaf, path, offset = 0) {
  const matches = searchOffsets(leaf.text, re)
    .filter(match => match >= offset)

  return matches.length
    ? {path, offset: matches[0]}
    : undefined
}

function searchMatchPrev(re, leaf, path, offset) {
  const matches = searchOffsets(leaf.text, re)
    .filter(match => match < offset)

  return matches.length
    ? {path, offset: matches[matches.length - 1]}
    : undefined
}

//-----------------------------------------------------------------------------
// Search text from another node

function searchTextForward(editor, text, path, offset) {
  const re = text2Regexp(text)
  const [leaf] = Editor.leaf(editor, path)
  const match = searchMatchNext(re, leaf, path, offset)
  if(match) return match

  const next = Editor.next(editor, {
    match: (n, p) => !Path.equals(path, p) && Text.isText(n) && searchOffsets(n.text, re).length
  })
  if(!next) return undefined
  //console.log(next)
  return searchMatchNext(re, next[0], next[1])
}

function searchTextBackward(editor, text, path, offset) {
  const re = text2Regexp(text)

  const [leaf] = Editor.leaf(editor, path)
  const match = searchMatchPrev(re, leaf, path, offset)
  if(match) return match

  const prev = Editor.previous(editor, {
    match: (n, p) => !Path.equals(path, p) && Text.isText(n) && searchOffsets(n.text, re).length
  })
  if(!prev) return undefined
  //console.log(next)
  return searchMatchPrev(re, prev[0], prev[1], prev[0].text.length)
}

//-----------------------------------------------------------------------------
// Search with scrolling and optional focusing

export function searchFirst(editor, text, doFocus=false) {
  const {path, offset} = editor.selection.focus

  return searchWithScroll(editor, text, path, offset, true, doFocus)
}

export function searchForward(editor, text, doFocus=false) {
  const {path, offset} = editor.selection.focus

  return searchWithScroll(editor, text, path, offset+1, true, doFocus)
}

export function searchBackward(editor, text, doFocus=false) {
  const {path, offset} = editor.selection.focus

  return searchWithScroll(editor, text, path, offset, false, doFocus)
}

function searchWithScroll(editor, text, path, offset, forward=true, doFocus=false) {
  if(text) {
    const match = (forward ? searchTextForward : searchTextBackward)(editor, text, path, offset)

    if(match) {
      const {path, offset} = match

      scrollToRange(
        editor,
        {
          focus: { path, offset },
          anchor: { path, offset: offset + text.length }
        },
        doFocus
      )
      return
    }
  }
  if(path) {
    scrollToPoint(
      editor,
      { path, offset },
      doFocus
    )
  }
}

//*****************************************************************************
//
// Editor customizations
//
//*****************************************************************************

export function getEditor() {

  return [
    createEditor,
    withHistory,
    withMarkup,
    withFixParts,
    withIDs,
    withReact,
    withDebugging,
  ].reduce((editor, func) => func(editor), undefined)
}

//-----------------------------------------------------------------------------
// Debugging
//-----------------------------------------------------------------------------

function withDebugging(editor) {
  const { normalizeNode } = editor;

  /*
  editor.normalizeNode = entry => {
    const [node, path] = entry
    console.log("Normalize:", path)
    return normalizeNode(entry)
  }
  /**/

  return editor
}

//-----------------------------------------------------------------------------
// Markup shortcuts
//-----------------------------------------------------------------------------

function withMarkup(editor) {

  //---------------------------------------------------------------------------
  // Markup shortcuts to create styles

  const SHORTCUTS = {
    '** ': {type: "part"},
    '## ': {type: "scene"},
    '>> ': {type: "synopsis"},
    '// ': {type: 'comment'},
    '!! ': {type: 'missing'},
    //'-- ': ,
    //'++ ': ,
    //'<<':
    //'((':
    //'))':
    //'==':
    //'??':
    //'++':
    //'--':
    //'%%':
    //'/*':
    //'::':
  }

  const { insertText } = editor

  editor.insertText = text => {
    const { selection } = editor

    if(!selection) return insertText(text)
    if(!Range.isCollapsed(selection)) return insertText(text)

    const { anchor } = selection
    const [node, path] = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    })

    //const path = node ? node[1] : []
    const start = Editor.start(editor, path)
    const range = { anchor, focus: start }
    const key = Editor.string(editor, range) + text

    if(key in SHORTCUTS) {
      Transforms.select(editor, range)
      Transforms.delete(editor)
      Transforms.setNodes(editor, SHORTCUTS[key])
      return
    }

    insertText(text)
  }

  //---------------------------------------------------------------------------
  // Default styles followed by a style

  const STYLEAFTER = {
    "title": "part",
    "part": "scene",
    "scene": "p",
    "synopsis": "p",
  }

  const RESETEMPTY = [
    "synopsis",
    "comment",
    "missing",
  ]

  const { insertBreak } = editor

  editor.insertBreak = () => {
    const { selection } = editor

    if(!selection) return insertBreak()
    if(!Range.isCollapsed(selection)) return insertBreak()

    const [match] = Editor.nodes(editor, {
      match: n => elemIsBlock(editor, n)
    })

    if(!match) return insertBreak()

    const [node, path] = match

    //console.log("Node:", node)

    if(node.type === "part") {
      if(Point.equals(selection.focus, Editor.end(editor, path))) {
        Transforms.move(editor, {distance: 1, unit: "line"})
        return
      }
    }

    if(RESETEMPTY.includes(node.type) && Node.string(node) == "") {
      Transforms.setNodes(editor, {type: "p"});
      return
    }

    if(node.type in STYLEAFTER) {
      const newtype = STYLEAFTER[node.type]
      Editor.withoutNormalizing(editor, () => {
        Transforms.splitNodes(editor, {always: true})
        Transforms.setNodes(editor, {type: newtype})
      })
      return
    }

    insertBreak()
  }

  //---------------------------------------------------------------------------
  // Backspace at the start of line resets formatting

  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if(!selection) return deleteBackward(...args)
    if(!Range.isCollapsed(selection)) return deleteBackward(...args)

    // Which block we are:
    const match = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    })
    if(!match) return deleteBackward(...args)

    const [node, path] = match

    if(!elemIsBlock(editor, node)) return deleteBackward(...args)

    // Beginning of line?
    if(!Point.equals(selection.anchor, Editor.start(editor, path))) return deleteBackward(...args)

    // Merge plain paragraphs to scene
    if(node.type === "p") {
      const prev = Editor.previous(editor, {at: path})
      if(prev && prev[0].type === "scene") {
        Transforms.setNodes(editor, {type: "scene"})
      }
      return deleteBackward(...args)
    }

    // Don't remove scene, if it is the first one after part break
    if(node.type === "scene") {
      const prev = Editor.previous(editor, {at: path})
      if(prev && prev[0].type === "part") {
        const next = Editor.next(editor, {at: path})
        if(!next || next[0].type === "scene") return deleteBackward(...args)
        return
      }
    }

    // Remove formatting
    Transforms.setNodes(editor, {type: 'p'})
    return
  }

  return editor
}

//-----------------------------------------------------------------------------
// Ensure that indexable blocks have unique ID
//-----------------------------------------------------------------------------

function withIDs(editor) {

  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry

    // When argument is whole editor (all blocks)
    if(path.length > 0) return normalizeNode(entry);

    //console.log("Path/Node:", path, node)

    const blocks = Editor.nodes(editor, {
      at: [],
      match: (node, path) => path.length === 1 && Editor.isBlock(editor, node),
    })

    //console.log(Array.from(blocks))

    const ids = new Set()

    for(const block of blocks) {
      const [node, path] = block

      if(!node.id || ids.has(node.id)) {
        console.log("ID clash fixed:", path)
        const id = nanoid()
        Transforms.setNodes(editor, {id}, {at: path})
        ids.add(id)
      }
      else {
        ids.add(node.id)
      }
    }

    return normalizeNode(entry)
  }

  return editor
}

//-----------------------------------------------------------------------------
// Ensure, that part breaks are followed by scene break
//-----------------------------------------------------------------------------

function withFixParts(editor) {

  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry

    //console.log("Normalize: Fix parts")

    //console.log("Path/Node:", path, node)

    //-------------------------------------------------------------------------
    // 1. Ensure, that we have at least 1 node and that is a part
    // 2. Ensure, that first block is always part

    if(path.length == 0) {
      if(editor.children.length < 1) {
        Transforms.insertNodes(editor,
          {type: "part", children: [{text: ""}]},
          {at: path.concat(0)}
        )
        return
      }
      if(editor.children[0].type !== "part") {
        Transforms.setNodes(editor,
          {type: "part"},
          {at: path.concat(0)}
        )
        return
      }
      return normalizeNode(entry)
    }

    //-------------------------------------------------------------------------
    // 3. Ensure, that created part is followed by scene break
    // 4. Ensure, that node after part is a scene

    if(path.length === 1) {
      if(node.type === "part") {
        //console.log("Part", node, path)
        const next = Editor.next(editor, {at: path})
        if(next) {
          //console.log("Check:", next)
          const [n, p] = next
          if(n.type !== "scene") {
            Transforms.insertNodes(
              editor,
              {type: "scene", id: nanoid(), children: [{text: ""}]},
              {at: p}
            )
            return
          }
        }
      } else {
        const prev = Editor.previous(editor, {at: path})
        if(prev && prev[0].type === "part") {
          Transforms.setNodes(
            editor,
            {type: "scene"},
            {at: path}
          )
          return
        }
      }
    }

    return normalizeNode(entry)
  }

  return editor
}

//*****************************************************************************
//
// Doc --> Slate
//
//*****************************************************************************

export function section2edit(section) {
  return validate(section2flat(section).map(elem2Edit))

  function elem2Edit(elem) {
    switch(elem.type) {
      case "part": return {
        ...elem,
        children: [{text: elem.name ?? ""}]
      }
      case "scene": return {
        ...elem,
        children: [{text: elem.name ?? ""}]
      }
      case "br": return {
        ...elem,
        type: "p",
      }
    }
    return elem
  }

  function validate(buffer) {
    for(const elem of buffer) {

      expect(elem.id, "Missing ID")
      expect(elem.type, "Missing type")
      expect(typeof(elem) === "object", "Not an object")
      expect(Array.isArray(elem.children), "Children not an array")
      expect(elem.children.every(child => !child.children), "Children has children.")
      expect(elem.children.every(child => typeof(child.text) === "string"), "Child has no text.")

      function expect(cond, message) {
        if(cond) return
        console.log("ERROR:", elem, message)
      }
    }
    return buffer
  }
}

//*****************************************************************************
//
// Slate --> Doc
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Regroup parts & scenes from flattened buffer

export function edit2grouped(content) {
  //const [head, parts] = splitHead(content)

  var grouped = []

  for(var index = 0; index < content.length;) {
    const elem = content[index]

    console.assert(isPartBreak(elem), "Missing part break")
    const head = elem
    var scenes = []

    for(index++; index < content.length;) {
      const elem = content[index]
      if(isPartBreak(elem)) break;
      console.assert(isSceneBreak(elem), "Missing scene break")

      const head = elem
      var paras = []

      for(index++;index < content.length; index++) {
        const elem = content[index]
        if(isPartBreak(elem)) break
        if(isSceneBreak(elem)) break
        paras.push(elem)
      }

      scenes.push([head, paras])
    }
    grouped.push([head, scenes])
  }

  return grouped

  function isPartBreak(elem) {
    return elem.type === "part"
  }

  function isSceneBreak(elem) {
    return elem.type === "scene"
  }
}

//-----------------------------------------------------------------------------
// Update parts & scenes

export function updateSection(buffer, section) {

  //console.log("Update section")

  const lookup = section ? section2lookup(section) : {}
  //console.log(lookup)

  const grouped = edit2grouped(buffer)
  //console.log(grouped)

  const updated = grouped.map(part => edit2part(part, lookup))
  const isClean = cmpList(updated, section.parts)

  if(isClean) return section

  return {
    ...section,
    parts: updated,
    words: wcElem({type: "sect", children: updated})
  }
}

function edit2part(part, lookup) {
  const [head, scenes] = part
  const {id} = head

  return checkClean({
    type: "part",
    name: Node.string(head),
    id,
    children: scenes.map(scene => edit2scene(scene, lookup)),
  }, lookup)
}

// Update scene

function edit2scene(scene, lookup) {
  const [head, paragraphs] = scene
  const {id} = head;

  return checkClean({
    type: "scene",
    name: Node.string(head),
    id,
    children: paragraphs.map(p => edit2paragraph(p, lookup))
  }, lookup)
}

// Update paragraph

function edit2paragraph(elem, lookup) {
  const text = Node.string(elem)
  const {id, type} = elem

  return checkClean({
    type: type === "p" && text === "" ? "br" : type,
    id,
    children: [{type: "text", text}],
  }, lookup)
}

function checkClean(elem, lookup) {
  const {id} = elem

  if(lookup.has(id)) {
    const orig = lookup.get(id)

    if(cmpType(elem, orig)) switch(elem.type) {
      case "part":
      case "scene":
        if(cmpNamedGroup(elem, orig)) return orig
        break;
      case "br": return orig;
      default:
        if(elem.children[0].text === orig.children[0].text) return orig
        break;
    }
    //console.log(`Update ${elem.type}:`, id)
  } else {
    //console.log(`Create ${elem.type}`, id)
  }

  return {
    ...elem,
    words: wcElem(elem)
  }
}

function cmpNamedGroup(elem, orig) {
  return (
    cmpTypeName(elem, orig) &&
    cmpChildren(elem, orig)
  )
}

function cmpChildren(elem, orig) {
  return cmpList(elem.children, orig.children)
}

function cmpTypeName(elem, orig) {
  return (
    cmpType(elem, orig) &&
    elem.name === orig.name
  )
}

function cmpType(elem, orig) {
  return (
    elem.id === orig.id &&
    elem.type === orig.type
  )
}

function cmpList(a, b) {
  if(a.length !== b.length) return false
  return a.every((elem, index) => elem === b[index])
}
