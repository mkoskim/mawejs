//*****************************************************************************
//*****************************************************************************
//
// Document utilities
//
//*****************************************************************************
//*****************************************************************************

import {isGzip, gzip, gunzip} from "../util/compress"
import {uuid, nanoid} from "../util"

export {uuid, nanoid}

const fs = require("../system/localfs");

const utf8decoder = new TextDecoder();

//-----------------------------------------------------------------------------
// Determine file type by extension
//-----------------------------------------------------------------------------

export function getSuffix(filename, suffixes) {
  return suffixes.find(suffix => filename.endsWith(suffix))
}

export function suffix2format(f, suffixes = [".mawe", ".mawe.gz", ".moe"]) {
  const suffix = getSuffix(f, suffixes)
  return {
    ".mawe": "mawe",
    ".mawe.gz": "mawe",
    ".moe": "moe",
  }[suffix]
}

//-----------------------------------------------------------------------------
// Loading & generating buffers and trees.
//-----------------------------------------------------------------------------

export async function file2buf(file) {
  const buffer = await fs.read(file.id, null);
  const compressed = isGzip(buffer)
  //console.log("Buffer:", buffer)
  //console.log("isGzip:", compressed)
  return utf8decoder.decode(compressed ? gunzip(buffer) : buffer);
}

export async function buf2file(doc, buffer) {
  const file = doc.file;

  // Sanity check here: make sure that buffer is extracted to the same doc as
  // sent for saving.
  //console.log(file)

  if(file.id.endsWith(".gz")) {
    return await fs.write(file.id, gzip(buffer, {level: 9}));
  } else {
    return await fs.write(file.id, buffer);
  }
}

//-----------------------------------------------------------------------------

export function elemAsText(elem) {
  if(!elem?.children) return ""
  return (
    elem.children
    .map(elem => elem.text)
    .join()
  )
}

//-----------------------------------------------------------------------------
// Flat / unflat doc
//-----------------------------------------------------------------------------

export function section2flat(section) {
  const flat = new Array()

  for(const part of section.parts) {
    flat.push(part)
    for(const scene of part.children) {
      flat.push(scene)
      for(const p of scene.children) {
        flat.push(p)
      }
    }
  }

  return flat
}

export function section2lookup(section) {
  const lookup = new Map()

  for(const part of section.parts) {
    lookup.set(part.id, part)
    for(const scene of part.children) {
      lookup.set(scene.id, scene)
      for(const p of scene.children) {
        lookup.set(p.id, p)
      }
    }
  }

  return lookup
}

//-----------------------------------------------------------------------------
// Count words
//-----------------------------------------------------------------------------

export function wordcount(text) {
  return (
    text
    .split(/\s+/g)
    .filter(s => s.length)
  ).length
}

function wcParagraph(elem) {
  const text = elemAsText(elem)
  const chars = text.length
  const words = wordcount(text)

  switch(elem.type) {
    case "p": return { chars, text: words }
    case "missing": return { chars, missing: words }
    //case "comment": return { chars, comment: words }
  }
  return undefined
}

export function wcChildren(children) {
  var words = {
    chars: 0,
    text: 0,
    missing: 0,
  }

  for(const elem of children) {
    if(!elem.words) continue
    words.chars += elem.words.chars ?? 0
    words.text += elem.words.text ?? 0
    words.missing += elem.words.missing ?? 0
  }

  return words
}

export function wcElem(elem) {

  switch(elem.type) {
    case "sect":
    case "part":
    case "scene":
      return wcChildren(elem.children)

    case "p":
    case "missing":
      return wcParagraph(elem)

    default:
    //case "synopsis":
    //case "comment":
    //case "br":
      break;
  }
  return undefined
}

export function wcCumulative(section) {
  const flat = new Array()

  for(const part of section.parts) {
    flat.push(part)
    for(const scene of part.children) {
      flat.push(scene)
    }
  }

  const cumulative = {}
  var summed = 0

  for(const elem of flat) {
    if(elem.type === "scene") summed += elem.words?.text
    cumulative[elem.id] = summed
  }

  return cumulative
}
