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

  //---------------------------------------------------------------------------
  // Detecting file
  //---------------------------------------------------------------------------

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

  function splitname(name) {
    if(fs.extname(name) === ".gz") {
      return {name: fs.basename(name, ".mawe.gz"), ext: ".mawe.gz"}
    } else {
      return {name: fs.basename(name, ".mawe"), ext: ".mawe"}
    }
  }

  const root = et.parse(buffer).getroot();
  
  return {
    file: file,
    name: name,
    ext: ext,
    compressed: compressed,
    story: parseRoot(root),
  }

  //---------------------------------------------------------------------------
  // We convert element tree to JS objects. This way we can make
  // copies of the trees e.g. when making versions.
  //---------------------------------------------------------------------------

  function et2js(elem) {
    return {
      tag: elem.tag,
      attr: {...elem.attrib},
      text: elem.text,
      tail: elem.tail,
      children: elem.getchildren().map(et2js),
    }
  }

  //---------------------------------------------------------------------------
  // withextras() adds XML elements not processed by the loader to the end
  // of the block. This may be used to implement new features that not all
  // editors support yet. This could be extended so that you could apply
  // attributes to tags that would be preserved by editors.
  //---------------------------------------------------------------------------

  function withextras(obj, elem) {
    const extra = elem.getchildren().filter(child => obj[child.tag] === undefined);
    return {
      ...obj,
      extra: extra.map(et2js),
    }
  }

  //---------------------------------------------------------------------------
  // File structure:
  //
  // <story format="mawe" uuid="xxx">
  //    <body name="v2.2">
  //      <head> ... </head>
  //      <part> ... </part>
  //      <part> ... </part>
  //      ...
  //    </body>
  //    <notes>
  //      <part> ... </part>
  //      <part> ... </part>
  //      ...
  //    </notes>
  //    <version name="v1.0">
  //      <head> ... </head>
  //      <part> ... </part>
  //      <part> ... </part>
  //      ...
  //    </version>
  //    <version name="v0.3"> ... </version>
  //    ...
  //  
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
    return withextras({
      name: elem.get("name", ""),
      modified: elem.get("modified", ""),
      head: parseHead(elem.find("head")),
      part: parseParts(elem),
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
      part: parseParts(elem),
    }, elem);
  }

  function parseParts(elem) {
    return elem.findall("part", []).map(et2js);
  }
}
