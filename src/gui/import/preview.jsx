//*****************************************************************************
//
// Import preview
//
//*****************************************************************************

import React from "react"
import {DeferredRender} from "../common/factory"
import {elemFind} from "../../document/xmljs/elemutil.js"
import {getStoryRoot} from "../../document/xmljs/load.js"
import { lines2text } from "../../util/generic.js"

//-----------------------------------------------------------------------------

export function Preview({imported = undefined}) {
  const flatted = React.useMemo(() => flatImported(imported), [imported])

  return <>
    <ImportIndex
      style={{minWidth: "200px", maxWidth: "300px", width: "300px"}}
      flatted={flatted}
      />
    <HTMLPreview flatted={flatted}/>
  </>
}

function flatImported(imported) {
  if(!imported) return []

  const root = getStoryRoot(imported)
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

function HTMLPreview({flatted}) {
  const __html = lines2text(flatted.map(elem2html))

  return <div className="Filler Board Preview">
      <div
        className="Filler Board Editor"
        //id="ImportPreview"
        style={{borderRight: "1px solid lightgray", borderLeft: "1px solid lightgray", overflowY: "auto"}}
        tabIndex={0}
      >
        <DeferredRender>
        <div className="Sheet Regular"
          dangerouslySetInnerHTML={{__html}}
        />
        </DeferredRender>
      </div>
  </div>

  function elem2html(elem) {
    switch(elem.name) {
      case "act": return `<h2>${elem.attributes.name}</h2>`
      case "chapter": return `<h3>${elem.attributes.name}</h3>`
      case "scene": return `<h4>${elem.attributes.name}</h4>`
      case "p": {
        const text = elem.elements.map(n => n.text).join(" ")
        return `<p>${text}<span style={{marginLeft: "2pt", color: "grey"}}>&para;</span></p>`
      }
      default: return null
    }
  }
}

/*
const previewChunk = 100

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
    case "act": return <h2 key={index}>{elem.attributes.name}</h2>
    case "chapter": return <h3 key={index}>{elem.attributes.name}</h3>
    case "scene": return <h4 key={index}>{elem.attributes.name}</h4>
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
*/

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
