//*****************************************************************************
//*****************************************************************************
//
// Load, save and export stories.
//
//*****************************************************************************
//*****************************************************************************

//*
import { loadmawe } from "./elemtree/load"
import { savemawe } from "./elemtree/save"
/*/
import {loadmawe} from "./xmljs/load"
import {savemawe} from "./xmljs/save"
/**/

import { getSuffix } from "./util.js";
import { suffix2format } from "./util";

const fs = require("../storage/localfs")

export const mawe = {
  load,
  save,
  saveas,
  rename: async (file, name, suffix) => {
    //name   = name ? name : this.basename;
    //suffix = suffix ? suffix : this.suffix;

    return await fs.rename(file.id, name + suffix);
  }
}

//-----------------------------------------------------------------------------

async function load(file) {
  if (typeof file === "string") file = await fs.fstat(file);

  console.log("Load file:", file)
  const format = suffix2format(file);

  if (format == "mawe") {
    const suffix = getSuffix(file, [".mawe", ".mawe.gz"]);
    const basename = fs.basename(file.name, suffix);
    const story = await loadmawe(file);

    return {
      file,
      basename,
      suffix,
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
