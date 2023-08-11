//*****************************************************************************
//*****************************************************************************
//
// Story outliner
//
//*****************************************************************************
//*****************************************************************************

import {elemAsText} from "../../document";
import {splitByLeadingElem} from "../../util";
import {HBox, Label} from "../common/factory";

export function Outliner({doc, setDoc}) {
  const {story} = doc
  const {body} = story

  return <div>
    {body.parts.map(part => <PartItem key={part.id} part={part}/>)}
  </div>

}

//-----------------------------------------------------------------------------

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
  },
  synopsisblock: {
    width: "400px",
    minWidth: "400px",
    maxWidth: "400px",
  }
}

//-----------------------------------------------------------------------------

function PartItem({part}) {
  return <div style={styles.part}>
    <Label>Part: {part.name}</Label>
    {part.children.map(scene => <SceneItem key={scene.id} scene={scene}/>)}
  </div>
}

//-----------------------------------------------------------------------------

function SceneItem({scene}) {
  return <div style={styles.scene}>
    <Label>Scene: {scene.name}</Label>
    <SplitBlock paragraphs={scene.children}/>
  </div>
}

//-----------------------------------------------------------------------------

function SplitBlock({paragraphs}) {
  const annotated = splitByLeadingElem(paragraphs, p => p.type === "synopsis").filter(b => b.length)

  console.log("Blocks:", annotated)
  return <>
    {annotated.map(block => <BlockWithHead block={block}/>)}
    </>
}

function BlockWithHead({block}) {

  function fetchHead(annotated) {
    const [head, ...body] = annotated
    if(head.type === "synopsis") return [[head], body]
    return [[], annotated]
  }

  const [synopsis, content] = fetchHead(block)
  //const synopses = paragraphs.filter(p => p.type === "synopsis")
  //const other = paragraphs.filter(p => p.type !== "synopsis")

  return <HBox>
    <ParaBlock style={styles.synopsisblock} paragraphs={synopsis}/>
    <ParaBlock paragraphs={content}/>
  </HBox>
}

function ParaBlock({style, paragraphs}) {
  return <div style={{...styles.parablock, ...style}}>
    {paragraphs.map(p => <p key={p.id}>{elemAsText(p)}</p>)}
  </div>
}
