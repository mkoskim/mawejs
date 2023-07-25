// ****************************************************************************
//
// HTML formatting table
//
// ****************************************************************************

import {elemAsText} from "../../document"

export const formatHTML = {
  // File
  "file": (settings, head, content) => {
    const author = head.nickname || head.author
    const title = head.title ?? ""
    const headinfo = author ? `${author}: ${title}` : title
    return `<div style="margin-bottom: 1cm">${headinfo}</div>\n` + content
  },

  // Body
  "body": (settings, head, parts) => {
    const {separator} = settings.part
    const sep = separator ? formatHTML["sep.part"](separator) : "\n"
    return head + parts.join(sep)
  },

  //---------------------------------------------------------------------------
  "sep.part": (text) => `<center style="margin-top: 1cm; margin-bottom: 1cm">${text}</center>\n`,
  "sep.scene": (text) => `<center style="margin-top: 1cm; margin-bottom: 1cm">${text}</center>\n`,

  //---------------------------------------------------------------------------

  "title": (settings, title) => `<h1>${title}</h1>\n`,

  //---------------------------------------------------------------------------

  // Part
  "part": (settings, part, scenes) => {
    const {separator} = settings.scene
    const sep = separator ? formatHTML["sep.scene"](separator) : "<br/>\n"
    return `<div id="${part.id}"/>` + scenes.join(sep)
  },

  // Scene & breaks
  "scene": (settings, scene, splits) => {
    return `<div id="${scene.id}"/>` + splits.join("<br/>\n")
  },
  "split": (settings, paragraphs) => paragraphs.join("\n"),

  // Paragraph styles
  "synopsis": (settings, p) => "",
  "comment": (settings, p) => "",
  "missing": (settings, p) => `<p id="${p.id}" style="color: rgb(180, 20, 20);">${formatHTML.escape(elemAsText(p))}</p>`,
  "p": (settings, p) => `<p id="${p.id}">${formatHTML.escape(elemAsText(p))}</p>`,

  //---------------------------------------------------------------------------

  escape: (text) => text
}
