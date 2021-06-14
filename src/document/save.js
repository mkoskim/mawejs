//*****************************************************************************
//*****************************************************************************
//
// Save stories
//
//*****************************************************************************
//*****************************************************************************

const et = require("elementtree");
const fs = require("../storage/localfs");
const util = require("util");
const zlib = require("zlib");
const gzip = util.promisify(zlib.gzip);

export async function mawe(file, story, compress) {
  const etree = new et.ElementTree(story);
  const content = etree.write({xml_declaration: false, indent: 0});
  const buffer  = compress ? await gzip(content, {level: 9}) : content;

  fs.write(file, buffer);
}
