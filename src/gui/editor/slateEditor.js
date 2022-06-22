//*****************************************************************************
//*****************************************************************************
//
// Slate as editor component
//
//*****************************************************************************
//*****************************************************************************

import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { Slate, Editable, withReact, DefaultPlaceholder } from 'slate-react'
import { createEditor } from "slate"
import { withHistory } from "slate-history"

//-----------------------------------------------------------------------------

export function SlateEdit({content, setContent, refresh, ...props}) {
  const editor = useMemo(() => getEditor(), [])
  //const [editor] = useState(() => withReact(withHistory(createEditor())))

  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  return (
    <Slate
      editor={editor}
      value={content}
      onChange={setContent}
      >
    <Editable
      className="Sheet Shadow"
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

//-----------------------------------------------------------------------------

function getEditor() {
  const editor = withHistory(withReact(createEditor()))

  const {normalizeNode} = editor
  editor.normalizeNode = entry => {
    const [node, path] = entry

    //console.log("Node/path:", node, path)

    return normalizeNode(entry)
  }

  return editor
}

//-----------------------------------------------------------------------------

export function renderPlain({content}) {
}

export function Element({element, attributes, children}) {
  switch(element.type) {
    case "title": return <h1 {...attributes}>{children}</h1>
    case "br.part": return <h2 {...attributes}>{children}</h2>
    case "br.scene": return <h3 {...attributes}>{children}</h3>
    case "part": return <div className="part">{children}</div>
    case "scene": return <div className="scene">{children}</div>
    case "br": return <br {...attributes}/>
    case "missing":
    case "comment":
    case "synopsis":
      return <p className={element.type} {...attributes}>{children}</p>
    default: return <p {...attributes}>{children}</p>
  }
}

export function Leaf({leaf, attributes, children}) {
  return <span {...attributes}>{children}</span>
}

//-----------------------------------------------------------------------------

export function deserialize(doc) {
  const head = Head2Slate(doc.story);
  const body = Section2Slate(doc.story.body);
  const notes = Section2Slate(doc.story.notes);

  return {
    body: head.concat(body),
    notes: notes,
  }

  function Head2Slate(story) {
    return [
      { type: "title", children: [{text: story.body.head?.title ?? ""}] },
    ]
  }

  function Section2Slate(section) {
    const num = section.parts.length;

    return section.parts.map(part => Part2Slate(part, num))

    //.concat([{type: "p", children: [{text: ""}]}])
  }

  function Part2Slate(part, num_parts) {
    const hasname = part.attr.name
    const head = {
      type: "br.part",
      children: [{text: part.attr.name ?? ""}]
    }
    const num_scenes = part.children.length
    const scenes = part.children.map(scene => Scene2Slate(scene, num_scenes)).flat(1)
    const content = (hasname || num_parts > 1) ? [head, ...scenes] : scenes

    return {
      type: "part",
      attributes: { id: part.id },
      children: content
    }
  }

  function Scene2Slate(scene, num_scenes) {
    const hasname = scene.attr.name
    const head = {
      type: "br.scene",
      children: [{text: scene.attr.name ?? ""}]
    }
    const para = scene.children.map(Paragraph2Slate)
    const content = (hasname || num_scenes > 1) ? [head, ...para] : para

    return {
      type: "scene",
      attributes: { id: scene.id },
      children: content
    }
  }

  function Paragraph2Slate(p) {
    const type = p.tag;
    return {
      type: type,
      children: [{ text: p.text ?? ""}]
    }
  }
}
