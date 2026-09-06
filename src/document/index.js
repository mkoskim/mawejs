//*****************************************************************************
//*****************************************************************************
//
// Load, save and export stories.
//
//*****************************************************************************
//*****************************************************************************

import {createmawe, maweFromRoot, maweFromTree, getStoryRoot} from "./xmljs/load"
import {importMoe} from "./import/moe"
import {savemawe, toXML} from "./xmljs/save"
import fs from "../system/localfs"

import {info} from "./head"

import {suffix2format, file2buf, buf2tree, decodebuf} from "./fileutil.js"

export const mawe = {
  info,

  load, loadFromTree,
  create: createmawe,
  save: savemawe,
  saveas,
  rename: (file, to) => {
    return fs.rename(file.id, to);
  },
  decodebuf, file2buf, buf2tree,
  maweFromRoot, toXML,
}

//-----------------------------------------------------------------------------

async function load(file) {
  if (typeof file === "string") file = await fs.fstat(file);

  const guessed = suffix2format(file.id);
  if(!guessed) throw new Error(`${file.name}: Unknown type.`);

  const buffer = await file2buf(file);
  const tree = buf2tree(buffer);
  return loadFromTree(file, tree, guessed);
}

function loadFromTree(file, tree, guessed) {
  const story = getStoryRoot(tree);
  const format = getFormat(story, guessed);

  switch(format) {
    case "mawe": return {
      ...maweFromRoot(story),
      file,
    }
    case "moe": return {
      ...maweFromTree(importMoe(story)),
      origin: file,
    }
    default: throw new Error(`${file.name}: Unknown type.`);
  }

  function getFormat(story, guessed) {
    return story.attributes?.format ?? guessed;
  }
}

// TODO: Move to mawe XML utils?
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
