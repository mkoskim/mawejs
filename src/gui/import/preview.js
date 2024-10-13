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
        imported={imported}/>
      <div className="Filler Board"
        style={{borderRight: "1px solid lightgray", borderLeft: "1px solid lightgray"}}
        >
        <div className="Sheet Regular">
          <DeferredRender>{imported.map(PreviewAct)}</DeferredRender>
          </div>
      </div>
    </>
  }
}

function PreviewAct(act) {
  return <div className="chapter" key={act.id}>
    <h4>{act.attributes.name}</h4>
    {act.elements.map(PreviewChapter)}
  </div>
}


function PreviewChapter(chapter) {
  return <div className="chapter" key={chapter.id}>
    <h5>{chapter.attributes.name}</h5>
    {chapter.elements.map(PreviewScene)}
  </div>
}

function PreviewScene(scene) {
  return <div className="scene" key={scene.id}>
    <h6>{scene.attributes.name}</h6>
    {scene.elements.map(PreviewParagraph)}
  </div>
}

function PreviewParagraph(p) {
  const text = p.elements.map(n => n.text).join(" ")
  return <p key={p.id}>
    {text}
    <span style={{marginLeft: "2pt", color: "grey"}}>&para;</span>
  </p>
}

function ImportIndex({imported}) {
  return <div className="TOC" style={{maxWidth: "300px"}}>
    <DeferredRender>{imported.map(actIndex)}</DeferredRender>
  </div>

  function actIndex(act) {
    return <div key={act.id} className="Act">
      <div className="Entry ActName"><p className="Name">{act.attributes.name}</p></div>
      {act.elements.map(chapterIndex)}
    </div>
  }

  function chapterIndex(chapter) {
    return <div key={chapter.id} className="Chapter">
      <div className="Entry ChapterName"><p className="Name">{chapter.attributes.name}</p></div>
      {chapter.elements.map(sceneIndex)}
    </div>
  }

  function sceneIndex(scene) {
    return <div key={scene.id} className="Entry SceneName"><p className="Name">{scene.attributes.name}</p></div>
  }
}
