//*****************************************************************************
//*****************************************************************************
//
// Document utilities
//
//*****************************************************************************
//*****************************************************************************

import {isGzip, gzip, gunzip} from "../util/compress"
import fs from "../system/localfs"
import {xml2js} from "xml-js";

export {uuid, nanoid} from "../util"

const utf8decoder = new TextDecoder();

//-----------------------------------------------------------------------------
// Determine file type by extension
//-----------------------------------------------------------------------------

export function getSuffix(filename, suffixes) {
  return suffixes.find(suffix => filename.endsWith(suffix))
}

export function suffix2format(f, suffixes = [".mawe", ".mawe.gz", ".moe", ".moe.gz", ".moex", ".moex.gz"]) {
  const suffix = getSuffix(f, suffixes)
  return {
    ".mawe": "mawe",
    ".mawe.gz": "mawe",
    ".moe": "moe",
    ".moe.gz": "moe",
    ".moex": "moe",
    ".moex.gz": "moe",
  }[suffix]
}

//-----------------------------------------------------------------------------
// Loading & generating buffers and trees.
//-----------------------------------------------------------------------------

export async function file2buf(file) {
  const buffer = await fs.read(file.id, null);
  const compressed = isGzip(buffer)
  //console.log("Buffer:", buffer)
  //console.log("isGzip:", compressed)
  return decodebuf(compressed ? gunzip(buffer) : buffer);
}

export function decodebuf(buffer) {
  return utf8decoder.decode(buffer)
}

export function buf2tree(buffer) {
  return xml2js(buffer, {
    compact: false,
    ignoreComment: true,
  });
}

export async function buf2file(doc, buffer) {
  const file = doc.file;

  // Sanity check here: make sure that buffer is extracted to the same doc as
  // sent for saving.
  //console.log(file)

  /*
  return await fs.write("savetest.mawe", buffer);
  /*/
  if(file.id.endsWith(".gz")) {
    return await fs.write(file.id, gzip(buffer, {level: 9}));
  } else {
    return await fs.write(file.id, buffer);
  }
  /**/
}
