//*****************************************************************************
//
// XML-JS element tree helpers
//
//*****************************************************************************

export function elemFind(parent, name) {
  if(!parent?.elements) return undefined;
  return parent.elements.find(e => e.type === "element" && e.name === name)
}

export function elemFindall(parent, name) {
  if(!parent?.elements) return []
  return parent.elements.filter(e => e.type === "element" && e.name === name)
}

export function elem2Text(elem) {
  if (elem.type === "text") return trim(elem.text);
  if (elem.elements) return trim(elem.elements.map(e => elem2Text(e)).join(" "))
  return "";
}

function trim(text) {
  if(typeof text === "string") return text.trim() //.replace(/\s+/gu, ' ')
  return undefined;
}
