//*****************************************************************************
//*****************************************************************************
//
// Nested editing with SlateJS
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
  Element,
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

export function text2Regexp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

function searchPattern(text, opts = "gi") {
  if(!text) return undefined
  return new RegExp(text2Regexp(text), opts)
}

export function SlateEditable({className, highlight, ...props}) {
  //console.log("Search:", search)

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
    className={className}
    spellCheck={false} // Keep false until you find out how to change language
    renderElement={renderElement}
    renderLeaf={renderLeaf}
    decorate={highlighter}
    {...props}
  />
}

function renderElement({element, ...props}) {

  switch (element.type) {
    case "part": return <div className="part" {...props}/>
    case "scene": return <div className="scene" {...props} />

    case "hpart": return <h5 {...props}/>
    case "hscene": return <h6 {...props}/>

    case "comment":
    case "missing":
    case "synopsis":
      return <p className={element.type} {...props}/>

    case "p":
    default: break;
  }

  if (Node.string(element) === "") {
    return <div className="emptyline" {...props}/>
  }
  return <p {...props}/>
}

function renderLeaf({ leaf, attributes, children}) {
  return <span
    className={leaf.highlight ? "highlight" : undefined}
    {...attributes}
    >
      {children}
    </span>
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

  //console.log("Pop:", path, node)

  Transforms.removeNodes(editor, {at: path, hanging: true})
  return node
}

