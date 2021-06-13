//*****************************************************************************
//*****************************************************************************
//
// Load stories for editing.
//
//*****************************************************************************
//*****************************************************************************

const et = require("elementtree");
const fs = require("../storage/localfs");
const util = require("util");
const isGzip = require("is-gzip");
const zlib = require("zlib");
const gunzip = util.promisify(zlib.gunzip);

const utf8decoder = new TextDecoder();

//-----------------------------------------------------------------------------
// Determine file type
//-----------------------------------------------------------------------------

export async function load(fileid)
{
  const file = await fs.fstat(fileid);
  const [isCompressed, buffer] = await readbuf(fileid);
  
  if(file.name.endsWith(".mawe") || file.name.endsWith(".mawe.gz"))
  {
    try {
      return mawe(file, isCompressed, buffer)
    } catch(e) {
      throw Error(`${file.name}: Invalid .mawe file.`);
    }
  }

  throw new Error(`${file.name}: Unknown type.`);

  async function readbuf(fileid) {
    const buffer = await fs.read(fileid, null);
    const compressed = isGzip(buffer);
  
    return [compressed, compressed ? await gunzip(buffer) : buffer];
  }
}

//-----------------------------------------------------------------------------
// Extract mawe file from buffer
//-----------------------------------------------------------------------------

function mawe(file, compressed, buffer) {
  const story = et.parse(utf8decoder.decode(buffer));
  
  const root = story.getroot();
  console.log(root);
  if(root.tag !== "story") throw Error();
  
  return {
    file: file,
    compressed: compressed,
    story: root,
  }
}
