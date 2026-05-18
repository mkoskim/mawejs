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
// Split section into batches
//*****************************************************************************

function splitBatches(section, split) {
  switch(split) {
    case "act":     return {prefix: "a", items: flatActs(section)}
    case "chapter": return {prefix: "c", items: flatChapters(section)}
    default:        return {prefix: "",  items: [section]}
  }
}

function flatActs(section) {
  return section.acts.filter(act => act.type === "act")
}

function flatChapters(section) {
  return flatActs(section)
    .flatMap(act => act.children.filter(ch => ch.type === "chapter"))
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

export function storyToBatches(story) {
  const section = getSection(story, story.exports.content)
  const {prefix, items} = splitBatches(section, story.exports.split)

  let actOffset = 0, chapterOffset = 0, sceneOffset = 0

  const nonEmpty = items
    .map(content => {
      const flatted = batchToFlatted(content, story, { actOffset, chapterOffset, sceneOffset })
      for (const node of flatted.content) {
        if (node.type === "hact"     && node.number) actOffset     = node.number
        if (node.type === "hchapter" && node.number) chapterOffset = node.number
        if (node.type === "hscene"   && node.number) sceneOffset   = node.number
      }
      return flatted
    })
    .filter(flatted => flatted.content.length > 0)

  return nonEmpty.map((flatted, i) => ({
    suffix: prefix ? `.${prefix}${String(i + 1).padStart(2, "0")}` : "",
    flatted,
  }))
}

export function batchToFlatted(content, story, { actOffset = 0, chapterOffset = 0, sceneOffset = 0 } = {}) {

  const { file, exports, head} = story
  const { content: contentType, prefix_act, prefix_chapter, prefix_scene } = exports
  const pgbreak = exports.type === "long"

  const options = {
    content: contentType,
    long: exports.type === "long",
    act: getActOptions(exports.acts, prefix_act, pgbreak),
    chapter: getChapterOptions(exports.chapters, prefix_chapter, pgbreak),
    scene: getSceneOptions(exports.scenes, prefix_scene),
  }

  const {author, title, subtitle} = mawe.info(head)

  var actnum = actOffset
  var chapternum = chapterOffset
  var scenenum = sceneOffset

  return {
    file,
    options,
    head: {author, title, subtitle},
    content: processContent(content).filter(isNotEmpty)
  }

  function processContent(item) {
    switch(item?.type) {
      case "act":     return processDraft([item])
      case "chapter": return processChapters([item])
      default:        return processDraft(item?.acts ?? [])
    }
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
    else if(head) actnum++

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

    if(!content?.length) return []

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
    else if(head) chapternum++

    return [head, ...content].filter(isNotEmpty)
  }

  //---------------------------------------------------------------------------

  function processScenes(scenes) {
    const content = scenes
      .filter(nodeIsNotBreak)
      .map(flatScene)
      .filter(isNotEmpty)

    if(!content.length) return []

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
    else if(head) scenenum++

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

    const anchor = `${type}-${num + 1}`
    switch(options.type) {
      case "named": return {pgbreak, prefix, type, name, title, anchor}
      case "numbered": return numbered ? {pgbreak, prefix, type, name, number, anchor} : {pgbreak, prefix, type, name, title, anchor}
      case "numbered&named": return {pgbreak, prefix, type, name, number, title, anchor}
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