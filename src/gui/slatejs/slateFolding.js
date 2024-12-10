import {
  Editor,
  Range, Node,
  Transforms,
  Element,
} from 'slate'

import { elemHeading, elemTags } from '../../document/util';

import {
  nodeTypes,
} from '../../document/elements';

//-----------------------------------------------------------------------------
// Check, if element is inside folded block

export function elemIsFolded(editor, path) {
  for(const np of Node.levels(editor, path)) {
    const [node, path] = np
    //console.log("Node:", node);
    if(node.folded) return true;
  }
  return false;
}

//*****************************************************************************
//
// Folding
//
//*****************************************************************************

export function foldAll(editor, folded) {

  function getChapters() {
    return Editor.nodes(editor, {
      at: [],
      match: n => Element.isElement(n) && n.type === "chapter"
    })
  }

  function getFolded() {
    return Editor.nodes(editor, {
      at: [],
      match: n => Element.isElement(n) && n.folded
    })
  }

  const matches = folded ? getChapters() : getFolded()

  Editor.withoutNormalizing(editor, () => {
    for(const [node, path] of matches) {
      doFold(editor, node, path, folded)
    }
  })

  if(folded) {
    Transforms.select(editor, [0])
    Transforms.collapse(editor)
  }
}

export function toggleFold(editor) {
  const { selection } = editor

  if(!selection) return
  if(!Range.isCollapsed(selection)) return

  const { anchor } = selection
  //const [node, path] = Editor.node(editor, anchor)
  //console.log("Toggle fold", path, node)

  //const foldable = ["chapter", "scene", "synopsis", "comment", "missing"]
  const foldable = ["act", "chapter", "scene"]

  const [node, path] = Editor.above(editor, {
    at: anchor,
    match: n => Element.isElement(n) && (foldable.includes(n.type)),
  })

  const folded = !node.folded
  doFold(editor, node, path, folded)

  Transforms.select(editor, path)
  Transforms.collapse(editor)
}

//-----------------------------------------------------------------------------

export function doFold(editor, node, path, fold) {

  if((node.folded ?? false) === (fold ?? false)) return;

  if(fold) {
    const head = elemHeading(node)
    if(!head) {
      Transforms.insertNodes(editor,
        {
          type: nodeTypes[node.type].header,
          children: [{text: ""}]
        },
        {at: path.concat([0])}
      )
    }
  }

  Transforms.setNodes(editor, {folded: fold}, {at: path})
}

//-----------------------------------------------------------------------------

export function foldByTags(editor, tags) {
  console.log("FoldByTags:", tags)

  const tagset = new Set(tags)
  var folders = []

  // Go through acts, chapters and scenes
  for(const act of Node.children(editor, [])) {
    const [node, path] = act

    var acttags = new Set()

    for(const chapter of Node.children(editor, path))
    {
      const [node, path] = chapter

      if(node.type !== "chapter") continue

      var chaptertags = new Set()

      // Go through scenes
      for(const scene of Node.children(editor, path)) {
        const [node, path] = scene
        if(node.type !== "scene") continue

        const scenetags = new Set()

        // Go through blocks and get tags
        for(const elem of Node.children(editor, path)) {
          const [node, path] = elem

          for(const key of elemTags(node)) {
            scenetags.add(key)
          }
        }

        const hastags = tagset.intersection(scenetags).size > 0
        folders.push({node, path, folded: !hastags})
        //console.log("Scene:", path, node.type, hastags, scenetags);

        chaptertags = chaptertags.union(scenetags)
      }

      const hastags = tagset.intersection(chaptertags).size > 0
      folders.push({node, path, folded: !hastags})

      acttags = acttags.union(chaptertags)

      //console.log("Chapter:", path, node.type, hastags, chaptertags);
    }

    const hastags = tagset.intersection(acttags).size > 0
    folders.push({node, path, folded: !hastags})
  }

  Editor.withoutNormalizing(editor, () => {
    for(const {node, path, folded} of folders) {
      doFold(editor, node, path, folded)
    }
  })
}
