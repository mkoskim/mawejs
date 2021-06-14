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

  async function readbuf(fileid) {
    const buffer = await fs.read(fileid, null);
    const compressed = isGzip(buffer);
  
    return [
      compressed,
      utf8decoder.decode(compressed ? await gunzip(buffer) : buffer)
    ];
  }
  
  if(file.name.endsWith(".mawe") || file.name.endsWith(".mawe.gz"))
  {
    try {
      return mawe(file, isCompressed, buffer)
    } catch(e) {
      console.log(e);
      throw Error(`${file.name}: Invalid .mawe file.`);
    }
  }

  throw new Error(`${file.name}: Unknown type.`);
}

//-----------------------------------------------------------------------------
// Extract mawe file from buffer
//-----------------------------------------------------------------------------

function mawe(file, compressed, buffer) {
  const {name, ext} = splitname(file.name);
  const root = parseRoot(et.parse(buffer).getroot());

  return {
    file: file,
    name: name,
    ext: ext,
    compressed: compressed,
    story: root,
  }

  //---------------------------------------------------------------------------

  function splitname(name) {
    if(fs.extname(name) === ".gz") {
      return {name: fs.basename(name, ".mawe.gz"), ext: ".mawe.gz"}
    } else {
      return {name: fs.basename(name, ".mawe"), ext: ".mawe"}
    }
  }

  function getextras(elem, obj) {
    return elem.getchildren()
      .map(e => (obj[e.tag] == undefined) ? e : undefined)
      .filter(e => e)
    ;
  }

  //---------------------------------------------------------------------------
  
  function parseRoot(root) {
    if(root.tag !== "story") throw Error();
    if(root.get("format") !== "mawe") throw Error();

    const story = {
      ...root.attrib,
      name: root.get("name", name),
      body: parseBody(root.find("body")),
      notes: parseNotes(root.find("notes")),
      //version: root.findall("version").map(parseBody),
    }
    return {...story, extra: getextras(root, story)};
  }

  function parseBody(elem) {
    const body = {
      name: elem.get("name", ""),
      modified: elem.get("modified"),
      head: parseHead(elem.find("head")),
      part: elem.findall("part", []).map(parsePart),
    }
    return { ...body, extra: getextras(elem, body) };
  }

  function parseNotes(elem) {
    const notes = {
      head: elem.find("head"),
      part: elem.findall("part", []).map(parsePart),
    }
    return { ...notes, extra: getextras(elem, notes) };
  }

  function parseHead(elem) {
    const head = {
      version: elem.findtext("version"),
      title: elem.findtext("title"),
      subtitle: elem.findtext("subtitle"),
      author: elem.findtext("author"),
      nickname: elem.findtext("nickname"),
      translated: elem.findtext("translated"),
      status: elem.findtext("status"),
      deadline: elem.findtext("deadline"),
      covertext: elem.findtext("covertext"),
      year: elem.findtext("year"),
      words: {
        text: elem.findtext("words/text"),
        missing: elem.findtext("words/missing"),
        comments: elem.findtext("words/comments"),
      },
    }
    return { ...head, extra: getextras(elem, head) }
  }

  function parsePart(elem) {
    const part = {
      name: elem.get("name"),
      scene: elem.findall("scene", []).map(parseScene),
      extra: [],
    }
    return { ...part, extra: getextras(elem, part) };
  }

  function parseScene(elem) {
    return {
      name: elem.get("name"),
      content: elem.getchildren(),
    }
  }
}
