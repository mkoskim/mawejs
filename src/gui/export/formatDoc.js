//*****************************************************************************
//
// Document formatting engine for exporting
//
//*****************************************************************************

import { mawe, elemAsText } from "../../document"
import { splitByTrailingElem } from "../../util";

//-----------------------------------------------------------------------------
// Format configuration:
//
// const format = {
//    ["file"]
// }
//
//-----------------------------------------------------------------------------

export function FormatBody(format, body) {
  const { head, parts } = body
  const story = {
    type: head.export.type
  }
  const chapters = {
    element: head.export.chapterelem,
    type: head.export.chaptertype,
  }

  const pgbreak = story.type === "long"
  var chnum = 1

  return format["file"](
    mawe.info(head),
    FormatBody(parts),
    {
      pgbreak
    }
  )

  function FormatBody(parts) {
    const content = parts.map(FormatPart).filter(p => p)

    const options = {
      separator: (chapters.type === "separated") && "* * *",
      pgbreak,
    }

    return format["body"](content, options)
  }

  function FormatPart(part) {
    const scenes = part.children.map(FormatScene).filter(s => s)

    if (!scenes.length) return null

    const options = {
      type: (chapters.element === "part") && chapters.type,
      separator: (chapters.element === "scene" && chapters.type === "separated") && "* * *",
      pgbreak,
      chnum
    }

    if(chapters.element === "part") chnum = chnum + 1

    return format["part"](part, scenes, options);
  }

  function FormatScene(scene) {
    const splits = splitByTrailingElem(scene.children, p => p.type === "br")
      .map(s => s.filter(p => p.type !== "br"))
      .filter(s => s.length)
      .map(FormatSplit)
      .filter(s => s?.length)
    //console.log(splits)

    if (!splits.length) return null

    const options = {
      type: (chapters.element === "scene") && chapters.type,
      pgbreak,
      chnum
    }

    if(chapters.element === "scene") chnum = chnum + 1

    return format["scene"](scene, splits, options)
  }

  function FormatSplit(split) {
    const paragraphs = split.map(FormatParagraph).filter(p => p?.length)
    //console.log(split, "->", content)
    if (!paragraphs.length) return null
    return format["split"](paragraphs)
  }

  function FormatParagraph(p) {
    const formatter = format[p.type];
    if(!formatter) return
    const text = p.children.map(FormatMarks).join("")
    return formatter(p, text)
  }

  function FormatMarks(split) {
    var text = format["text"](split.text)
    if(split.bold) text = format["b"](text)
    if(split.italic) text = format["i"](text)
    return text
  }
}
