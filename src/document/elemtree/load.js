//*****************************************************************************
//*****************************************************************************
//
// Load stories for editing.
//
//*****************************************************************************
//*****************************************************************************

import { uuid, file2buf } from "../util";
const et = require("elementtree");

//-----------------------------------------------------------------------------
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
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Extract mawe from file
//-----------------------------------------------------------------------------

export async function loadmawe(file) {
  const root = buf2tree(await file2buf(file))
  return parseRoot(root)

  function buf2tree(buffer) {
    return et.parse(buffer).getroot();
  }

  function parseRoot(root) {
    if (root.tag !== "story") throw Error(`${file.name}: File has no story.`);

    const { uuid, name, format, version = 1 } = root.attrib;

    if (format !== "mawe") throw Error(`${file.name}: Story is not mawe story.`);
    if (version > 2) throw Error(`${file.name}: File version ${version} is too new.`)

    return {
      // format - generated at save
      // format version - generated at save
      uuid,
      name,
      notes: parseNotes(root.find("notes")),
      body: parseBody(root.find("body")),
      versions: root.findall("version").map(parseBody),
    }
  }

  function parseNotes(elem) {
    return {
      id: elem.id ?? uuid(),
      parts: parseParts(elem),
    }
  }

  function parseBody(elem) {
    const { name, id, modified } = elem.attrib;

    return {
      id: id ?? uuid(),
      name,
      modified,
      head: parseHead(elem.find("head")),
      parts: parseParts(elem),
    }
  }

  function parseHead(elem) {
    return {
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
    }
  }

  function parseParts(elem) {
    return elem.findall("part", []).map(et2js);
  }

  //---------------------------------------------------------------------------
  // We convert element tree to JS objects. This way we can make
  // copies of the trees e.g. when making versions.
  //---------------------------------------------------------------------------

  function et2js(elem) {
    const [text, tail] = [elem.text, elem.tail].map(
      text => text.replace(/\s+/g, ' ').trim()
      //.replace(/^\s+|\s+$/gm,'')
    );

    return {
      tag: elem.tag,
      attr: { ...elem.attrib },
      text,
      tail,
      children: elem.getchildren().map(et2js),
    }
  }
}
