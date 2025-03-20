import React from 'react';
import {elemAsText, filterCtrlElems} from '../../document';
import { nanoid } from '../../util';
import {useImmer} from 'use-immer';
import {IsKey} from '../common/hotkeys';

//*****************************************************************************
//
// SketchView
//
//*****************************************************************************

export function SketchView({doc, setDoc}) {
  const [section, setSection] = useImmer(section2Mapped(doc.body))

  //console.log(section)
  return (
    <div className="Board Editor">
      <Editor className="Sheet Regular" sectionid="root" section={section} setSection={setSection}>

      </Editor>
    </div>
  )
}

//*****************************************************************************
//
// Make section indexed map: We want to be able to map HTML elements to
// section, so that we can track modifications.
//
//*****************************************************************************

function genId(map) {
  let id = nanoid()
  while(map[id]) id = nanoid()
  return id
}

function section2Mapped(section) {
  const map = {}

  map["root"] = {type: "sect", id: "root", children: []}

  for(const act of section.acts) {
    const actid = genId(map)
    map[actid] = {...act, id: actid, children: []}
    map["root"].children.push(actid)

    for(const chapter of filterCtrlElems(act.children)) {
      const chapterid = genId(map)
      map[chapterid] = {...chapter, id: chapterid, children: []}
      map[actid].children.push(chapterid)

      for(const scene of filterCtrlElems(chapter.children)) {
        const sceneid = genId(map)
        map[sceneid] = {...scene, id: sceneid, children: []}
        map[chapterid].children.push(sceneid)

        for(const paragraph of filterCtrlElems(scene.children)) {
          const paragraphid = genId(map)
          map[paragraphid] = {...paragraph, id: paragraphid}
          map[sceneid].children.push(paragraphid)
        }
      }
    }
  }
  return map
}

//*****************************************************************************

function isBreak(id, section) {
  if(!id) return false
  const node = section[id]
  switch(node.type) {
    case "act":
    case "chapter":
    case "scene":
      return true
  }
  return false
}

function findContainer(event, section) {
  const {view} = event.nativeEvent
  const selection = view.getSelection()

  let node = selection.focusNode
  while(node && !isBreak(node.id, section)) node = node.parentElement

  return node.id
}

function findParagraphByNode(node) {
  while(node && !node.id) node = node.parentElement

  return node
}

function findParagraphByEvent(event) {
  const {view} = event.nativeEvent
  const selection = view.getSelection()

  return findParagraphByNode(selection.focusNode)
}

//*****************************************************************************

function toggleFold(e, section, setSection) {
  //console.log("Event:", e)

  const id = findContainer(e, section)
  const elem = section[id]
  console.log(id, elem)
  setSection(draft => {
    draft[id].folded = !elem.folded
  })
}

function setType(e, section, setSection, type) {
  const id = findParagraphByEvent(e, section)
  setSection(draft => {
    draft[id].type = type
  })
}

//*****************************************************************************

