//*****************************************************************************
//*****************************************************************************
//
// Slate customizations
//
//*****************************************************************************
//*****************************************************************************

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Slate, useSlate, Editable, withReact, ReactEditor } from 'slate-react'
import {
  Editor, Node,
  Transforms,
  Range,
  Point,
  createEditor,
  Descendant,
} from 'slate'

import { withHistory } from "slate-history"
import { addClass, Icon } from '../common/factory';
import { uuid, nanoid, splitByLeadingElem } from '../../util';

//-----------------------------------------------------------------------------

export function elem2text(block) {
  return Node.string(block)
    .replace(/\s+/g, ' ')
    .trim()
}

function elemLeader(elem) {
  return elem2text(elem).split(/[.:?!]/gu, 1)[0]
}

//*****************************************************************************
//
// Rendering
//
//*****************************************************************************

export function SlateEditable({className, ...props}) {
  //const renderElement = useCallback(props => <Element {...props} />, [])
  //const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  return <Editable
    className={addClass(className, "Sheet")}
    autoFocus
    spellCheck={false} // Keep false until you find out how to change language
    renderElement={Element}
    renderLeaf={Leaf}
    {...props}
  />
}

function Element({element, attributes, ...props}) {

  switch (element.type) {
    case "title": return <h1 {...attributes} {...props}/>

    case "br.part": return <h2 {...attributes} {...props}/>
    case "br.scene": return <h3 {...attributes} {...props}/>

    /*
    case "part": return <div className="part">{children}</div>
    case "scene": return <div className="scene">{children}</div>

    case "float": return (
      <p className="FloatHandle">
        <Icon.PaperClipHoriz style={{fontsize: "14pt", color: "green"}}/>
        <div contenteditable="false" className="FloatContent comment">{elem2text(element)}</div>
      </p>
    )
    */
    case "comment":
    case "missing":
    case "synopsis":
      return <p className={element.type} {...attributes} {...props}/>

    case "p":
    default:
      if (elem2text(element) === "") {
        return <div className="emptyline" {...attributes} {...props}/>
      }
      return <p {...attributes} {...props}/>
  }
}

function Leaf({ leaf, attributes, ...props }) {
  return <span {...attributes} {...props}/>
}

//*****************************************************************************
//
// Editor customizations
//
//*****************************************************************************

export function getEditor() {
  const editor = withHistory(withReact(createEditor()))

  //---------------------------------------------------------------------------
  // Extra services

  //---------------------------------------------------------------------------

  /*
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry

    //console.log("Node/path:", node, path)

    return normalizeNode(entry)
  }
  */

  //---------------------------------------------------------------------------

  /*
  const { isVoid } = editor;

  editor.isVoid = element => {
    switch (element.type) {
      case "br": return true;
    }
    return isVoid(element)
  }
  */

  //---------------------------------------------------------------------------
  // Take care of element IDs

  const {apply} = editor;

  editor.apply = (operation) => {
    //console.log("Apply:", operation)
    switch(operation.type) {
      case "insert_node": {
        const node = { ...operation.node, id: nanoid() }
        return apply({...operation, node})
      }
      case "split_node": {
        const properties = { ...operation.properties, id: operation.properties.id && nanoid() }
        return apply({...operation, properties})
      }
      default: break;
    }
    return apply(operation);
  }

  //---------------------------------------------------------------------------

  const STYLEAFTER = {
    "title": "br.part",
    "br.part": "br.scene",
    "br.scene": "p",
    "synopsis": "p",
  }

  const RESETEMPTY = [
    "comment",
    "missing",
  ]

  const { insertBreak } = editor

  editor.insertBreak = () => {
    const { selection } = editor

    if (selection) {
      const [match] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          Editor.isBlock(editor, n)
      })

      if (match) {
        const [node, path] = match

        //console.log("Node:", node)

        if(node.type in STYLEAFTER) {
          const newtype = STYLEAFTER[node.type]
          Transforms.splitNodes(editor, {always: true})
          Transforms.setNodes(editor, {type: newtype})
          return
        }
        if(RESETEMPTY.includes(node.type) && Node.string(node) == "") {
          Transforms.setNodes(editor, {type: "p"});
          return
        }
      }
    }
    insertBreak()
  }

  //---------------------------------------------------------------------------

  const SHORTCUTS = {
    '** ': {type: "br.part"},
    '## ': {type: "br.scene"},
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

    if (selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const node = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })
      const path = node ? node[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const key = Editor.string(editor, range) + text

      if(key in SHORTCUTS) {
        Transforms.select(editor, range)
        Transforms.delete(editor)
        Transforms.setNodes(editor, SHORTCUTS[key])
        return
      }
    }

    insertText(text)
  }

  //---------------------------------------------------------------------------
  // Backspace at the start of line resets formatting

  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })

      if (match) {
        const [node, path] = match
        const start = Editor.start(editor, path)

        //console.log("Node:", node)

        if (
          !Editor.isEditor(node) &&
          Editor.isBlock(editor, node) &&
          node.type !== 'p' &&
          Point.equals(selection.anchor, start)
        ) {
          //console.log(block.type)
          Transforms.setNodes(editor, {type: 'p'})

          return
        }
      }
    }
    deleteBackward(...args)
  }

  return editor
}

