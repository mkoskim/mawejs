import React from 'react';
import {elemAsText, filterCtrlElems} from '../../../document';
import { nanoid } from '../../../util';
import {useImmer} from 'use-immer';
import {IsKey} from '../../common/hotkeys';
import {childID, IDtoPath} from '../../../document/util';

//*****************************************************************************
//
// SketchView
//
//*****************************************************************************

export function SketchEditView({doc, setDoc}) {
  const [section, setSection] = useImmer(processSection(doc.body))

  //console.log(section)
  return (
    <div className="Board Editor">
      <Editor className="Sheet Regular" id="root" section={section} setSection={setSection}>

      </Editor>
    </div>
  )
}

//*****************************************************************************
//
//*****************************************************************************

function processSection(section) {

  return {
    ...section,
    acts: filterCtrlElems(section.acts).map(processAct)
  }

  function processAct(act) {
    return {
      ...act,
      children: filterCtrlElems(act.children).map(processChapter)
    }
  }

  function processChapter(chapter) {
    return {
      ...chapter,
      children: filterCtrlElems(chapter.children).map(processScene)
    }
  }

  function processScene(scene) {
    return {
      ...scene,
      children: filterCtrlElems(scene.children).map(processParagraph)
    }
  }

  function processParagraph(paragraph) {
    return {
      ...paragraph,
      text: elemAsText(paragraph),
      children: undefined,
    }
  }
}

//*****************************************************************************

class RenderElement extends React.PureComponent {
  render() {
    const {elem, id} = this.props
    const {type} = elem

    switch(type) {
      case "sect": return <Sect id={id} elem={elem} />
      case "act": return <Act id={id} elem={elem} />
      case "chapter": return <Chapter id={id} elem={elem} />
      case "scene": return <Scene id={id} elem={elem} />

      default:
      case "p": return <Paragraph id={id} elem={elem} />
    }
  }
}

/*
function renderFolded(folded, content) {
  //return folded ? <div hidden contentEditable="false" suppressContentEditableWarning={true}>{content}</div> : content
  return content
}
*/

class Sect extends React.PureComponent {
  render() {
    const {elem, id} = this.props
    const {acts} = elem

    return acts.map((elem, index) => {
      const childid = childID(id, index);
      return <Act key={childid} id={childid} elem={elem}/>
    })
  }
}

class Act extends React.PureComponent {
  render() {
    const {elem, id} = this.props
    const {type, name, folded, children} = elem

    //console.log("Act:", id, name, folded)

    return <>
      {<h4 id={id}>{name}</h4>}
      {children.map((elem, index) => {
        const childid = childID(id, index);
        return <Chapter key={childid} id={childid} elem={elem} />
      })
      }
    </>
  }
}

class Chapter extends React.PureComponent {
  render() {
    const {elem, id} = this.props
    const {type, name, folded, children} = elem

    return <>
      {<h5 id={id}>{name}</h5>}
      {children.map((elem, index) => {
        const childid = childID(id, index);
        return <Scene key={childid} id={childid} elem={elem} />
      })
      }
    </>
  }
}

class Scene extends React.PureComponent {
  render() {
    const {elem, id} = this.props
    const {type, name, folded, children} = elem

    return <>
      {<h6 id={id}>{name}</h6>}
      {children.map((elem, index) => {
        const childid = childID(id, index);
        return <Paragraph key={childid} id={childid} elem={elem} />
      })
      }
    </>
  }
}

class Paragraph extends React.PureComponent {

  render() {
    const {elem, id} = this.props
    const {type, text} = elem

    switch(type) {
      case "br":
      case "quote":
        return <div className={type} id={id}>{text}<br/></div>

      default: break;
    }

    return (
      <p id={id}>{text}<br/></p>
    )
  }
}

//*****************************************************************************

class Editor extends React.PureComponent {

  //---------------------------------------------------------------------------

  render() {
    const {id, section, setSection, className} = this.props

    return <div className={className}
      ref={ref => this.editorElem = ref}
      suppressContentEditableWarning={true}
      contentEditable="plaintext-only"
      spellCheck={false}
      onKeyDown={e => this.onKeyDown(e, section, setSection)}
      //onBeforeInput={e => this.onBeforeInput(e, section)}
      //onInput={e => this.onInput(e)}
    >
      <RenderElement id={id} elem={section}/>
    </div>
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

  onKeyDown(e, section, setSection) {
    /*
    if(IsKey.AltF(e)) {
      e.preventDefault()
      //console.log("Alt-F")
      toggleFold(e, section, setSection)
      return
    }
    */
    /*
    if(IsKey.CtrlAlt0(e)) {
      e.preventDefault()
      setParagraphType(e, section, setSection, "p")
      return
    }
    if(IsKey.CtrlAltM(e)) {
      e.preventDefault()
      setParagraphType(e, section, setSection, "missing")
      return
    }
    if(IsKey.CtrlAltC(e)) {
      e.preventDefault()
      setParagraphType(e, section, setSection, "comment")
      return
    }
    //console.log("onKeydown:", e)
    */
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
    //console.log("Character data:", mutation)
    const {target} = mutation
    //const text = target.textContent
    //console.log("Target:", target)

    const node = findParagraphByNode(target)
    if(!node) return
    //console.log("Node:", node)
    const {id} = node
    const {sectID, path} = IDtoPath(id)
    //console.log("SectID:", sectID, "Path:", path)
    //console.log("Node:", getNodeByPath(this.section, path))
    setParagraphContent(path, target.textContent, this.setSection)
    /*
    this.setSection(draft => {
      draft[id].content = target.textContent
    })
    */
  }

  disconnect() {
    this.observer.disconnect();
  }
}

//*****************************************************************************

function getNodeByPath(section, path) {
  switch(path.length) {
    case 1: return section.acts[path[0]]
    case 2: return section.acts[path[0]].children[path[1]]
    case 3: return section.acts[path[0]].children[path[1]].children[path[2]]
    case 4: return section.acts[path[0]].children[path[1]].children[path[2]].children[path[3]]
  }
}

function setParagraphContent(path, content, setSection) {
  console.log("Path:", path)
  switch(path.length) {
    case 1: return setSection(draft => { draft.acts[path[0]].name = content })
    case 2: return setSection(draft => { draft.acts[path[0]].children[path[1]].name = content })
    case 3: return setSection(draft => { draft.acts[path[0]].children[path[1]].children[path[2]].name = content })
    case 4: return setSection(draft => { draft.acts[path[0]].children[path[1]].children[path[2]].children[path[3]].text = content })
  }
}

/*
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
*/

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

  /*
  const id = findContainer(e, section)
  const elem = section[id]
  console.log(id, elem)
  setSection(draft => {
    draft[id].folded = !elem.folded
  })
  */
}

function setParagraphType(e, section, setSection, type) {
  /*
  const node = findParagraphByEvent(e, section)

  if(!node) return

  const {id} = node

  setSection(draft => { draft[id].type = type })
  */
}
