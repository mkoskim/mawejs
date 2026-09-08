import { nodeIsCtrl, nodeIsContainer } from "../../src/document/elements";
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
    `name=${doc.head?.name ?? ""}`,
  ].join("\n");
}

function headToText(head = {}) {
  return [
    "[head]",
    `title=${head.title ?? ""}`,
    `subtitle=${head.subtitle ?? ""}`,
    `author=${head.author ?? ""}`,
    `pseudonym=${head.pseudonym ?? ""}`,
  ].join("\n");
}

function sectionToText(name, section) {
  const nodes = nodeFindDeep(section?.acts, node => !nodeIsCtrl(node));
  return [`[section:${name ?? ""}]`, ...nodes.map(nodeToLine)].join("\n");
}

function nodeToLine(node) {
  const parts = [node.type];

  const {numbered, content, folded, name, target, review} = node;

  if (nodeIsContainer(node)) {
    if(numbered === false) parts.push(`numbered=${numbered}`);
    if(content) parts.push(`content=${content}`);
    if(folded) parts.push(`folded=${folded}`);
    if(target) parts.push(`target=${target}`);
    parts.push(`name=${name ?? ""}`);
  } else {
    if(review) parts.push(`review=${review}`);
    parts.push(`text=${nodeAsText(node)}`);
  }
  return parts.join("|");
}
