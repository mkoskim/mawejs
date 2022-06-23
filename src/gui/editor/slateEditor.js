//*****************************************************************************
//*****************************************************************************
//
// Slate as editor component
//
//*****************************************************************************
//*****************************************************************************

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Slate, Editable, withReact } from 'slate-react'
import {
  Editor,
  Transforms,
  Range,
  Point,
  createEditor,
  Element as SlateElement,
  Descendant,
} from 'slate'

import { withHistory } from "slate-history"
import { Icon } from '../common/factory';
import { uuid } from '../../util';

//-----------------------------------------------------------------------------

export function elem2text(block) {
  return block.children
    //.map(elem => elem.children).flat(1)
    .map(elem => elem.text)
    .join(" ")
    .replace(/\s+/g, ' ').trim()
}

export function RenderPlain({ content }) {
}

export function Element(props) {
  const { element, attributes, children } = props;

  function Linked(props) {
    return <a id={`${element.attributes.id}`} {...props}/>
  }

  switch (element.type) {
    case "title": return <h1 {...attributes}>{children}</h1>
    case "br.part": return <h2 {...attributes}>{children}</h2>
    case "br.scene": return <Linked><h3 {...attributes}>{children}</h3></Linked>
    case "part": return <div className="part">{children}</div>
    case "scene": return <div className="scene">{children}</div>
    /*
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
      return <Linked><p className={element.type} {...attributes}>{children}</p></Linked>

    case "p":
    default:
      if(elem2text(element) === "") {
        return <div className="emptyline" {...attributes}>{children}</div>
      }
      return <p {...attributes}>{children}</p>
  }
}

export function Leaf({ leaf, attributes, children }) {
  return <span {...attributes}>{children}</span>
}

//-----------------------------------------------------------------------------

function createElement({ type, attributes, children }) {
  switch (type) {
    case "br.scene":
    case "br.part":
    case "synopsis":
    case "comment":
    case "missing": return {
      type,
      attributes: { id: uuid(), ...attributes },
      children
    }
  }
  return {
    type,
    attributes,
    children
  }
}

//-----------------------------------------------------------------------------

export function section2edit(doc) {
  const head = Head2Slate(doc.story);
  const body = Section2Slate(doc.story.body);
  const notes = Section2Slate(doc.story.notes);

  return {
    body: [head, ...body].flat(1),
    notes: notes,
  }

  function Head2Slate(story) {
    return [
      createElement({ type: "title", children: [{ text: story.body.head?.title ?? "" }] }),
    ]
  }

  function Section2Slate(section) {
    const num = section.parts.length;

    return section.parts.map(part => Part2Slate(part, num))

    //.concat([{type: "p", children: [{text: ""}]}])
  }

  function Part2Slate(part, num_parts) {
    // Part support disabled
    /*
    const hasname = part.attr.name
    const head = {
      type: "br.part",
      children: [{ text: part.attr.name ?? "" }]
    }
    const num_scenes = part.children.length
    const scenes = part.children.map(scene => Scene2Slate(scene, num_scenes)).flat(1)
    const content = (hasname || num_parts > 1) ? [head, ...scenes] : scenes
    */
    const content = part.children.map(scene => Scene2Slate(scene)).flat(1)

    /*
    return {
      type: "part",
      attributes: { id: part.id },
      children: content
    }
    /*/
    return content
    /**/
  }

  function Scene2Slate(scene) {
    const hasname = scene.attr.name
    const head = createElement({
      type: "br.scene",
      children: [{ text: scene.attr.name ?? "" }]
    })
    const para = scene.children.map(Paragraph2Slate)
    const content = [head, ...para]

    /*
    return {
      type: "scene",
      attributes: { id: scene.id },
      children: content
    }
    /*/
    return content
    /**/
  }

  function Paragraph2Slate(p) {
    const type = p.tag;
    return createElement({
      type: type == "br" ? "p" : type,
      children: [{ text: p.text ?? "" }]
    })
  }
}