class EditorObserver {
  constructor(editorElem, section, setSection) {
    this.editorElem = editorElem;
    this.section = section;
    this.setSection = setSection;
    //this.callback = callback;

    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(this.editorElem, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  handleMutations(mutations) {
    for(const mutation of mutations) {
      switch(mutation.type) {
        case "characterData":
          return this.handleCharacterData(mutation)
        default: break;
      }
      console.log(mutation)
    }
  }

  handleCharacterData(mutation) {
    console.log("Character data:", mutation)
    const {target} = mutation
    const node = findParagraphByNode(target)
    if(!node) return
    const {id} = node
    this.setSection(draft => {
      draft[id].content = target.textContent
    })
  }

  disconnect() {
    this.observer.disconnect();
  }
}

//*****************************************************************************

class Editor extends React.PureComponent {

  onKeyDown(e, section, setSection) {
    /*
    if(IsKey.AltF(e)) {
      e.preventDefault()
      //console.log("Alt-F")
      toggleFold(e, section, setSection)
      return
    }
    */
    if(IsKey.CtrlAlt0(e)) {
      e.preventDefault()
      setType(e, section, setSection, "p")
      return
    }
    if(IsKey.CtrlAltM(e)) {
      e.preventDefault()
      setType(e, section, setSection, "missing")
      return
    }
    if(IsKey.CtrlAltC(e)) {
      e.preventDefault()
      setType(e, section, setSection, "comment")
      return
    }
    //console.log("onKeydown:", e)
  }

  onInput(e) {
    //console.log("onInput:", e)
  }

  onBeforeInput(e, section) {
    const {view} = e.nativeEvent
    const selection = view.getSelection()
    const {parentElement} = selection.focusNode
    const {id} = parentElement

    //console.log("onInputBefore:", e)
    //console.log("- Parent element:", parentElement)
    //console.log("- Element.......:", section[id])
    //console.log("- View:", view)
    //console.log("- Selection:", view.getSelection())
  }

  //---------------------------------------------------------------------------

  componentDidMount() {
    const { section, setSection } = this.props;

    // Käynnistetään Observer-luokka editorielementille
    this.observer = new EditorObserver(this.editorElem, section, setSection);
  }

  componentWillUnmount() {
    if (this.observer) this.observer.disconnect();
  }

  //---------------------------------------------------------------------------

  render() {
    const {sectionid, section, setSection, className} = this.props
    const elem = section[sectionid]

    return <div className={className}
      ref={ref => this.editorElem = ref}
      suppressContentEditableWarning={true}
      contentEditable="plaintext-only"
      spellCheck={false}
      onKeyDown={e => this.onKeyDown(e, section, setSection)}
      //onBeforeInput={e => this.onBeforeInput(e, section)}
      onInput={e => this.onInput(e)}
    >
      <RenderElement section={section} elem={elem}/>
    </div>
  }
}

class RenderElement extends React.PureComponent {
  render() {
    const {section, elem} = this.props
    const {type} = elem

    switch(type) {
      case "sect": return <Sect section={section} elem={elem} />
      case "act": return <Act section={section} elem={elem} />
      case "chapter": return <Chapter section={section} elem={elem} />
      case "scene": return <Scene section={section} elem={elem} />

      default:
      case "p": return <Paragraph elem={elem} />
    }
  }
}

function renderFolded(folded, content) {
  //return folded ? <div hidden contentEditable="false" suppressContentEditableWarning={true}>{content}</div> : content
  return content
}

class Sect extends React.PureComponent {
  render() {
    const {elem, section} = this.props
    const {id, children} = elem

    return <>
      {children.map((elemid, index) => <Act key={elemid} elem={section[elemid]} section={section}/>)}
    </>
  }
}

class Act extends React.PureComponent {
  render() {
    const {section, elem} = this.props
    const {type, name, folded, id, children} = elem

    return <>
      {<h4 id={id}>{name}</h4>}
      {renderFolded(folded, children.map((elemid) => <Chapter key={elemid} section={section} elem={section[elemid]} />))}
    </>
  }
}

class Chapter extends React.PureComponent {
  render() {
    const {elem, section} = this.props
    const {type, name, folded, id, children} = elem

    return <>
      {<h5 id={id}>{name}</h5>}
      {renderFolded(folded, children.map((elemid) => <Scene key={elemid} section={section} elem={section[elemid]} />))}
    </>
  }
}

class Scene extends React.PureComponent {
  render() {
    const {elem, section} = this.props
    const {name, content, folded, id, children} = elem

    return <>
      {<h6 id={id}>{name ? name : <br/>}</h6>}
      {renderFolded(folded, children.map((elemid) => <Paragraph key={elemid} elem={section[elemid]} />))}
    </>
  }
}

class Paragraph extends React.PureComponent {

  render() {
    const {elem} = this.props
    const {type, id} = elem

    switch(type) {
      case "br":
      case "quote":
        return <div className={type} id={id}>{elemAsText(elem)}<br/></div>
      default: break;
    }

    return (
      <p className={type} id={id}>{elemAsText(elem)}</p>
    )
  }
}
