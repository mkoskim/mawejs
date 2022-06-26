//*****************************************************************************
//*****************************************************************************
//
// Save stories
//
//*****************************************************************************
//*****************************************************************************

/*
-------------------------------------------------------------------------------

TODO: Things to think:

- Save as: when we create a copy of a file, should we generate a new UUID?

- Move file: I would like to encourage this instead of "save as"

- Compressing / decompressing a file: Basically we don't want to keep
  copies of files around, so one file has either .mawe or .mawe.gz suffix.
  .gz helps operating with the file with gzip/gunzip, but it is basically
  not needed.

-------------------------------------------------------------------------------
*/

import {buf2file} from "../util.js";
import {Element, SubElement, Comment} from "elementtree";
const et = require("elementtree");

function tree2buf(root) {
  const etree = new et.ElementTree(root);
  return etree.write({xml_declaration: false, indent: 0});
}

//-----------------------------------------------------------------------------
// Save stories in .mawe format
//-----------------------------------------------------------------------------

export async function savemawe(doc) {

  //---------------------------------------------------------------------------
  // Build tree. Add some comment blocks to make XML bit more readable.
  // Helps debugging, too.
  //---------------------------------------------------------------------------

  const story = doc.story;

  const root = Element("story", {
    format: "mawe",
    name: story.name,
    uuid: story.uuid,
  });

  root.append(Comment(" ============================================================================= "));
  root.append(Comment(" "));
  root.append(Comment(` STORY: ${story.name} `));
  root.append(Comment(" "));
  root.append(Comment(" ============================================================================= "));

  addBody(root, story.body);

  root.append(Comment(" ============================================================================= "));
  root.append(Comment(" "));
  root.append(Comment(" NOTES "));
  root.append(Comment(" "));
  root.append(Comment(" ============================================================================= "));

  addNotes(root, story.notes);

  root.append(Comment(" ============================================================================= "));
  root.append(Comment(" "));
  root.append(Comment(" VERSIONS "));
  root.append(Comment(" "));
  root.append(Comment(" ============================================================================= "));

  story.versions.forEach(v => addVersion(root, v));

  //---------------------------------------------------------------------------
  // Serialize and write
  //---------------------------------------------------------------------------

  //console.log("save.mawe:", doc.file)
  return buf2file(doc, tree2buf(root));
}

//-----------------------------------------------------------------------------

function js2et(obj) {
  const {id, ...attr} = obj.attr;
  let elem = new Element(obj.tag, attr);
  elem.text = obj.text;
  elem.tail = obj.tail;
  js2et_all(elem, obj.children);
  return elem;
}

function js2et_all(elem, objs) {
  objs.map(js2et).forEach(o => elem.append(o));
}

//-----------------------------------------------------------------------------

function addBody(parent, body) {
  const elem = SubElement(parent, "body");
  addBodyElems(elem, body);
}

function addVersion(parent, version) {
  const elem = SubElement(parent, "version", {
    name: version.name,
    modified: version.modified,
  });
  addBodyElems(elem, version);
}

function addBodyElems(elem, body) {
/*
  elem.append(Comment(" "));
  elem.append(Comment(` STORY: ${story.name} `));
  elem.append(Comment(" "));
*/
  addHead(elem, body.head);

  elem.append(Comment(" ============================================================================= "));

  js2et_all(elem, body.parts);
}

function addHead(parent, head) {
  const elem = SubElement(parent, "head");
  SubElement(elem, "title").text = head.title;
  SubElement(elem, "subtitle").text = head.subtitle;
  SubElement(elem, "nickname").text = head.nickname;
  SubElement(elem, "author").text = head.author;
  SubElement(elem, "translated").text = head.translated;
  SubElement(elem, "status").text = head.status;
  SubElement(elem, "deadline").text = head.deadline;
  SubElement(elem, "covertext").text = head.covertext;
  SubElement(elem, "year").text = head.year;
  const words = SubElement(elem, "words")
  SubElement(words, "text").text = head.words.text;
  SubElement(words, "comments").text = head.words.comments;
  SubElement(words, "missing").text = head.words.missing;
}

function addNotes(parent, notes) {
  const elem = SubElement(parent, "notes");
  js2et_all(elem, notes.parts);
}
