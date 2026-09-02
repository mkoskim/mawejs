//*****************************************************************************
//*****************************************************************************
//
// Load, save and export stories.
//
//*****************************************************************************
//*****************************************************************************

import {createmawe, buf2tree, fromXML, maweFromTree} from "./xmljs/load"
import {importMoe} from "./xmljs/importMoe"
import {savemawe, toXML} from "./xmljs/save"
import fs from "../system/localfs"

import {info} from "./head"

import {
  suffix2format,
  elemAsText, elemName, filterCtrlElems,
  file2buf, decodebuf,
} from "./util";

export const mawe = {
  info,

  load,
  create,
  save,
  saveas,
  rename: (file, to) => {
    return fs.rename(file.id, to);
  },
  decodebuf, file2buf, buf2tree, fromXML,
  toXML,
}

export {elemAsText, elemName, filterCtrlElems}

//-----------------------------------------------------------------------------

async function load(file) {
  if (typeof file === "string") file = await fs.fstat(file);

  const guessed = suffix2format(file.id);
  if(!guessed) throw new Error(`${file.name}: Unknown type.`);

  const tree = await loadTree(file);
  const story = getStoryRoot(file, tree);
  const format = getFormat(story, guessed);

  switch(format) {
    case "mawe": return loadMaweTree(file, tree);
    case "moe": return loadMoeTree(file, tree);
    default: throw new Error(`${file.name}: Unknown type.`);
  }
}

async function loadTree(file) {
  return buf2tree(await file2buf(file));
}

function getStoryRoot(file, tree) {
  const story = tree.elements?.find(elem => elem.type === "element");

  if(story?.name !== "story") throw new Error(`${file.name}: File has no story.`);

  return story;
}

function getFormat(story, guessed) {
  return story.attributes?.format ?? guessed;
}

function loadMaweTree(file, tree) {
  const doc = maweFromTree(tree);

  return {
    file,
    ...doc
  }
}

function loadMoeTree(file, tree) {
  return {
    ...maweFromTree(importMoe(tree)),
    origin: file,
  }
}

function create(buffer) {
  return createmawe(buffer);
}

//-----------------------------------------------------------------------------

async function saveas(doc, filename) {
  //const file = await fs.fstat(filename)
  //console.log("Saving:", doc)
  // TODO: Fill in basename + suffix
  return await savemawe({
    ...doc,
    file: { id: filename },
  })
}

async function save(doc) {
  return await savemawe(doc);
}