//*****************************************************************************
//
// Doc --> Slate
//
//*****************************************************************************

function createElement({ type, id, attributes, children }) {
  return {
    type,
    id: id ?? nanoid(),
    attributes,
    children
  }
}

//-----------------------------------------------------------------------------

export function section2edit(section) {
  const head = Head2Slate(section.head);
  const body = Section2Slate(section.parts);

  return [...head, ...body]

  function Head2Slate(head) {
    if(!head) return []
    if(head.title) return [
      createElement({ type: "title", children: [{ text: head.title }] }),
    ]
    return []
  }

  function Section2Slate(parts) {
    const content = parts.map(Part2Slate).flat(1)
    if(!content.length) return [createElement({type: "p", children: [{text: ""}]})]
    return content;
  }

  function Part2Slate(part, index) {
    const name = part.name ?? ""
    const head = createElement({
      type: "br.part",
      id: part.id,
      children: [{ text: name }]
    })

    const scenes = part.children.map(Scene2Slate).flat(1)
    //const content = (index === 0 && name === "") ? scenes : [head, ...scenes]
    //return content
    return [head, ...scenes]
  }

  function Scene2Slate(scene, index) {
    const name = scene.name ?? ""
    const {id, attributes} = scene

    const head = createElement({
      type: "br.scene",
      id,
      attributes,
      children: [{ text: name }]
    })

    const para = scene.children.map(Paragraph2Slate)
    //const content = (index === 0 && name === "") ? para : [head, ...para]
    //return content
    return [head, ...para]
  }

  function Paragraph2Slate(p) {
    const {type, id} = p;
    return createElement({
      type: type === "br" ? "p" : type,
      id,
      children: [
        {
          text: p.children ? p.children.map(e => e.text).join(" ") : ""
        }
      ]
    })
  }
}

//*****************************************************************************
//
// Slate --> Doc
//
//*****************************************************************************

export function edit2section(content) {
  const [head, parts] = getHead()
  return {
    type: "sect",
    head: {},
    parts: splitByLeadingElem(parts, isPartBreak)
      .filter(p => p.length)
      .map(elems => edit2part(elems))
  }

  function getHead() {
    return [
      content.filter(elem => isHeadElement(elem)),
      content.filter(elem => !isHeadElement(elem))
    ]
  }
}

function isHeadElement(elem) {
  return [
    "title",
  ].includes(elem.type)
}

function isPartBreak(elem) {
  return elem.type === "br.part"
}

function isSceneBreak(elem) {
  return elem.type === "br.scene"
}

export function edit2part(content) {
  const [head, scenes] = getHead()
  return {
    type: "part",
    name: elem2text(head),
    id: head.id,
    children: splitByLeadingElem(scenes, isSceneBreak)
      .filter(s => s.length)
      .map(elems => edit2scene(elems)),
  }

  function getHead() {
    if (isPartBreak(content[0])) {
      return [content[0], content.slice(1)]
    }
    return [
      createElement({ type: "br.part", children: [{ text: "<Unnamed>" }] }),
      content,
    ]
  }
}

export function edit2scene(content) {
  const [head, paragraphs] = getHead()
  const name = elem2text(head)
  const {id, attributes} = head;

  return {
    type: "scene",
    name,
    id,
    attributes,
    children: paragraphs.map(elem => getParagraph(elem))
  }

  function getHead() {
    if (isSceneBreak(content[0])) {
      return [content[0], content.slice(1)]
    }
    return [
      createElement({ type: "br.scene", children: [{ text: "<Unnamed>" }] }),
      content,
    ]
  }

  function getParagraph(elem) {
    const text = elem2text(elem)
    const tag = elem.type

    return {
      type: tag === "p" && text === "" ? "br" : tag,
      id: elem.id,
      children: [{
        type: "text",
        text,
      }],
    }
  }
}
