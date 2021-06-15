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

module.exports = {mawe}

const et = require("elementtree");
const {Element, SubElement, ElementTree, Comment} = et;

const fs = require("../storage/localfs");
const util = require("util");
const zlib = require("zlib");
const gzip = util.promisify(zlib.gzip);

//-----------------------------------------------------------------------------
// Save stories in .mawe format
//-----------------------------------------------------------------------------

async function mawe(file, story, compress) {

  //---------------------------------------------------------------------------
  // Build tree. Add some comment blocks to make XML bit more readable.
  // Helps debugging, too.
  //---------------------------------------------------------------------------

  const root = Element("story", {
    format: story.format,
    name: story.name,
    uuid: story.uuid
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

  const etree = new ElementTree(root);
  const content = etree.write({xml_declaration: false, indent: 0});
  const buffer  = compress ? await gzip(content, {level: 9}) : content;
  fs.write(file, buffer);
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
    modified: Date.now().toString(),
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
