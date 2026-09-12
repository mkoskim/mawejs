import { nodeIsCtrl, nodeIsContainer } from "../../src/document/elements";
import { textEscape } from "../../src/document/export/util";
import { nodeAsText } from "../../src/document/nodeutil";
import { nodeFindDeep } from "./nodetree.mjs";

export function canonicalDocumentText(doc) {
  return [
    storyToText(doc),
    headToText(doc?.head),
    sectionToText("draft", doc?.draft),
    sectionToText("notes", doc?.notes),
    sectionToText("storybook", doc?.storybook),
  ].join("\n");
}

function storyToText(doc = {}) {
  return [
    "[story]",
    `name=${escape(doc.head?.name ?? "")}`,
  ].join("\n");
}

function headToText(head = {}) {
  return [
    "[head]",
    `title=${escape(head.title ?? "")}`,
    `subtitle=${escape(head.subtitle ?? "")}`,
    `author=${escape(head.author ?? "")}`,
    `pseudonym=${escape(head.pseudonym ?? "")}`,
  ].join("\n");
}

function sectionToText(name, section) {
  const nodes = nodeFindDeep(section?.acts, node => !nodeIsCtrl(node));
  return [`[section:${escape(name ?? "")}]`, ...nodes.map(nodeToLine)].join("\n");
}

function nodeToLine(node) {
  const parts = [node.type];

  const {numbered, content, folded, name, target, review} = node;

  if (nodeIsContainer(node)) {
    if(numbered === false) parts.push(`numbered=${numbered}`);
    if(content) parts.push(`content=${content}`);
    if(folded) parts.push(`folded=${folded}`);
    if(target) parts.push(`target=${target}`);
    parts.push(`name=${escape(name) ?? ""}`);
  } else {
    if(review) parts.push(`review=${review}`);
    parts.push(`text=${escape(nodeAsText(node))}`);
  }
  return parts.join("|");
}

function escape(text) {
  return textEscape(text, {
    "\\": "\\\\",
    "\n": "\\n",
  })
}