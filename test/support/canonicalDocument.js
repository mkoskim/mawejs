import { nodeIsBreak, nodeIsContainer } from "../../src/document/elements";

export function canonicalDocumentText(doc) {
  return [
    headToText(doc?.head),
    sectionToText("draft", doc?.draft),
    sectionToText("notes", doc?.notes),
    sectionToText("storybook", doc?.storybook),
  ].join("\n");
}

function headToText(head = {}) {
  return [
    "[head]",
    `title=${escapeText(head.title)}`,
    `subtitle=${escapeText(head.subtitle)}`,
    `author=${escapeText(head.author)}`,
    `pseudonym=${escapeText(head.pseudonym)}`,
  ].join("\n");
}

function sectionToText(name, section) {
  const lines = [`[section:${name}]`];

  for (const act of section?.acts ?? []) {
    appendNode(lines, act);
  }

  return lines.join("\n");
}

function appendNode(lines, node) {
  if (!node?.type || nodeIsBreak(node)) {
    return;
  }
  lines.push(nodeToLine(node));

  for (const child of node.children ?? []) {
    appendNode(lines, child);
  }
}

function nodeToLine(node) {
  const parts = [node.type];

  const {numbered, content, folded, name, target, review} = node;

  if (nodeIsContainer(node)) {
    switch(node.type) {
      case "act":
      case "chapter":
        parts.push(`numbered=${numbered}`);
        break;

      case "scene":
        if(content) parts.push(`content=${escapeText(content)}`);
        break;
    }

    if(folded) parts.push(`folded=${folded}`);
    if(target) parts.push(`target=${target}`);
    parts.push(`name=${escapeText(name)}`);
  } else {
    if(review) parts.push(`review=${review}`);
    parts.push(`text=${escapeText(blockText(node))}`);
  }
  return parts.join("|");
}

/*
function isContainer(node) {
  return node.type === "act" || node.type === "chapter" || node.type === "scene";
}

function isCtrlNode(node) {
  return (
    node.type === "hact"
    || node.type === "hchapter"
    || node.type === "hscene"
    || node.type === "hsynopsis"
    || node.type === "hnotes"
  );
}
*/

function blockText(node) {
  return (node.children ?? [])
    .map(child => child.text ?? "")
    .join("");
}

function escapeText(text) {
  return String(text ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n");
}
