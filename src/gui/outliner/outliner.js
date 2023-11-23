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

  return <div style={{overflow: "auto"}}>
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
    {/*!part.folded &&*/ part.children.map(scene => <SceneItem key={scene.id} scene={scene}/>)}
  </div>
}

//-----------------------------------------------------------------------------

function SceneItem({scene}) {
  return <div style={styles.scene}>
    <Label>Scene: {scene.name}</Label>
    {/*!scene.folded &&*/ <SplitBlock paragraphs={scene.children}/>}
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
    <SynopsisBlock paragraphs={synopsis}/>
    {/* <ContentBlock paragraphs={content}/> */}
  </HBox>
}

function SynopsisBlock({paragraphs}) {
  return <ParaBlock style={styles.synopsisblock} paragraphs={paragraphs}/>
}

function ContentBlock({paragraphs}) {
  return <ParaBlock paragraphs={paragraphs}/>
}

function ParaBlock({style, paragraphs}) {
  return <div className="Sheet" style={{...styles.parablock, ...style}}>
    {paragraphs.map(p => <Paragraph key={p.id} type={p.type} text={elemAsText(p)}/>)}
  </div>
}

function Paragraph({type, text}) {
  switch(type) {
    case "missing":
    case "comment":
      return <p className={type}>{text}</p>
    default: break;
  }
  return <p>{text}</p>
}
