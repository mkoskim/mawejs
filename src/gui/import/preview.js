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
      <ImportIndex style={{ maxWidth: "300px", width: "300px" }} imported={imported}/>
      <div className="Filler Board">
        <div className="Sheet Regular">
          <DeferredRender>{imported.map(PreviewPart)}</DeferredRender>
          </div>
      </div>
    </>
  }
}

function PreviewPart(part) {
  return <div key={part.id}>
    {part.elements.map(PreviewScene)}
  </div>
}

function PreviewScene(scene) {
  return <div key={scene.id}>
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
  return null
}
