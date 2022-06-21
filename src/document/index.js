//*****************************************************************************
//*****************************************************************************
//
// Load, save and export stories.
//
//*****************************************************************************
//*****************************************************************************

import { loadmawe } from "./elemtree/load"
import { savemawe } from "./elemtree/save"

import { getSuffix } from "./util.js";
import { suffix2format } from "./util";

//import {mawe} from "./xmljs/load"

const fs = require("../storage/localfs")

export const mawe = {
  load,
  save,
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

  if (format == "mawe") try {
    const suffix = getSuffix(file, [".mawe", ".mawe.gz"]);
    const basename = fs.basename(file.name, suffix);
    const story = await loadmawe(file);

    return {
      file,
      basename,
      suffix,
      story: {
        name: basename,
        ...story
      }
    }
  } catch (e) {
    console.log(e);
    throw Error(`${file.name}: Invalid .mawe file.`);
  }

  throw new Error(`${file.name}: Unknown type.`);
}

//-----------------------------------------------------------------------------

export async function save(doc) {
  return await savemawe(doc);
}
