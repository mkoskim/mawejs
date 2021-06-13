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

export async function mawe(file, root, compress) {
  const etree = new et.ElementTree(root);
  const content = etree.write({xml_declaration: false});
  const buffer  = compress ? await gzip(content, {level: 9}) : content;

  fs.write(file, buffer);
}
