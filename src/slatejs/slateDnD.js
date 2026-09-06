//*****************************************************************************
//*****************************************************************************
//
// SlateJS DnD
//
//*****************************************************************************
//*****************************************************************************

import {
  Editor,
  Transforms,
} from 'slate'

import {nodeHeading, IDtoPath, nodeID} from '../document/nodeutil';

import {
  nodeTypes,
} from '../document/elements';
import { getEditorBySectID } from './slateDocument';

//-----------------------------------------------------------------------------
// Drag'n'drop pop and push

export function dndDrop(srcEdit, srcPath, dstEdit, dstPath, dstIndex) {
  //console.log("dndDrop: SRC=", srcId, "DST=", dstId, dstIndex)

  const node = dndNodePop(srcEdit, srcPath)
  const path = dndNodePushTo(dstEdit, node, dstPath, dstIndex)
  setSelection(dstEdit, path)
  return path
}

export function handlePangeaDragEnd(editors, result) {
  const {type, draggableId, source, destination} = result;

  if(!destination) return;

  if(source.droppableId === destination.droppableId) {
    if(source.index === destination.index) return;
  }

  switch(type) {
    case "act":
    case "chapter":
    case "scene": {
      const {sectID: srcSectID, path: srcPath} = IDtoPath(draggableId)
      const {sectID: dstSectID, path: dstPath} = IDtoPath(destination.droppableId)
      const srcEdit = getEditorBySectID(editors, srcSectID)
      const dstEdit = getEditorBySectID(editors, dstSectID)

      if(!srcEdit || !dstEdit) return;

      const droppedPath = dndDrop(srcEdit, srcPath, dstEdit, dstPath ?? [], destination.index)
      return droppedPath ? nodeID(dstSectID, droppedPath) : undefined;
    }

    default:
      console.log("Unknown draggable type:", type, result)
      break;
  }
}

function setSelection(editor, path) {
  Transforms.select(editor, path)
  Transforms.collapse(editor)
}

function dndNodePop(editor, path) {

  const [node] = Editor.node(editor, path)

  //console.log("Pop:", path, node)

  Transforms.removeNodes(editor, {at: path, hanging: true})

  if(!nodeHeading(node)) {
    const htype = nodeTypes[node.type].header
    return {
      ...node,
      children: [
        {type: htype, children: [{text: ""}]},
        ...node.children
      ]
    }
  }

  return node
}

function dndNodePushTo(editor, node, path, index) {
  //console.log("Push", node, path, index)

  if(!node) return

  const [container] = Editor.node(editor, path)

  //console.log("Container:", container)

  //---------------------------------------------------------------------------
  // Check if container has head node. If so, add +1 to index
  //---------------------------------------------------------------------------

  function getChildIndex(container) {
    if(!index && nodeHeading(container)) return 1
    return index
  }

  const childindex = getChildIndex(container)
  const childpath = [...path, childindex]

  //---------------------------------------------------------------------------
  // Check that node at drop point has header (prevent merge)
  //---------------------------------------------------------------------------

  if(container.children.length > childindex) {
    const next = container.children[childindex]

    if(!nodeHeading(next)) {
      const htype = nodeTypes[next.type].header
      Transforms.insertNodes(editor,
        {
          type: htype,
          children: [{text: ""}]
        },
        {at: [...childpath, 0]}
      )
    }
  }

  //console.log("Index at:", [...ppath, index])
  //console.log("Insert at:", childpath)
  Transforms.insertNodes(editor, node, {at: childpath})
  return childpath
}
