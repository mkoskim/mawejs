//*****************************************************************************
//
// Import preview
//
//*****************************************************************************

import React from "react"
import { DeferredRender } from "../common/factory"

//-----------------------------------------------------------------------------

export class Preview extends React.PureComponent {
  render() {
    const {imported} = this.props

    if(!imported) return null

    return <>
      <ImportIndex
        style={{minWidth: "200px", maxWidth: "300px", width: "300px"}}
        imported={imported}
        />
      <div className="Filler Board Editor"
        style={{borderRight: "1px solid lightgray", borderLeft: "1px solid lightgray"}}
        tabIndex={0}
        >
        <div className="Sheet Regular">
          <DeferredRender>{imported.map(PreviewAct)}</DeferredRender>
          </div>
      </div>
    </>
  }
}

function PreviewAct(act, index) {
  return <div className="chapter" key={index}>
    <h4>{act.attributes.name}</h4>
    {act.elements.map(PreviewChapter)}
  </div>
}


function PreviewChapter(chapter, index) {
  return <div className="chapter" key={index}>
    <h5>{chapter.attributes.name}</h5>
    {chapter.elements.map(PreviewScene)}
  </div>
}

function PreviewScene(scene, index) {
  return <div className="scene" key={index}>
    <h6>{scene.attributes.name}</h6>
    {scene.elements.map(PreviewParagraph)}
  </div>
}

function PreviewParagraph(p, index) {
  const text = p.elements.map(n => n.text).join(" ")
  return <p key={index}>
    {text}
    <span style={{marginLeft: "2pt", color: "grey"}}>&para;</span>
  </p>
}

function ImportIndex({imported}) {
  return <div className="TOC" style={{maxWidth: "300px"}}>
    <DeferredRender>{imported.map(actIndex)}</DeferredRender>
  </div>

  function actIndex(act, index) {
    return <div key={index} className="Act">
      <div className="Entry ActName"><div className="Name">{act.attributes.name}</div></div>
      {act.elements.map(chapterIndex)}
    </div>
  }

  function chapterIndex(chapter, index) {
    return <div key={index} className="Chapter">
      <div className="Entry ChapterName"><div className="Name">{chapter.attributes.name}</div></div>
      {chapter.elements.map(sceneIndex)}
    </div>
  }

  function sceneIndex(scene, index) {
    return <div key={index} className="Entry SceneName"><div className="Name">{scene.attributes.name}</div></div>
  }
}
