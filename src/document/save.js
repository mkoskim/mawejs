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

import {tree2buf, buf2file} from "./util.js";
import {Element, SubElement, Comment} from "elementtree";

//-----------------------------------------------------------------------------
// Save stories in .mawe format
//-----------------------------------------------------------------------------

export async function mawe(doc) {

  //---------------------------------------------------------------------------
  // Build tree. Add some comment blocks to make XML bit more readable.
  // Helps debugging, too.
  //---------------------------------------------------------------------------

  const story = doc.story;

  const root = Element("story", {
    format: "mawe",
    name: story.name,
    uuid: story.uuid,
    ...story.extra,
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

  story.version.forEach(v => addVersion(root, v));

  root.append(Comment(" ============================================================================= "));
  root.append(Comment(" "));
  root.append(Comment(" EXTRAS "));
  root.append(Comment(" "));
  root.append(Comment(" ============================================================================= "));

  js2et_all(root, story.extra);

  //---------------------------------------------------------------------------
  // Serialize and write
  //---------------------------------------------------------------------------

  //console.log("save.mawe:", doc.file)
  return buf2file(doc.file, tree2buf(root), doc.compress);
}

//-----------------------------------------------------------------------------

function js2et(obj) {
  let elem = new Element(obj.tag, obj.attr);
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
  const elem = SubElement(parent, "body", {
    name: body.name,
  });
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
  addHead(elem, body.head);
  js2et_all(elem, body.part);
  js2et_all(elem, body.extra);
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

  js2et_all(elem, head.extra);
}

function addNotes(parent, notes) {
  const elem = SubElement(parent, "notes");
  js2et_all(elem, notes.part);
  js2et_all(elem, notes.extra);
}
