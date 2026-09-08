import assert from "node:assert";
import { nodeTypes, nodeIsBreak, nodeIsNotBreak } from "../../src/document/elements.js";

//-----------------------------------------------------------------------------
// SlateJS/node section validation
//-----------------------------------------------------------------------------

export function validateSection(section) {
  assert.ok(section.length > 0, "Empty section.")
  for(const [index, node] of section.entries()) {
    //console.log(index, node)
    validateChild(undefined, node)
    validateAct(node, !index)
  }
  return section
}

//-----------------------------------------------------------------------------

function validateNode(node) {
  const {type} = node
  //console.log("Parent:", parent)
  //console.log("Node type:", type)
  assert.ok(type in nodeTypes, `${type}: Not in nodeTypes`)
}

function validateChild(parent, child) {
  assert.ok(child.type, `${parent?.type}: Invalid child: ${child.type}`)
  assert.equal(parent?.type, nodeTypes[child.type].parent, `${parent?.type}: Invalid child: ${child.type}`)
}

//-----------------------------------------------------------------------------
// Break validation. Break is optional, if:
// 1. Parent is first element in its own container,
// 2. Parent attributes (name, target etc) equal to default values: no need to
//    check here, we do it in editor normalize() tests.
//-----------------------------------------------------------------------------

function validateBreak(parent, isFirst) {
  const {type, children} = parent
  const [first, ...rest] = children
  if(isFirst && nodeIsNotBreak(first)) return children
  assert(nodeIsBreak(first), `${type}: Non-first container missing break.`)
  validateNode(first)
  validateChild(parent, first)
  validateParagraph(first)
  return rest
}

//-----------------------------------------------------------------------------

function validateAct(node, isFirst) {
  validateNode(node)

  const {type} = node

  assert.equal(type, "act")

  const children = validateBreak(node, isFirst)

  for(const [index, child] of children.entries()) {
    assert.ok(nodeIsNotBreak(child), `${node.type}: Misplaced break: ${child.type}`)
    validateChild(node, child)
    validateChapter(child, !index)
  }
}

function validateChapter(node, isFirst) {
  validateNode(node)

  const {type} = node

  assert.equal(type, "chapter")

  const children = validateBreak(node, isFirst)

  for(const [index, child] of children.entries()) {
    assert.ok(nodeIsNotBreak(child), `${node.type}: Misplaced break: ${child.type}`)
    validateChild(node, child)
    validateScene(child, !index)
  }
}

function validateScene(node, isFirst) {
  validateNode(node)

  const {type} = node

  assert.equal(type, "scene")

  const children = validateBreak(node, isFirst)

  for(const child of children) {
    //console.log("Scene:", scene, "Child:", paragraph)
    assert.ok(nodeIsNotBreak(child), `${node.type}: Misplaced break: ${child.type}`)
    validateChild(node, child)
    validateParagraph(child)
  }
}

function validateParagraph(node) {
  validateNode(node)

  const {type, children} = node

  assert.ok(children.length, `${node.type}: Empty paragraph.`)

  for(const child of children) {
    validateText(child)
  }
}

function validateText(node) {
  const {type, text} = node
  assert.equal(type, undefined, `${type}: Not a leaf.`)
  assert.equal(typeof text, "string", "Text should be string.")
}
