//*****************************************************************************
//*****************************************************************************
//
// Load & save
//
//*****************************************************************************
//*****************************************************************************

import {mawe} from "./elemtree/load"
//import {mawe} from "./xmljs/load"

import {suffix2format} from "./util";
const fs = require("../storage/localfs")

export async function load(file)
{
  if(typeof file === "string") file = await fs.fstat(file);

  console.log("Load file:", file)
  const format = suffix2format(file);

  switch(format) {
    case "mawe": try {
      return mawe(file);
    } catch(e) {
      console.log(e);
      throw Error(`${file.name}: Invalid .mawe file.`);
    }
    default: break;
  }

  throw new Error(`${file.name}: Unknown type.`);
}
