//*****************************************************************************
//
// Text import
//
//*****************************************************************************

import { splitByLeadingElem, text2lines } from "../../util";
import { createElem } from "../xmljs/elemutil";

//-----------------------------------------------------------------------------

export function importText(content, settings = {}) {

  const linebreak = getLinebreak(settings.linebreak)
  const {
    actprefix = "",
    chapterprefix = "",
    sceneprefix = "",
  } = settings

  const lines = text2lines(content, linebreak)
  const acts = splitByLeadingElem(lines, isActBreak).filter(e => e.length)

  // Return as mawe XML tree version 4
  return {
    elements: [{
      type: "element", name: "story",
      attributes: { format: "mawe", version: "4" },
      elements: [
        {
          type: "element", name: "body",
          elements: acts.map(makeAct),
        }
      ]
    }]
  }

  function isBreak(prefix, line) {
    if(!prefix.length) return false
    if(!line) return false
    return line.toLowerCase().startsWith(prefix.toLowerCase())
  }

  function isActBreak(line) {
    return isBreak(actprefix, line)
  }

  function isChapterBreak(line) {
    return isBreak(chapterprefix, line)
  }

  function isSceneBreak(line) {
    return isBreak(sceneprefix, line)
  }

  //---------------------------------------------------------------------------

  function makeAct(lines) {
    const {first, rest} = getContent(lines, isActBreak)
    const chapters = splitByLeadingElem(rest, isChapterBreak).filter(e => e.length)
    return createElem("act", {name: first}, chapters.map(makeChapter))
  }

  function makeChapter(lines) {
    const {first, rest} = getContent(lines, isChapterBreak)
    const scenes = splitByLeadingElem(rest, isSceneBreak).filter(e => e.length)
    return createElem("chapter", {name: first}, scenes.map(makeScene))
  }

  function makeScene(lines) {
    const {first, rest} = getContent(lines, isSceneBreak)
    return createElem("scene", {name: first}, rest.map(makeParagraph))
  }

  function makeParagraph(line) {
    return createElem("p", {}, [{type: "text", text: line}])
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