/*
function getinfo(content) {
  const parts = content
    .filter(elem => elem.type === "part")
    .map(partinfo)

  return {
    parts: parts.map(part => ({
      id: part.id,
      name: part.name,
      summary: part.summary,
    })),
    //...summary(parts.map(part => part.summary)),
    parts,
  }

  function partinfo(part) {
    const childs = part.children
    const head = childs.find(elem => elem.type === "br.part")
    const scenes = childs
      .filter(elem => elem.type === "scene")
      .map(sceneinfo)

    return {
      id: part.attributes.id,
      name: elem2text([head]),
      scenes: scenes.map(scene => ({
        id: scene.id,
        name: scene.name,
        words: {
          words: scene.words.n_words,
          missing: scene.missing.n_words,
          comment: scene.comment.n_words,
        }
      })),
      summary: scene_summary(scenes.map(scene => scene.words)),
    }
  }

  function scene_summary(info) {
    return info.reduce((a, b) => ({
      n_chars: a.n_chars + b.n_chars,
      n_words: a.n_words + b.n_words,
      words: a.words.concat(b.words),
    }), { n_chars: 0, n_words: 0, words: [] })
  }

  function sceneinfo(scene) {
    const childs = scene.children
    const head = childs.find(elem => elem.type === "br.scene")
    const p = childs.filter(elem => elem.type === "p")
    const missing = childs.filter(elem => elem.type === "missing")
    const comment = childs.filter(elem => elem.type === "comment")

    return {
      id: scene.attributes.id,
      name: elem2text([head]),
      words: parainfo(p),
      missing: parainfo(missing),
      comment: parainfo(comment),
    }
  }

  function parainfo(list) {
    const text = elem2text(list)
    const words = text.match(/\w+/gu)
    return {
      n_chars: text ? text.length : 0,
      n_words: words ? words.length : 0,
      words: words ? words : [],
    }
  }
}
*/

//-----------------------------------------------------------------------------
// Editor customizations

export function getEditor() {
  const editor = withHistory(withReact(createEditor()))

  //---------------------------------------------------------------------------

  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry

    //console.log("Node/path:", node, path)

    return normalizeNode(entry)
  }

  //---------------------------------------------------------------------------

  const { isVoid } = editor;

  editor.isVoid = element => {
    switch (element.type) {
      case "br": return true;
    }
    return isVoid(element)
  }

  //---------------------------------------------------------------------------

  const STYLESAFTER = {
    "title": "p",
    "br.scene": "p",
    "br.part": "p",
  }

  const { insertBreak } = editor

  editor.insertBreak = () => {
    const { selection } = editor

    /*
    if (selection) {
      const [node] = Editor.previous(editor, {
        match: n =>
          Editor.isBlock(n)
          //!Editor.isEditor(n) &&
          //Element.isElement(n) &&
      })
      console.log("Node=", node)
      if(node && node.type === "br") return;
    }
    */

    if (selection) {
      const [node] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          Editor.isBlock(n) &&
          (n.type in STYLESAFTER)
      })

      if (node) {
        Transforms.insertNodes(editor, createElement({
          type: STYLESAFTER[node.type],
          children: [{ text: "" }],
        }))
        return
      }
    }
    insertBreak()
  }

  //---------------------------------------------------------------------------

  const SHORTCUTS = {
    '##': "br.scene",
    '//': 'comment',
    '!!': 'missing',
    '>>': "synopsis",
  }

  const { insertText } = editor

  editor.insertText = text => {
    const { selection } = editor

    //if (text === ' ' && selection && Range.isCollapsed(selection)) {
    if (selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range)
      const type = SHORTCUTS[beforeText + text]

      if (type) {
        Transforms.select(editor, range)
        Transforms.delete(editor)
        const newProperties = createElement({
          type,
        })
        Transforms.setNodes(editor, newProperties, {
          match: n => Editor.isBlock(editor, n),
        })

        return
      }
    }

    insertText(text)
  }

  //---------------------------------------------------------------------------

  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })

      if (match) {
        const [block, path] = match
        const start = Editor.start(editor, path)

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== 'p' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties = {
            type: 'p',
          }
          Transforms.setNodes(editor, newProperties)

          return
        }
      }

      deleteBackward(...args)
    }
  }

  return editor
}

//-----------------------------------------------------------------------------

export function SlateEdit({ editor, className, content, setContent, ...props }) {

  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  return (
    <Slate
      editor={editor}
      value={content}
      onChange={setContent}
    >
      <Editable
        className={className}
        autoFocus
        spellCheck={false} // Keep false until you find out how to change language
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        {...props}
      />
    </Slate>
  )

  function onChange(content) {
    console.log(editor.selection)
    setContent(content)
  }
}
