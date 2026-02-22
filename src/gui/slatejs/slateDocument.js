//*****************************************************************************
//
// Document load & save
//
//*****************************************************************************

import { mawe } from "../../document"

export function loadDocument(filename) {
  return mawe.load(filename);
}

export function createDocument(buffer) {
  return mawe.create(buffer);
}

export function saveDocument(doc) {
  return mawe.save(doc)
}

export function saveDocumentAs(doc, filename) {
  return mawe.saveas(doc, filename)
}

export function renameDocument(file, to) {
  return mawe.rename(file, to)
}

export function decodeBuffer(buffer) {
  return mawe.decodebuf(buffer);
}

export function documentInfo(doc) {
  return mawe.info(doc);
}
