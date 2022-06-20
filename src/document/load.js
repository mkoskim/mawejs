//*****************************************************************************
//*****************************************************************************
//
// Load stories for editing.
//
//*****************************************************************************
//*****************************************************************************

import {uuid, suffix2format, file2buf, buf2tree} from "./util";
import {Document} from "./Document";
const fs = require("../storage/localfs")

// TODO: Extract file "peeking" for project scanning purposes. It returns the
// element tree for mawe/moe files to extract header information.
// TODO: Add file directory to file entry - we basically get it automatically
// when scanning directories.

export async function load(file)
{
  if(typeof file === "string") file = await fs.fstat(file);

  console.log("Load file:", file)
  const format = suffix2format(file);

  switch(format) {
    case "mawe": try {
      return mawe(file);
    } catch(e) {
      console.log(e);
      throw Error(`${file.name}: Invalid .mawe file.`);
    }
    default: break;
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
      id: uuid(),
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
  //    <version name="A">
  //      <head> ... </head>
  //      <part> ... </part>
  //      <part> ... </part>
  //      ...
  //    </version>
  //    <version name="B"> ... </version>
  //    ...
  //
  //---------------------------------------------------------------------------

  function parseRoot(root) {
    if(root.tag !== "story") throw Error();
    if(root.get("format") !== "mawe") throw Error();

    const {uuid, name, format, ...extra} = root.attrib;

    return withextras({
      ...{uuid, name, ...extra},
      body: parseBody(root.find("body")),
      notes: parseNotes(root.find("notes")),
      version: root.findall("version").map(parseBody),
    }, root);
  }

  function parseBody(elem) {
    const {name, modified, ...extra} = elem.attrib;

    return withextras({
      ...extra,
      id: uuid(),
      tag: "body",
      name: name,
      head: parseHead(elem.find("head")),
      parts: parseParts(elem),
    }, elem);
  }

  function parseHead(elem) {
    return withextras({
      //version: elem.findtext("version"),
      status: elem.findtext("status"),
      deadline: elem.findtext("deadline"),
      year: elem.findtext("year"),
      title: elem.findtext("title"),
      subtitle: elem.findtext("subtitle"),
      author: elem.findtext("author"),
      nickname: elem.findtext("nickname"),
      translated: elem.findtext("translated"),
      covertext: elem.findtext("covertext"),
      words: {
        text: elem.findtext("words/text"),
        missing: elem.findtext("words/missing"),
        comments: elem.findtext("words/comments"),
      },
    }, elem);
  }

  function parseNotes(elem) {
    return withextras({
      id: uuid(),
      tag: "notes",
      head: null,
      parts: parseParts(elem),
    }, elem);
  }

  function parseParts(elem) {
    return elem.findall("part", []).map(et2js);
  }
}
