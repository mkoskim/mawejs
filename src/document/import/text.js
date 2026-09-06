//*****************************************************************************
//
// Text import
//
//*****************************************************************************

import { splitByLeadingElem, text2lines } from "../../util";

//-----------------------------------------------------------------------------

export function importText(content, settings = {}) {

  if(!content) return undefined

  const linebreak = getLinebreak(settings.linebreak)
  const {
    actprefix = "",
    chapterprefix = "",
    sceneprefix = "",
  } = settings

  function isActBreak(line) {
    if(!actprefix.length) return false
    if(!line) return false
    return line.toLowerCase().startsWith(actprefix.toLowerCase())
  }

  function isChapterBreak(line) {
    if(!chapterprefix) return false
    if(!line) return false
    return line.toLowerCase().startsWith(chapterprefix.toLowerCase())
  }

  function isSceneBreak(line) {
    if(!sceneprefix) return false
    if(!line) return false
    return line.toLowerCase().startsWith(sceneprefix.toLowerCase())
  }

  const lines = text2lines(content, linebreak)
  const acts = splitByLeadingElem(lines, isActBreak).filter(e => e.length)

  return acts.map(makeAct)

  //---------------------------------------------------------------------------

  function makeAct(lines) {
    const {first, rest} = getContent(lines, isActBreak)
    const chapters = splitByLeadingElem(rest, isChapterBreak).filter(e => e.length)
    return elem("act", {name: first}, chapters.map(makeChapter))
  }

  function makeChapter(lines) {
    const {first, rest} = getContent(lines, isChapterBreak)
    const scenes = splitByLeadingElem(rest, isSceneBreak).filter(e => e.length)
    return elem("chapter", {name: first}, scenes.map(makeScene))
  }

  function makeScene(lines) {
    const {first, rest} = getContent(lines, isSceneBreak)
    return elem("scene", {name: first}, rest.map(makeParagraph))
  }

  function makeParagraph(line) {
    return elem("p", {}, [{type: "text", text: line}])
  }
}

function getLinebreak(linebreak) {
  switch(linebreak) {
    case "single": return "\n"
    default:
    case "double": return "\n\n"
  }
}

function getContent(lines, isBreak) {
  const [first, ...rest] = lines
  if(isBreak(first)) return {first, rest}
  return {first: "", rest: [first].concat(rest)}
}

function elem(name, attributes = {}, elements = []) {
  return {
    type: "element",
    name,
    attributes,
    elements,
  }
}
