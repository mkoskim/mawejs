//*****************************************************************************
//
// Import preview
//
//*****************************************************************************

import React from "react"
import { InfiniteScroll } from "../common/factory"
import { elemFind } from "../../document/xmljs/tree.js"

const previewChunk = 100

//-----------------------------------------------------------------------------

export function Preview({imported = undefined}) {
  const flatted = React.useMemo(() => flatImported(imported), [imported])

  return <>
    <ImportIndex
      style={{minWidth: "200px", maxWidth: "300px", width: "300px"}}
      flatted={flatted}
      />
    <ImportPreview flatted={flatted}/>
  </>
}

function flatImported(imported) {
  if(!imported) return []

  const root = imported.elements[0]
  const body = elemFind(root, "body")
  const result = []

  for(const act of body.elements) {
    result.push(act)
    for(const chapter of act.elements) {
      result.push(chapter)
      for(const scene of chapter.elements) {
        result.push(scene)
        for(const p of scene.elements) {
          result.push(p)
        }
      }
    }
  }
  return result
}

//-----------------------------------------------------------------------------
// Import Preview
//-----------------------------------------------------------------------------

function ImportPreview({flatted}) {
  const [count, setCount] = React.useState(previewChunk)

  React.useEffect(() => {
    setCount(previewChunk)
  }, [flatted])

  const visible = flatted.slice(0, count)

  return <div
    className="Filler Board Editor"
    id="ImportPreview"
    style={{borderRight: "1px solid lightgray", borderLeft: "1px solid lightgray", overflowY: "auto"}}
    tabIndex={0}
    >
      <div className="Sheet Regular">
        <InfiniteScroll
          scrollableTarget="ImportPreview"
          dataLength={visible.length}
          next={() => setCount(count => Math.min(count + previewChunk, flatted.length))}
          hasMore={visible.length < flatted.length}
          scrollThreshold={0.95}
          loader={null}
        >
          {visible.map(RenderElement)}
        </InfiniteScroll>
      </div>
    </div>
}

function RenderElement(elem, index) {
  switch(elem.name) {
    case "act": return <h4 key={index}>{elem.attributes.name}</h4>
    case "chapter": return <h5 key={index}>{elem.attributes.name}</h5>
    case "scene": return <h6 key={index}>{elem.attributes.name}</h6>
    case "p": return PreviewParagraph(elem, index)
    default: return null
  }
}

function PreviewParagraph(p, index) {
  const text = p.elements.map(n => n.text).join(" ")
  return <p key={index}>
    {text}
    <span style={{marginLeft: "2pt", color: "grey"}}>&para;</span>
  </p>
}

//-----------------------------------------------------------------------------
// Import Index
//-----------------------------------------------------------------------------

function ImportIndex({flatted}) {
  return <div className="TOC" style={{maxWidth: "300px"}}>
    {/*flatted.map(actIndex)}*/}
    {flatted.map(RenderIndex)}
  </div>

  function RenderIndex(elem, index) {
    switch(elem.name) {
      case "act": return actIndex(elem, index)
      case "chapter": return chapterIndex(elem, index)
      case "scene": return sceneIndex(elem, index)
      default: return null
    }
  }

  function actIndex(act, index) {
    return <div key={index} className="Entry ActName"><div className="Name">{act.attributes.name}</div></div>
  }

  function chapterIndex(chapter, index) {
    return <div key={index} className="Entry ChapterName"><div className="Name">{chapter.attributes.name}</div></div>
  }

  function sceneIndex(scene, index) {
    return <div key={index} className="Entry SceneName"><div className="Name">{scene.attributes.name}</div></div>
  }
}