export function elemPushTo(editor, block, id, index) {
  //console.log("Push", id, index)

  if(!block) return

  function getPath() {
    if(!id) return [index]
    const match = elemByID(editor, id)
    const [node, path] = match
    return [...path, index+1]
  }

  Transforms.insertNodes(editor, block, {at: getPath()})
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
  const re = searchPattern(text)
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
  const re = searchPattern(text)

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
  if(!text) return

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
    withFixNesting,
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
    '** ': {type: "hpart"},
    '## ': {type: "hscene"},
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

  const STYLEAFTER = {
    "hpart": "hscene",
    "hscene": "p",
    "synopsis": "p",
    "missing": "p",
  }

  const RESETEMPTY = [
    "synopsis",
    "comment",
    "missing",
  ]

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

  const { insertBreak } = editor

  editor.insertBreak = () => {
    const { selection } = editor

    if(!selection) return insertBreak()
    if(!Range.isCollapsed(selection)) return insertBreak()

    const [node, path] = Editor.above(editor, {
      match: n => Editor.isBlock(editor, n),
    })
    /*
    const [match] = Editor.nodes(editor, {
      match: n => elemIsBlock(editor, n)
    })

    if(!match) return insertBreak()

    const [node, path] = match
    */

    //console.log("Node:", node)

    /*
    // If we hit enter at the end of part, and next block is scene, just move the cursor
    if(node.type === "part") {
      //console.log("WithMarkup: part")
      //console.log("- Cursor:", selection.focus)
      //console.log("- End...:", Editor.end(editor, path))
      if(Point.equals(selection.focus, Editor.end(editor, path))) {
        const next = Editor.next(editor, {at: path})
        if(next) {
          const [node, path] = next
          //console.log("- Next:", node)
          if(node.type === "scene") {
            Transforms.move(editor, {distance: 1, unit: "line"})
            return
          }
        }
      }
    }
    */

    // If we hit enter at empty line, and block type is RESETEMPTY, reset type
    if(RESETEMPTY.includes(node.type) && Node.string(node) == "") {
      Transforms.setNodes(editor, {type: "p"});
      return
    }

    // If we hit enter at line, which has STYLEAFTER, split line and apply style
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

    /*
    // Don't remove scene, if it is the first one after part break
    if(node.type === "scene") {
      const prev = Editor.previous(editor, {at: path})
      if(prev && prev[0].type === "part") {
        const next = Editor.next(editor, {at: path})
        if(!next || next[0].type === "scene") return deleteBackward(...args)
        return
      }
    }
    */

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

  editor.normalizeNode = (entry)=> {
    const [node, path] = entry

    // When argument is whole editor (all blocks)
    if(path.length > 0) return normalizeNode(entry);

    //console.log("Path/Node:", path, node)

    const blocks = Editor.nodes(editor, {
      at: [],
      match: (node, path) => !Editor.isEditor(node) && Element.isElement(node),
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
// Ensure, that:
// 1) Top level is formed from parts
// 2) Parts are formed from: (1) heading, and (2) list of scenes
// 3) Scenes have heading at front
//-----------------------------------------------------------------------------

function withFixNesting(editor) {

  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry

    if(path.length) return normalizeNode(entry)

    //console.log("FixNesting")

    Editor.withoutNormalizing(editor, () => {
      while(!checkIntegrity());
    })
    return normalizeNode(entry)
  }

  return editor

  function checkIntegrity() {
    //-------------------------------------------------------------------------
    // Check parts
    //-------------------------------------------------------------------------

    for(const [i, part] of editor.children.entries()) {
      const partpath = [i]
      //console.log(partpath, part)

      switch(part.type) {
        case "part": {
          if(part.children[0].type !== "hpart") {
            if(i === 0) {
              if(!part.children.length) {
                console.log("insertNode[hpart]")
                Transforms.insertNodes(editor, {type: "hpart", children: [{text:""}]}, {at: [...partpath, 0]})
                return false
              }
              console.log("setNodes[hpart]:", part.children[0])
              Transforms.setNodes(editor, {type: "hpart"}, {at: [...partpath, 0]})
              return false
            }
            else if(canMerge("part", partpath)) {
              console.log("Merge:", part)
              mergeBlock("part", partpath)
              return false
            }
          }
          break;
        }
        default: {
          console.log("Wrap[part]:", part)
          wrapBlock("part", partpath)
          return false
        }
      }

      //-----------------------------------------------------------------------
      // Check scenes in parts
      //-----------------------------------------------------------------------
      for(const [i, scene] of part.children.entries()) {
        if(i === 0 && scene.type === "hpart") continue
        const scenepath = [...partpath, i]
        //console.log(scenepath, scene)

        switch(scene.type) {
          case "scene": {
            if(i === 1) {
              if(!scene.children.length) {
                console.log("insertNode[hscene]")
                Transforms.insertNodes(editor, {type: "hscene", children: [{text:""}]}, {at: [...scenepath, 0]})
                return false
              }
              else if(scene.children[0].type !== "hscene") {
                console.log("setNodes[hscene]:", scene.children[0])
                Transforms.setNodes(editor, {type: "hscene"}, {at: [...scenepath, 0]})
                return false
              }
            } else {
              if(!scene.children.length || scene.children[0].type !== "hscene") {
                if(canMerge("scene", scenepath)) {
                  console.log("Merge:", scene)
                  mergeBlock("scene", scenepath)
                  return false
                }
              }
            }
            break;
          }
          case "hpart": {
            console.log("Wrap & Lift[part]:", scene)
            wrapLiftBlock("part", scenepath, scenepath)
            return false
          }
          default: {
            console.log("Wrap[scene]:", scene)
            wrapBlock("scene", scenepath)
            return false
          }
        }

        //---------------------------------------------------------------------
        // Check paragraphs in scenes
        //---------------------------------------------------------------------

        for(const [i, para] of scene.children.entries()) {
          if(i === 0 && para.type === "hscene") continue
          const parapath = [...scenepath, i]
          //console.log(parapath, para)

          switch(para.type) {
            case "hscene": {
              console.log("Wrap & Lift:", para)
              wrapLiftBlock("scene", parapath, scenepath)
              return false
            }
            case "hpart": {
              console.log("Lift:", para)
              liftBlock(parapath);
              return false
            }
          }
        }
      }
    }
    return true;
  }

  function liftBlock(at) {
    Transforms.liftNodes(editor, {at})
  }

  function wrapBlock(type, at) {
    Transforms.wrapNodes(editor, {type}, {at})
  }

  function wrapLiftBlock(type, start, end) {
    const at = { anchor: Editor.start(editor, start), focus: Editor.end(editor, end)}
    Transforms.wrapNodes(editor, {type}, {at})
    Transforms.liftNodes(editor, {at: start})
  }

  function canMerge(type, at) {
    const prev = Editor.previous(editor, {at})
    return prev && prev[0].type === type
  }

  function mergeBlock(type, at) {
    Transforms.mergeNodes(editor, {at})
  }
}

//*****************************************************************************
//
// Doc --> Slate
//
//*****************************************************************************

export function section2edit(section) {
  //console.log(section)
  //return section2flat(section).map(elem2edit)

  return section.parts.map(part2edit)

  function part2edit(part) {
    const {children, type, id, name} = part
    return {
      type: "part",
      id,
      children: [
        {type: "hpart", id: nanoid(), children: [{text: name ?? ""}]},
        ...children.map(scene2edit)
      ],
    }
  }

  function scene2edit(scene) {
    const {type, id, name, children} = scene
    return {
      type: "scene",
      id,
      children: [
        {type: "hscene", id: nanoid(), children: [{text: name ?? ""}]},
        ...children.map(elem2edit)
      ]
    }
  }

  function elem2edit(elem) {
    const {type, id, children} = elem;

    switch(type) {
      case "br": return {
        type: "p",
        id,
        children
      }
    }
    return {
      type,
      id,
      children
    }
  }
}

//*****************************************************************************
//
// Slate --> Doc
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Update parts & scenes: To make index rendering faster, we preserve the
// doc elements whenever possible. Also, during the update we refresh the
// word counts so that there is no need to recalculate them before rendering
// index.
//-----------------------------------------------------------------------------

export function updateSection(buffer, section) {

  //console.log("Update section")

  const lookup = section ? section2lookup(section) : {}
  //console.log(lookup)

  //console.log(buffer)

  const updated = buffer.map(part => edit2part(part, lookup))
  const isClean = cmpList(updated, section.parts)

  if(isClean) return section

  return {
    ...section,
    parts: updated,
    words: wcElem({type: "sect", children: updated})
  }
}

function edit2part(part, lookup) {
  //console.log(part)

  const {id, children} = part

  const [head, ...scenes] = children

  //console.log("Head", head, "Scenes:", scenes)

  return checkClean({
    type: "part",
    id,
    name: Node.string(head),
    children: scenes.map(scene => edit2scene(scene, lookup)),
  }, lookup)
}

// Update scene

function edit2scene(scene, lookup) {
  const {id, children} = scene
  const [head, ...paragraphs] = children

  //console.log("Head", head, "Paragraphs:", paragraphs)

  return checkClean({
    type: "scene",
    id,
    name: Node.string(head),
    children: paragraphs.map(p => edit2paragraph(p, lookup))
  }, lookup)
}

// Update paragraph

function edit2paragraph(elem, lookup) {

  const {id, type} = elem
  const text = Node.string(elem)

  //console.log(elem)

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