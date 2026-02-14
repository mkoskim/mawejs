//*****************************************************************************
//
// Document formatting engine for exporting
//
//*****************************************************************************

import { mawe } from ".."
import { splitByTrailingElem, isNotEmpty } from "../../util";
import { nodeIsBreak, nodeIsNotBreak } from "../elements";
import {elemAsText, elemHeading} from "../util";

//*****************************************************************************
// Settings
//*****************************************************************************

function getActOptions(acts, prefix, pgbreak) {
  return {
    type: acts,
    prefix,
    pgbreak,
  }
}

function getChapterOptions(chapters, prefix, pgbreak) {
  return {
    type: chapters,
    prefix,
    pgbreak,
  }
}

function getSceneOptions(scenes, prefix) {
  return {
    type: scenes,
    prefix,
  }
}

//*****************************************************************************
// Make story a sequence of paragraphs
//*****************************************************************************

function getSection(story, contentType) {
  switch(contentType) {
    case "storybook": return story.storybook;
    default: break;
  }
  return story.draft
}

export function storyToFlatted(story) {

  const { file, exports, head} = story
  const { content, prefix_act, prefix_chapter, prefix_scene } = exports
  const section = getSection(story, content)
  const pgbreak = exports.type === "long"

  const options = {
    content,
    long: exports.type === "long",
    act: getActOptions(exports.acts, prefix_act, pgbreak),
    chapter: getChapterOptions(exports.chapters, prefix_chapter, pgbreak),
    scene: getSceneOptions(exports.scenes, prefix_scene),
  }

  const {author, title, subtitle} = mawe.info(head)

  var actnum = 0
  var chapternum = 0
  var scenenum = 0

  return {
    file,
    options,
    head: {author, title, subtitle},
    content: processDraft(section.acts).filter(isNotEmpty)
  }

  //---------------------------------------------------------------------------

  function processDraft(acts) {
    if(options.act.type === "none")
    {
      return processChapters(skip(acts))
    }
    const processed = acts
      .map(flatAct)
      .filter(isNotEmpty)

    if(options.act.type === "separated") {
      return separate(processed)
    }
    return processed.flat()
  }

  //---------------------------------------------------------------------------

  function flatAct(act) {

    const content = processChapters(act.children)
    if(!content?.length) return undefined

    const head = makeHeader(elemHeading(act), actnum, options.act)
    if(head?.number) actnum = head.number

    return [head, ...content].filter(isNotEmpty)
  }

  //---------------------------------------------------------------------------

  function processChapters(chapters) {
    if(options.chapter.type === "none")
    {
      return processScenes(skip(chapters))
    }

    const content = chapters
      .filter(nodeIsNotBreak)
      .map(flatChapter)
      .filter(isNotEmpty)

    if(!content?.length) return undefined

    if(options.chapter.type === "separated") {
      return separate(content)
    }
    return content.flat()
  }

  //---------------------------------------------------------------------------

  function flatChapter(chapter) {

    const content = processScenes(chapter.children)
    if(!content?.length) return undefined

    const head = makeHeader(elemHeading(chapter), chapternum, options.chapter)
    if(head?.number) chapternum = head.number

    return [head, ...content].filter(isNotEmpty)
  }

  //---------------------------------------------------------------------------

  function processScenes(scenes) {
    const content = scenes
      .filter(nodeIsNotBreak)
      .map(flatScene)
      .filter(isNotEmpty)

    if(!content.length) return

    switch(options.scene.type) {
      case "none": return separate(content, {type: "br"})
      case "separated": return separate(content)
      default: break;
    }

    return content.flat()
  }

  //---------------------------------------------------------------------------

  function flatScene(scene) {
    if(!chooseContent(scene)) return

    const children = scene.children.filter(n => !nodeIsBreak(n))
    const splits = splitByTrailingElem(children, p => p.type === "br")
      .map(s => s.filter(chooseParagraphs))
      .filter(s => s.length)
      .map(([first, ...rest]) => [
        ...(first ? [{...first, first: true}] : []),
        ...rest]
      )

    //console.log("Splits:", splits)
    if(!splits.length) return undefined

    const content = separate(splits, {type: "br"})
    const head = makeHeader(elemHeading(scene), scenenum, options.scene)
    if(head?.number) scenenum = head.number

    return [head, ...content].filter(isNotEmpty)
  }

  function chooseParagraphs(p) {
    switch(p.type) {
      case "p":
      case "quote":
      case "missing": return true
    }
    return false
  }

  //---------------------------------------------------------------------------

  function makeHeader(hdr, num, options) {
    if(!hdr) return undefined
    const {prefix, pgbreak} = options
    const {type, name, numbered} = hdr
    const number = numbered ? num + 1 : undefined
    const title = name

    switch(options.type) {
      case "named": return {pgbreak, prefix, type, name, title}
      case "numbered": return numbered ? {pgbreak, prefix, type, name, number} : {pgbreak, prefix, type, name, title}
      case "numbered&named": return {pgbreak, prefix, type, name, number, title}
      //case "separated": return {type, name}
      default: break;
    }
    return undefined
  }

  //---------------------------------------------------------------------------

  function skip(elems) {
    return elems.map(elem => elem.children.filter(nodeIsNotBreak)).flat()
  }

  //---------------------------------------------------------------------------

  function chooseContent(s) {
    switch(options.content) {
      case "synopsis": return s.content === "synopsis"
      //case "storybook": return true
      default: break
    }
    return s.content === "scene"
  }

  //---------------------------------------------------------------------------

  function separate(elems, separator = {type: "separator"}) {
    const [first, ...rest] = elems
    const separated = rest.map(e => [separator, ...e]).flat()
    return [first, ...separated].flat()
  }

}

//*****************************************************************************
// Formatting flattened story
//*****************************************************************************

export function flattedToText(flatted) {

  const {content} = flatted

  return content.map(ParagraphToText).filter(isNotEmpty).join("\n")

  function ParagraphToText(p) {
    switch(p.type) {
      case "hact":
      case "hchapter":
      case "hscene":
        return (p.number ? p.number + " " : "") + (p.title ?? "")

      case "separator":
      case "br":
        return

      default: break;
    }
    return elemAsText(p)
  }
}

//*****************************************************************************
// Formatting flattened story
//*****************************************************************************

export function flattedFormat(format, flatted) {

  const {head, content, options} = flatted

  return format.file(
    head,
    content.map(FormatParagraph).filter(isNotEmpty).join("\n"),
    options
  )

  function FormatParagraph(p, index) {
    const formatter = format[p.type];
    if(!formatter) return

    switch(p.type) {

      case "hact": return formatter(p, index)
      case "hchapter": return formatter(p, index)
      case "hscene": return formatter(p, index)
      case "hsynopsis": return formatter(p, index)
      case "hnotes": return formatter(p, index)

      case "separator": return formatter(p, index)
      case "br": return formatter(p, index)

      default: break;
    }

    const text = p.children.map(FormatMarks).join("")
    return formatter(p, text)
  }

  function FormatMarks(split) {
    var text = format.text(escape(split.text))
    if(split.bold) text = format.b(text)
    if(split.italic) text = format.i(text)
    return text
  }
}

//-----------------------------------------------------------------------------
// Common escape for certain characters
//-----------------------------------------------------------------------------

function escape(text) {
  return (text && text
    // If you have copy-pasted text, you may have these
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .replaceAll('…', "...")
    .replaceAll("–", "-")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
  )
}