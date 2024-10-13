//*****************************************************************************
//
// Document formatting engine for exporting
//
//*****************************************************************************

import { mawe, elemAsText } from "../../document"
import { elemHeading } from "../../document/util";
import { splitByTrailingElem } from "../../util";

//*****************************************************************************
// Settings
//*****************************************************************************

function getActOptions(acts, pgbreak) {
  switch(acts) {
    case "numbered": return {
      numbered:   { pgbreak, number: true},
      unnumbered: { pgbreak, name: true }
    }
    case "named": return {
      numbered:   { pgbreak, name: true},
      unnumbered: { pgbreak, name: true }
    }
    case "numbered&named": return {
      numbered:   { pgbreak, number: true, name: true},
      unnumbered: { pgbreak, name: true }
    }
  }
  return {
    numbered: {skip: true},
    unnumbered: {skip: true},
  }
}


function getChapterOptions(chapters, pgbreak) {
  switch(chapters) {
    case "numbered": return {
      numbered:   { pgbreak, number: true},
      unnumbered: { pgbreak, name: true }
    }
    case "named": return {
      numbered:   { pgbreak, name: true},
      unnumbered: { pgbreak, name: true }
    }
    case "numbered&named": return {
      numbered:   { pgbreak, number: true, name: true},
      unnumbered: { pgbreak, name: true }
    }
    case "separated": return {
      separator: "* * *",
      numbered:   { skip: true },
      unnumbered: { skip: true }
    }
  }
  return {
    numbered: {skip: true},
    unnumbered: {skip: true},
  }
}

function getSceneOptions(scenes) {
  switch(scenes) {
    case "separated": return {
      separator: "* * *"
    }
  }
  return {}
}

//*****************************************************************************
// Formatting
//*****************************************************************************

export function FormatBody(format, story) {
  const { exports, head, body } = story
  const pgbreak = exports.type === "long"

  const options = {
    long: exports.type === "long",
    act: getActOptions(exports.acts, pgbreak),
    chapter: getChapterOptions(exports.chapters, pgbreak),
    scene: getSceneOptions(exports.scenes)
  }

  var actnum = 0
  var chapternum = 0
  var scenenum = 0

  return format.file(
    mawe.info(head),
    FormatBody(body.acts),
    options
  )

  function FormatBody(acts) {
    const content = acts.map(FormatAct).filter(p => p)

    return format.body(content, options.act)
  }

  function FormatAct(act) {
    return format.chapter(
      FormatActHead(act),
      act.children.filter(e => e.type === "chapter").map(FormatChapter).filter(s => s),
      options.chapter
    )
  }

  function FormatChapter(chapter) {
    return format.chapter(
      FormatChapterHead(chapter),
      chapter.children.filter(e => e.type === "scene").map(FormatScene).filter(s => s),
      options.scene
    )
  }

  function FormatActHead(act) {

    const {id} = act
    const head = elemHeading(act)

    const numbered = head?.numbered

    if(numbered) {
      actnum = actnum + 1
      return format.hact(id, actnum, elemAsText(head), options.act.numbered)
    } else {
      return format.hact(id, undefined, elemAsText(head), options.act.unnumbered)
    }
  }

  function FormatChapterHead(chapter) {

    const {id} = chapter
    const head = elemHeading(chapter)

    const numbered = head?.numbered

    if(numbered) {
      chapternum = chapternum + 1
      return format.hchapter(id, chapternum, elemAsText(head), options.chapter.numbered)
    } else {
      return format.hchapter(id, undefined, elemAsText(head), options.chapter.unnumbered)
    }
  }

  function FormatScene(scene) {
    const splits = splitByTrailingElem(scene.children, p => p.type === "br")
      .map(s => s.filter(p => p.type !== "br"))
      .filter(s => s.length)
      .map(FormatSplit)
      .filter(s => s?.length)
    //console.log(splits)

    if (!splits.length) return null

    //if(chapters.element === "scene") scenenum = scenenum + 1

    return format.scene("", splits)
  }

  function FormatSplit(split) {
    const paragraphs = split.map(FormatParagraph).filter(p => p?.length)
    //console.log(split, "->", content)
    if (!paragraphs.length) return null
    return format.split(paragraphs)
  }

  function FormatParagraph(p) {
    const formatter = format[p.type];
    if(!formatter) return
    const text = p.children.map(FormatMarks).join("")
    return formatter(p, text)
  }

  function FormatMarks(split) {
    var text = format.text(split.text)
    if(split.bold) text = format.b(text)
    if(split.italic) text = format.i(text)
    return text
  }
}
