//*****************************************************************************
//*****************************************************************************
//
// Save stories
//
//*****************************************************************************
//*****************************************************************************

const et = require("elementtree");
const {Element, SubElement, ElementTree, Comment} = et;

const fs = require("../storage/localfs");
const util = require("util");
const zlib = require("zlib");
const gzip = util.promisify(zlib.gzip);

export async function mawe(file, story, compress) {

  const root = Element("story", {
    format: story.format,
    name: story.name,
    uuid: story.uuid
  });
  console.log(root);

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

  const etree = new ElementTree(root);
  const content = etree.write({xml_declaration: false, indent: 0});
  const buffer  = compress ? await gzip(content, {level: 9}) : content;
  fs.write(file, buffer);
}

function js2et(obj) {
  let elem = new Element(obj.tag, obj.attr);
  elem.text = obj.text;
  elem.tail = obj.tail;
  if(obj.children) obj.children.forEach(child => {
    elem.append(js2et(child));
  })
  return elem;
}

function js2et_all(elem, objs)
{
  return objs.forEach(o => elem.append(js2et(o)));
}

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
  //elem.append(Comment(" ============================================================================= "));
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
