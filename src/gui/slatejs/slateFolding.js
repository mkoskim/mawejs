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

//const foldable = ["chapter", "scene", "synopsis", "comment", "missing"]
const foldable = ["act", "chapter", "scene"]

//-----------------------------------------------------------------------------
// Fold/unfold a node
//-----------------------------------------------------------------------------

export function foldNode(editor, node, path, fold) {

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
// Toggle folding at selection
//-----------------------------------------------------------------------------

export function toggleFold(editor) {
  const { selection } = editor

  if(!selection) return
  if(!Range.isCollapsed(selection)) return

  const { focus } = selection
  //const [node, path] = Editor.node(editor, anchor)
  //console.log("Toggle fold", path, node)

  const [node, path] = Editor.above(editor, {
    at: focus,
    match: n => Element.isElement(n) && (foldable.includes(n.type)),
  })

  const folded = !node.folded
  foldNode(editor, node, path, folded)

  Transforms.select(editor, path)
  Transforms.collapse(editor)
}

//-----------------------------------------------------------------------------
// Fold by node type
//-----------------------------------------------------------------------------

export const FOLD = {
  foldAll: {
    act: true,
    chapter: true,
    scene: true,
    synopsis: true,
    notes: true,
  },
  unfoldAll: {
    act: false,
    chapter: false,
    scene: false,
    synopsis: false,
    notes: false,
  },

  foldChapters: {
    act: false,
    chapter: true,
  },
  unfoldChapters: {
    act: false,
    chapter: false,
  },

  unfoldScenes: {
    act: false,
    chapter: false,
    scene: false,
    synopsis: true,
    notes: true,
  },
  unfoldSynopsis: {
    act: false,
    chapter: false,
    synopsis: false,
    scene: true,
    notes: true,
  },
}

export function foldByType(editor, types) {
  //console.log("Fold by type:", types)

  const matches = Editor.nodes(editor, {
    at: [],
    match: n => {
      if(Editor.isEditor(n)) return false;
      if(!Element.isElement(n)) return false;

      const type = n.type === "scene" ? n.content : n.type

      if(!(type in types)) return false;
      if(n.folded === types[type]) return false
      return true
    }
  })

  Editor.withoutNormalizing(editor, () => {
    for(const [node, path] of matches) {
      const fold = node.type === "scene" ? types[node.content] : types[node.type]
      foldNode(editor, node, path, fold)
    }
  })
}

//-----------------------------------------------------------------------------
// Fold by tags
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
      foldNode(editor, node, path, folded)
    }
  })
}
