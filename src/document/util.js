//*****************************************************************************
//*****************************************************************************
//
// Document utilities
//
//*****************************************************************************
//*****************************************************************************

import {uuid} from "../util"
export {uuid}

const fs = require("../storage/localfs");

const isGzip = require("is-gzip");

const util = require("util");
const zlib = require("zlib");
const gunzip = util.promisify(zlib.gunzip);
const gzip = util.promisify(zlib.gzip);
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
  var buffer = await fs.read(file.id, null);
  return utf8decoder.decode(isGzip(buffer) ? await gunzip(buffer) : buffer);
}

export async function buf2file(doc, buffer) {
  const file = doc.file;

  // Sanity check here: make sure that buffer is extracted to the same doc as
  // sent for saving.
  //console.log(file)

  if(file.id.endsWith(".gz")) {
    return await fs.write(file.id, await gzip(buffer, {level: 9}));
  } else {
    return await fs.write(file.id, buffer);
  }
}
