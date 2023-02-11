//-----------------------------------------------------------------------------
// Loading (temporary)
//-----------------------------------------------------------------------------

import { mawe } from "../../document";
import {fstat} from "../../system/localfs";

var docs = {}

function docByID(id) {
  //console.log("docByID:", id)
  //console.log("Docs:", docs)
  return docs[id]
}

export function docUpdate(doc) {
  //console.log("Update:", doc.file.id, doc.story.name, doc)
  docs[doc.file.id] = doc
}

export async function docLoad(filename) {
  const file = await fstat(filename);

  console.log("docLoad:", file);

  const {id} = file;

  if(id in docs) {
    console.log("- Already loaded.")
    return docs[id]
  }

  console.log("- Loading...")
  try {
    const content = await mawe.load(file)
    docUpdate(content);
    //dispatch(docAction.loaded({file}))
    console.log("- Loaded", content)
    return content;
  }
  catch(err) {
    console.log(err)
  }
}

export function docSave(doc) {
  //docUpdate(doc)
  mawe.save(docs[doc.file.id])
}
