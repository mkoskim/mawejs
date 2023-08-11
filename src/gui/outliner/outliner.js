//*****************************************************************************
//*****************************************************************************
//
// Story outliner
//
//*****************************************************************************
//*****************************************************************************

import {elemAsText} from "../../document";
import {Label} from "../common/factory";

export function Outliner({doc, setDoc}) {
  const {story} = doc
  const {body} = story

  return <div>
    {body.parts.map(part => <PartItem key={part.id} part={part}/>)}
  </div>

}

const styles = {
  part: {
    border: "1px dashed gray",
    margin: "4pt",
    padding: "4pt",
  },
  scene: {
    border: "1px dotted grey",
    marginTop: "4pt",
    marginBottom: "4pt",
    padding: "4pt",
  },
  parablock: {
    border: "1px dotted grey",
    marginTop: "4pt",
    marginBottom: "4pt",
    padding: "4pt",
  }
}

function PartItem({part}) {
  return <div style={styles.part}>
    <Label>Part: {part.name}</Label>
    {part.children.map(scene => <SceneItem key={scene.id} scene={scene}/>)}
  </div>
}

function SceneItem({scene}) {
  return <div style={styles.scene}>
    <Label>Scene: {scene.name}</Label>
    <ParaBlock paragraphs={scene.children}/>
  </div>
}

function ParaBlock({paragraphs}) {
  return <div style={styles.parablock}>
    {paragraphs.map(p => <p key={p.id}>{elemAsText(p)}</p>)}
  </div>
}
