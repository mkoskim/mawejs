//-----------------------------------------------------------------------------
// Node tree building helpers
//-----------------------------------------------------------------------------

import { nodeIsContainer, nodeTypes } from "../../src/document/elements.js";
import { nodeAsText } from "../../src/document/nodeutil.js";
import { isObject, isArray } from "../../src/util/generic.js";
export { validateSection } from "./validateSection.js";

//-----------------------------------------------------------------------------
// Node creation
//-----------------------------------------------------------------------------

export function createSection(children) {
  return children
}

export function createAct(header, children, extra) {
  const [attributes, content = []] = isObject(children) ? [children, extra] : [{}, children]
  return {
    type: "act",
    ...attributes,
    children: [
      ...(header ? [createParagraph("hact", header)] : []),
      ...content
    ],
  };
}

export function createChapter(header, children, extra) {
  const [attributes, content = []] = isObject(children) ? [children, extra] : [{}, children]
  return {
    type: "chapter",
    ...attributes,
    children: [
      ...(header ? [createParagraph("hchapter", header)] : []),
      ...content
    ],
  };
}

export function createScene(header, text, extra) {
  const [attributes, content = "Text"] = isObject(text) ? [text, extra] : [{}, text]
  const children = isArray(content) ? content : [createParagraph("p", content)]

  return {
    type: "scene",
    ...attributes,
    children: [
      ...(header ? [createParagraph("hscene", header)] : []),
      ...children
    ],
  };
}

export function createParagraph(type, text) {
  const children = isArray(text) ? text : [createText(text)]
  return { type, children}
}

export function createText(text) {
  return {text}
}

//-----------------------------------------------------------------------------
// Generating lists for test validation
//-----------------------------------------------------------------------------

function nodeMatchType(node, type) { return node.type === type}
function nodeMatchAttributes(node, attributes) {
  return Object.entries(attributes).every(([key, value]) => node?.[key] === value);
}
function nodeMatchContainers(node) {
  return nodeIsContainer(node)
}
function nodeMatchNoncontainers(node) {
  return !nodeIsContainer(node)
}

export function nodeFindDeep(root, match) {
  const found = [];

  const matcher = (() => {
    const t = typeof match
    switch(t) {
      case "function": return match
      case "string": return e => nodeMatchType(e, match)
      case "object": if(isObject(match)) return e => nodeMatchAttributes(e, match)
      case "undefined": return e => true
      default: return
    }
  })()

  function visit(nodes = []) {
    for (const node of nodes) {
      if(!(node.type in nodeTypes)) continue
      if(matcher(node)) found.push(node);
      visit(node.children);
    }
  }

  if(matcher && root) visit([root].flat());
  return found;
}

//-----------------------------------------------------------------------------
// Generating lists for test validation
//-----------------------------------------------------------------------------

export function treeToNodes(nodes) {
  const found = nodeFindDeep(nodes)
  return found.map(node => `${node.type}: ${nodeIsContainer(node) ? node.name : nodeAsText(node)}`)
}

export function treeToParagraphs(nodes) {
  const found = nodeFindDeep(nodes, nodeMatchNoncontainers)
  return found.map(node => `${node.type}: ${nodeAsText(node)}`)
}

export function treeToContainers(nodes) {
  const found = nodeFindDeep(nodes, nodeMatchContainers)
  return found.map(node => `${node.type}: ${node.name}`)
}
