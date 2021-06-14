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
//-----------------------------------------------------------------------------

/*
function mawe(file, compressed, buffer) {
  const {name, ext} = splitname(file.name);

  return {
    file: file,
    name: name,
    ext: ext,
    compressed: compressed,
    story: xmljs.xml2js(buffer, {compact: true, ignoreComment: false}),
    //story: xmljs.xml2js(buffer, {compact: true, ignoreComment: true}),
    //story: xmljs.xml2js(buffer, {compact: true}),
  }

  //---------------------------------------------------------------------------

  function splitname(name) {
    if(fs.extname(name) === ".gz") {
      return {name: fs.basename(name, ".mawe.gz"), ext: ".mawe.gz"}
    } else {
      return {name: fs.basename(name, ".mawe"), ext: ".mawe"}
    }
  }

}
/*/

//-----------------------------------------------------------------------------
// Extract mawe file from buffer
//-----------------------------------------------------------------------------

function mawe(file, compressed, buffer) {
  const {name, ext} = splitname(file.name);

  function et2js(elem) {
    const obj = {
      tag: elem.tag,
      attr: {...elem.attrib},
      text: elem.text,
      tail: elem.tail,
      children: elem.getchildren().map(e => et2js(e)),
    }

    return obj;
  }

  function splitname(name) {
    if(fs.extname(name) === ".gz") {
      return {name: fs.basename(name, ".mawe.gz"), ext: ".mawe.gz"}
    } else {
      return {name: fs.basename(name, ".mawe"), ext: ".mawe"}
    }
  }

  // We first convert element tree to JS objects. This way we can make
  // copies of the trees e.g. when making versions. After that, we parse
  // the tree to make it more compact and easier to use.

  const root = et.parse(buffer).getroot();

  return {
    file: file,
    name: name,
    ext: ext,
    compressed: compressed,
    story: parseRoot(root),
  }

  //---------------------------------------------------------------------------

  function withextras(obj, elem) {
    const extra = elem.getchildren().filter(child => obj[child.tag] === undefined);
    return {
      ...obj,
      extra: extra.map(et2js),
    }
  }

  //---------------------------------------------------------------------------
  
  function parseRoot(root) {
    if(root.tag !== "story") throw Error();
    if(root.get("format") !== "mawe") throw Error();

    const body  = parseBody(root.find("body"));
    const notes = parseNotes(root.find("notes"));
    const versions = root.findall("version").map(parseBody);

    return withextras({
      ...root.attrib,
      name: root.get("name", name),
      body: body,
      notes: notes,
      version: versions,
    }, root);
  }

  function parseBody(elem) {
    const bodyname = elem.get("name")
    const head  = parseHead(elem.find("head"));
    const parts = elem.findall("part", []).map(et2js);

    return withextras({
      name: bodyname ? bodyname : head.version,
      modified: elem.get("modified"),
      head: head,
      part: parts,
    }, elem);
  }

  function parseHead(elem) {
    return withextras({
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
    }, elem);
  }

  function parseNotes(elem) {
    return withextras({
      head: null,
      part: elem.findall("part", []).map(et2js),
    }, elem);
  }
}
