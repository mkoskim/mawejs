//*****************************************************************************
//*****************************************************************************
//
// Load, save and export stories.
//
//*****************************************************************************
//*****************************************************************************

import {loadmawe, createmawe, buf2tree, fromXML} from "./xmljs/load"
import {savemawe, tree2buf, toXML} from "./xmljs/save"
import {asRTF, asHTML} from "./print"

import {
  getSuffix, suffix2format,
  withWordCounts, elemAsText,
} from "./util";

export const mawe = {
  load,
  create,
  save,
  saveas,
  rename: async (file, name, suffix) => {
    //name   = name ? name : this.basename;
    //suffix = suffix ? suffix : this.suffix;

    return await fs.rename(file.id, name + suffix);
  },
  buf2tree, fromXML,
  toXML, tree2buf,

  // Exporting
  asRTF, asHTML,
}

export {elemAsText, withWordCounts}

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
    const {buffer, tree, story} = await loadmawe(file);

    return {
      file,
      story,
      //basename,
      //suffix,
      //buffer,
      //tree,
      //story: {
      //  ...story,
      //name: story.name ?? basename,
      //}
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
