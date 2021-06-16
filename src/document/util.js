//*****************************************************************************
//*****************************************************************************
//
// Different document utilities
//
//*****************************************************************************
//*****************************************************************************

module.exports = {
  getsuffix,
  file2buf, buf2file,
  buf2tree, tree2buf,
}

const et = require("elementtree");

const fs = require("../storage/localfs");
const util = require("util");
const isGzip = require("is-gzip");
const zlib = require("zlib");
const gunzip = util.promisify(zlib.gunzip);
const gzip = util.promisify(zlib.gzip);
const utf8decoder = new TextDecoder();

//-----------------------------------------------------------------------------
// Determine file type
//-----------------------------------------------------------------------------

function getsuffix(f, suffixes = [".mawe", ".mawe.gz", ".moe"]) {
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

async function file2buf(file) {
  var buffer = await fs.read(file.id, null);
  if(isGzip(buffer)) {
    file.compressed = true;
    buffer = await gunzip(buffer);
  }
  return utf8decoder.decode(buffer)
}

function buf2tree(buffer) {
  return et.parse(buffer).getroot();
}

function tree2buf(root) {
  const etree = new et.ElementTree(root);
  const content = etree.write({xml_declaration: false, indent: 0});
  return content;
}

async function buf2file(file, content, compress) {
  //console.log(file)
  const buffer = compress ? await gzip(content, {level: 9}) : content;
  return await fs.write(file.id, buffer);
}
