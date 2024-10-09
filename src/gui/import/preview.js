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
  return <div className="part" key={part.id}>
    <h5>{part.attributes.name}</h5>
    {part.elements.map(PreviewScene)}
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
    {imported.map(partIndex)}
  </div>

  function partIndex(part) {
    return <div key={part.id} className="Part">
      <div className="Entry PartName"><p className="Name">{part.attributes.name}</p></div>
      {part.elements.map(sceneIndex)}
    </div>
  }

  function sceneIndex(scene) {
    return <div key={scene.id} className="Entry SceneName"><p className="Name">{scene.attributes.name}</p></div>
  }
}
