//*****************************************************************************
//*****************************************************************************
//
// Load, save and export stories.
//
//*****************************************************************************
//*****************************************************************************

import {loadmawe, createmawe, buf2tree, fromXML} from "./xmljs/load"
import {savemawe, toXML} from "./xmljs/save"
import {asRTF, asHTML} from "./print"

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
  rename: async (file, name, suffix) => {
    //name   = name ? name : this.basename;
    //suffix = suffix ? suffix : this.suffix;

    return await fs.rename(file.id, name + suffix);
  },
  decodebuf, file2buf, buf2tree, fromXML,
  toXML,

  // Exporting
  asRTF, asHTML,
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
    const story = await loadmawe(file);

    return {
      file,
      ...story
    }
  }

  throw new Error(`${file.name}: Unknown type.`);
}

function create(buffer) {
  const {tree, story} = createmawe(buffer);
  return {
    //buffer,
    //tree,
    story
  }
}

//-----------------------------------------------------------------------------

export async function saveas(doc, filename) {
  //const file = await fs.fstat(filename)
  //console.log("Saving:", doc)
  // TODO: Fill in basename + suffix
  return await savemawe({
    file: { id: filename },
    story: doc.story,
  })
}

export async function save(doc) {
  return await savemawe(doc);
}
