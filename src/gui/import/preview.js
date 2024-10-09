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

    return <DeferredRender>
      <div className="Filler Board">
        <div className="Sheet Regular">
          {imported.map(PreviewPart)}
          </div>
      </div>
      <ImportIndex style={{ maxWidth: "300px", width: "300px" }} imported={imported}/>
    </DeferredRender>
  }
}

function PreviewPart(part) {
  return <div class="part">
    <h5 key={part.id}>{part.attributes.name}</h5>
    {part.elements.map(PreviewScene)}
  </div>
}

function PreviewScene(scene) {
  return <div class="scene">
    <h6 key={scene.id}>{scene.attributes.name}</h6>
    {scene.elements.map(PreviewParagraph)}
  </div>
}

function PreviewParagraph(p) {
  return <p key={p.id}>
    {p.elements.map(n => n.text).join(" ")}
    <span style={{marginLeft: "2pt", color: "grey"}}>&para;</span>
  </p>
}

function ImportIndex({imported}) {
  return <div className="TOC" style={{maxWidth: "300px"}}>
    {imported.map(partIndex)}
  </div>

  function partIndex(part) {
    return <>
      <div className="Entry PartName" key={part.id}><p className="Name">{part.attributes.name}</p></div>
      {part.elements.map(sceneIndex)}
    </>
  }

  function sceneIndex(scene) {
    return <div className="Entry SceneName" key={scene.id}><p className="Name">{scene.attributes.name}</p></div>
  }
}
