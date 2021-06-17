//*****************************************************************************
//*****************************************************************************
//
// Document utilities
//
//*****************************************************************************
//*****************************************************************************

const et = require("elementtree");
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

export function suffix2format(f, suffixes = [".mawe", ".mawe.gz", ".moe"]) {
  const suffix = suffixes.find(suffix => f.name.endsWith(suffix))
  f.format = {
    ".mawe": "mawe",
    ".mawe.gz": "mawe",
    ".moe": "moe",
  }[suffix]
  return suffix;
}

//-----------------------------------------------------------------------------
// Loading & generating buffers and trees.
//-----------------------------------------------------------------------------

export async function file2buf(file) {
  var buffer = await fs.read(file.id, null);
  return utf8decoder.decode(isGzip(buffer) ? await gunzip(buffer) : buffer);
}

export function buf2tree(buffer) {
  return et.parse(buffer).getroot();
}

export function tree2buf(root) {
  const etree = new et.ElementTree(root);
  return etree.write({xml_declaration: false, indent: 0});
}

export async function buf2file(file, buffer, compress) {
  //console.log(file)
  
  if(file.id.endsWith(".gz")) {
    return await fs.write(file.id, await gzip(buffer, {level: 9}));
  } else {
    return await fs.write(file.id, buffer);
  }
}
