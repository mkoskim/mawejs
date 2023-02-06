//*****************************************************************************
//*****************************************************************************
//
// Load, save and export stories.
//
//*****************************************************************************
//*****************************************************************************

import {loadmawe, buf2tree, fromXML} from "./xmljs/load"
import {savemawe, tree2buf, toXML} from "./xmljs/save"
import {toRTF} from "./print"

import { getSuffix } from "./util";
import { suffix2format } from "./util";
import { withWordCounts } from "./util";

export const mawe = {
  load,
  save,
  saveas,
  rename: async (file, name, suffix) => {
    //name   = name ? name : this.basename;
    //suffix = suffix ? suffix : this.suffix;

    return await fs.rename(file.id, name + suffix);
  },
  buf2tree, fromXML,
  toXML, tree2buf,

  toRTF,
}

export {withWordCounts}

//-----------------------------------------------------------------------------

const fs = require("../storage/localfs")

//-----------------------------------------------------------------------------

async function load(file) {
  if (typeof file === "string") file = await fs.fstat(file);

  console.log("Load file:", file)
  const format = suffix2format(file);

  if (format === "mawe") {
    const suffix = getSuffix(file, [".mawe", ".mawe.gz"]);
    const basename = await fs.basename(file.name, suffix);
    const {buffer, tree, story} = await loadmawe(file);

    return {
      file,
      basename,
      suffix,
      //buffer,
      //tree,
      story: {
        ...story,
        name: story.name ?? basename,
      }
    }
  }

  throw new Error(`${file.name}: Unknown type.`);
}

//-----------------------------------------------------------------------------

export async function saveas(doc, filename) {
  //const file = await fs.fstat(filename)
  doc.file = { id: filename }
  console.log("Saving:", doc)
  return await savemawe(doc)
}

export async function save(doc) {
  return await savemawe(doc);
}
