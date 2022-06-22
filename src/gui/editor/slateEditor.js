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
import { Icon } from '../common/factory';

//-----------------------------------------------------------------------------

function elem2text(block) {
  return block.children
    //.map(elem => elem.children).flat(1)
    .map(elem => elem.text)
    .join(" ")
    .replace(/\s+/g, ' ').trim()
}

export function renderPlain({content}) {
}

export function Element(props) {
  const {element, attributes, children} = props;

  switch(element.type) {
    case "title": return <h1 {...attributes}>{children}</h1>
    case "br.part": return <h2 {...attributes}>{children}</h2>
    case "br.scene": return <h3 {...attributes}>{children}</h3>
    case "part": return <div className="part">{children}</div>
    case "scene": return <div className="scene">{children}</div>
    case "br": return <br {...attributes}/>
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
      return <p className={element.type} {...attributes}>{children}</p>
    default: return <p {...attributes}>{children}</p>
  }
}

export function Leaf({leaf, attributes, children}) {
  return <span {...attributes}>{children}</span>
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

  function Scene2Slate(scene, num_scenes) {
    const hasname = scene.attr.name
    const head = {
      type: "br.scene",
      children: [{text: scene.attr.name ?? ""}]
    }
    const para = scene.children.map(Paragraph2Slate)
    const content = (hasname || num_scenes > 1) ? [head, ...para] : para

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
    return {
      type: type,
      children: [{ text: p.text ?? ""}]
    }
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

function getEditor() {
  const editor = withHistory(withReact(createEditor()))

  const {normalizeNode, isVoid} = editor

  editor.normalizeNode = entry => {
    const [node, path] = entry

    //console.log("Node/path:", node, path)

    return normalizeNode(entry)
  }

  editor.isVoid = element => {
    /*
    switch(element.type) {
      case "comment": return true;
    }
    */
    return isVoid(element)
  }

  return editor
}

//-----------------------------------------------------------------------------

export function SlateEdit({className, content, setContent, refresh, ...props}) {
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
