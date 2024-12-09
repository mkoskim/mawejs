//*****************************************************************************
//*****************************************************************************
//
// SlateJS DnD
//
//*****************************************************************************
//*****************************************************************************

import {
  Editor,
  Node, Text,
  Transforms,
  Range, Point, Path,
  Element,
} from 'slate'

import {elemHeading, elemTags} from '../../document/util';

import {
  nodeTypes,
} from '../../document/elements';

//-----------------------------------------------------------------------------
// Drag'n'drop ID generation
//-----------------------------------------------------------------------------

export function IDfromPath(sectID, path) {
  return [sectID, ...path].join(".")
}

export function IDappend(ID, index) {
  return [ID, index].join(".")
}

export function IDtoPath(ID) {
  const [sectID, ...path] = ID.split(".")
  return {
    sectID,
    path: path.map(p => parseInt(p)),
  }
}

//-----------------------------------------------------------------------------
// Drag'n'drop pop and push

export function dndDrop(srcEdit, srcPath, dstEdit, dstPath, dstIndex) {
  //console.log("moveElem: SRC=", srcId, "DST=", dstId, dstIndex)

  const node = dndElemPop(srcEdit, srcPath)
  return dndElemPushTo(dstEdit, node, dstPath, dstIndex)
}

function dndElemPop(editor, path) {

  const [node] = Editor.node(editor, path)

  //console.log("Pop:", path, node)

  Transforms.removeNodes(editor, {at: path, hanging: true})

  if(!elemHeading(node)) {
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

function dndElemPushTo(editor, node, path, index) {
  //console.log("Push", node, path, index)

  if(!node) return

  const [container] = Editor.node(editor, path)

  //console.log("Container:", container)

  //---------------------------------------------------------------------------
  // Check if container has head element. If so, add +1 to index
  //---------------------------------------------------------------------------

  function getChildIndex(container) {
    if(!index && elemHeading(container)) return 1
    return index
  }

  const childindex = getChildIndex(container)
  const childpath = [...path, childindex]

  //---------------------------------------------------------------------------
  // Check that elem at drop point has header (prevent merge)
  //---------------------------------------------------------------------------

  if(container.children.length > childindex) {
    const next = container.children[childindex]

    if(!elemHeading(next)) {
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

