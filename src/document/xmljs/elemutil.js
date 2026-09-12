//*****************************************************************************
//
// XML-JS element tree helpers
//
//*****************************************************************************

import {isObject} from "../../util";

//-----------------------------------------------------------------------------
// Element creation
//-----------------------------------------------------------------------------

export function createElem(name, attributes = {}, elements = []) {
  return {
    type: "element",
    name,
    attributes,
    elements
  }
}

export function createText(text, attributes = {}) {
  return {
    type: "text",
    text,
    attributes
  }
}

//-----------------------------------------------------------------------------
// Element text extraction
//-----------------------------------------------------------------------------

export function elem2Text(elem) {
  if (elem.type === "text") return trim(elem.text);
  if (elem.elements) return trim(elem.elements.map(e => elem2Text(e)).join(" "))
  return "";
}

function trim(text) {
  if(typeof text === "string") return text.trim() //.replace(/\s+/gu, ' ')
  return undefined;
}

//-----------------------------------------------------------------------------
// Basic element tree operations
//-----------------------------------------------------------------------------

export function elemMap(elements, fn) {
  if(!elements) return [];
  return elements.map(fn)
}

export function elemFilter(elements, match) {
  if(!elements) return [];
  return elements.filter(e => match(e))
}

export function elemDiscard(elements, match) {
  if(!elements) return [];
  return elements.filter(e => !match(e))
}

//-----------------------------------------------------------------------------
// Element finding & filtering
//-----------------------------------------------------------------------------

export function elemFind(parent, name) {
  if(!parent?.elements) return undefined;
  return parent.elements.find(e => e.type === "element" && e.name === name)
}

export function getElem(parent, name) {
  return elemFind(parent, name) ?? createElem(name)
}

export function elemFindall(parent, name) {
  return elemFilter(parent?.elements, e => e.type === "element" && e.name === name)
}

export function elemIsElem(e) { return e.type === "element"}
export function elemMatchName(e, name) { return e.name === name}

export function elemMatchAttributes(elem, attributes) {
  return Object.entries(attributes).every(([key, value]) => elem.attributes?.[key] === value);
}

// Find matching descendant elements in document order, including root itself.
export function elemFindDeep(root, match) {
  const found = [];

  const matcher = (() => {
    const t = typeof match
    switch(t) {
      case "function": return match
      case "string": return e => elemMatchName(e, match)
      case "object": if(isObject(match)) return e => elemMatchAttributes(e, match)
      default: return
    }
  })()

  function visit(elements = []) {
    for (const elem of elements) {
      if (elem.type !== "element") continue;
      if (matcher(elem)) found.push(elem);
      visit(elem.elements);
    }
  }

  if(matcher && root) visit([root].flat());
  return found;
}

//-----------------------------------------------------------------------------
// Element tree manipulation
//-----------------------------------------------------------------------------

export function removeElements(elements, ...names) {
  return elemDiscard(elements, e => names.includes(e.name))
}

export function replaceElements(elements, names, ...childs) {
  return removeElements(elements, ...names).concat(childs)
}

export function removeChilds(parent, ...names) {
  const {elements = []} = parent
  return {
    ...parent,
    elements: removeElements(elements, ...names)
  }
}

export function replaceChilds(parent, names, ...childs) {
  const {elements = []} = parent
  return {
    ...parent,
    elements: replaceElements(elements, names, ...childs)
  }
}

export function mapChilds(parent, fn) {
  const {elements = []} = parent
  return {
    ...parent,
    elements: elemMap(elements, fn)
  }
}
