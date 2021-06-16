//*****************************************************************************
//*****************************************************************************
//
// Load stories for editing.
//
//*****************************************************************************
//*****************************************************************************

module.exports = {load}

const {getsuffix, file2buf, buf2tree} = require("./util")
const {Document} = require("./Document")
const fs = require("../storage/localfs")

// TODO: Extract file "peeking" for project scanning purposes. It returns the
// element tree for mawe/moe files to extract header information.
// TODO: Add file directory to file entry - we basically get it automatically
// when scanning directories.

async function load(file)
{
  if(typeof file === "string") file = await fs.fstat(file);

  switch(getsuffix(file)) {
    case ".mawe":
    case ".mawe.gz": try {
      return mawe(file);
    } catch(e) {
      console.log(e);
      throw Error(`${file.name}: Invalid .mawe file.`);
    }
  }

  throw new Error(`${file.name}: Unknown type.`);
}

//-----------------------------------------------------------------------------
// Extract mawe from file
//-----------------------------------------------------------------------------

async function mawe(file) {
  const root = buf2tree(await file2buf(file))

  return new Document(file, parseRoot(root));

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
      body: body,
      notes: notes,
      version: versions,
    }, root);
  }

  function parseBody(elem) {
    return withextras({
      name: elem.get("name", ""),
      modified: null,
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
