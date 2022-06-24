//*****************************************************************************
//*****************************************************************************
//
// Load with XML-JSON
//
//*****************************************************************************
//*****************************************************************************

import {uuid, file2buf} from "../util";

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

const convert = require('xml-js');

function buf2tree(buffer) {
  return convert.xml2js(buffer, {compact: false});
  //const parser = new DOMParser();
  //return parser.parseFromString(buffer, "text/xml");
}

export async function loadmawe(file) {
  const root = buf2tree(await file2buf(file))

  return root;

  //return new Document(file, root);
  //return new Document(file, parseRoot(root));

  function parseRoot(root) {
    if(root.name !== "story") throw Error(`ERROR (${file}): Root elem is not story.`);
    if(getAttr(root, "format") !== "mawe") throw Error();

    //const {uuid, name, format, ...extra} = root.attrib;
    const {uuid, name, format, ...extra} = {};

    return withextras({
      ...{uuid, name, ...extra},
      body: parseBody(elemFind(root, "body")),
      notes: parseNotes(elemFind(root, "notes")),
      version: elemFindall(root, "version").map(parseBody),
    }, root);
  }

  //---------------------------------------------------------------------------

  function elemFind(parent, name) {
    return parent.find(e => e.name === name)
  }

  function elemFindall(parent, name) {
    return parent.filter(e => e.name === name)
  }

  function getAttr(elem, name) {
    return elem.attributes[name]
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
      id: uuid(),
      tag: elem.tag,
      attr: {...elem.attrib},
      text,
      tail,
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
    //const extra = elem.getchildren().filter(child => obj[child.tag] === undefined);
    return {
      ...obj,
      //extra: extra.map(et2js),
    }
  }

  //---------------------------------------------------------------------------

  function parseBody(elem) {
    return elem;
  }

  function parseNotes(elem) {
    return elem;
  }
}