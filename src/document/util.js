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

export function getSuffix(f, suffixes) {
  return suffixes.find(suffix => f.name.endsWith(suffix))
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
  return (
    elem.children
    .map(elem => elem.text)
    .join()
  )
}

//-----------------------------------------------------------------------------
// Count words
//-----------------------------------------------------------------------------

// TODO: Split to two functions: (1) one that adds word counts to elements, and
// (2) one that just counts words.

export function withWordCounts(elem) {

  const cumulativeSum = (sum => value => sum += value)(0);

  switch(elem.type) {
    case "sect":  return Section(elem);
    case "part":  return Part(elem);
    case "scene": return Scene(elem);
    default: break;
  }
  return elem;

  function sum(elems) {
    return (
      elems
      .map(elem => elem.words)
      .reduce(
        (a, b) => ({
          chars: a.chars + b.chars,
          text: a.text + b.text,
          missing: a.missing + b.missing,
          comment: a.comment + b.comment,
        }),
        {
          chars: 0,
          text: 0,
          missing: 0,
          comment: 0,
        }
      )
    )
  }

  function Section(section) {
    const parts = section.parts.map(Part)
    return {
      ...section,
      parts,
      words: sum(parts),
    }
  }

  function Part(part) {
    const cumulative = cumulativeSum(0)
    const scenes = part.children.map(Scene)

    return {
      ...part,
      children: scenes,
      words: {
        ...sum(scenes),
        cumulative,
      }
    }
  }

  function Scene(scene) {

    function asText(elems, type) {
      return (
        elems
        .filter(elem => elem.type === type)
        .map(elem => elemAsText(elem))
        .join(" ")
      )
    }

    function wordcount(text) {
      return (
        text
        .split(/\s+/g)
        .filter(s => s.length)
      ).length
    }

    const text = asText(scene.children, "p")
    const wc_text = wordcount(text)

    return {
      ...scene,
      words: {
        chars: text.length,
        text: wc_text,
        cumulative: cumulativeSum(wc_text),
        missing: wordcount(asText(scene.children, "missing")),
        comment: wordcount(asText(scene.children, "comment"))
      },
    }
  }
}

