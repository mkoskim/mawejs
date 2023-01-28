//-----------------------------------------------------------------------------
// Loading (temporary)
//-----------------------------------------------------------------------------

import { mawe } from "../../document";

var docs = {}

export function docByID(id) {
  //console.log("docByID:", id)
  //console.log("Docs:", docs)
  return docs[id]
}

export function docUpdate(id, content) {
  docs[id] = content
}

export async function docLoad(file) {
  console.log("docLoad:", file);
  const {id} = file;

  if(id in docs) return docs[id]

  console.log("docLoad: Loading:", file)
  try {
    const content = await mawe.load(file)
    docs[id] = content;
    //dispatch(docAction.loaded({file}))
    console.log("docLoad: Loaded", content)
    return content;
  }
  catch(err) {
    console.log(err)
  }
}

export function docSave(doc) {
  mawe.save(doc)
}
