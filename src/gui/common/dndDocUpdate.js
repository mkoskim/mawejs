//*****************************************************************************
//*****************************************************************************
//
// Update doc onDragEnd()
//
//*****************************************************************************
//*****************************************************************************

import {wcChildren} from "../../document/util";

export function onDragEndUpdateDoc(doc, updateDoc, result) {
  console.log("onDragEnd:", result)

  return

  const {type, source, destination} = result;
  //console.log(type)

  if(!destination) return;

  if(source.droppableId === destination.droppableId) {
    if(source.index === destination.index) return;
  }

  //console.log(source, "-->", destination)

  function findPart(doc, partID) {
    return (
      doc.story.body.parts.find(part => part.id === partID) ||
      doc.story.notes.parts.find(part => part.id === partID)
    )
  }

  function findSect(doc, sectID) {
    switch(sectID) {
      case "body": return doc.story.body;
      case "notes": return doc.story.notes;
    }
  }

  /*
  function updateSection(section) {
    const parts = section.parts.map(part => ({
      ...part,
      words: wcChildren(part.children)
    }))
    return {
      ...section,
      parts,
      words: wcChildren(parts)
    }
  }

  function updateDoc() {
    updateDoc(doc => {
      doc.story.body = updateSection(doc.story.body)
      doc.story.notes = updateSection(doc.story.notes)
    })
  }
  */

  switch(type) {
    case "scene": {
      const sourcePart = findPart(doc, source.droppableId);
      const destinationPart = findPart(doc, destination.droppableId);

      const scene = sourcePart.children[source.index]
      sourcePart.children.splice(source.index, 1)
      destinationPart.children.splice(destination.index, 0, scene)
      //updateDoc()
      break;
    }
    case "part": {
      const sourceSect = findSect(doc, source.droppableId);
      const destinationSect = findSect(doc, destination.droppableId);

      const part = sourceSect.parts[source.index]
      sourceSect.parts.splice(source.index, 1)
      destinationSect.parts.splice(destination.index, 0, part)
      //updateDoc()
      break;
    }
    default:
      console.log("Unknown draggable type:", type, result)
      break;
  }
}
