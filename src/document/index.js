//*****************************************************************************
//*****************************************************************************
//
// Load, save and export stories.
//
//*****************************************************************************
//*****************************************************************************

import {loadmawe, createmawe, buf2tree, fromXML} from "./xmljs/load"
import {savemawe, toXML} from "./xmljs/save"

import {info} from "./head"

import {
  getSuffix, suffix2format,
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

const fs = require("../system/localfs")

//-----------------------------------------------------------------------------

async function load(file) {
  if (typeof file === "string") file = await fs.fstat(file);

  //console.log("Load file:", file)
  const format = suffix2format(file.id);

  if (format === "mawe") {
    //const suffix = getSuffix(file, [".mawe", ".mawe.gz"]);
    //const basename = await fs.basename(file.name, suffix);
    const doc = await loadmawe(file);

    return {
      file,
      ...doc
    }
  }

  throw new Error(`${file.name}: Unknown type.`);
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
