import {
  Editor,
  Range, Node,
  Transforms,
  Element,
} from 'slate'

import { elemHeading, elemTags, filterCtrlElems } from '../../document/util';

import {
  nodeIsBreak,
  nodeTypes,
  nodeUnfolded,
} from '../../document/elements';
import { focusByPath } from './slateHelpers';

//-----------------------------------------------------------------------------
// Check, if element is inside folded block

/*
export function elemIsFolded(editor, path) {
  for(const np of Node.levels(editor, path)) {
    const [node, path] = np
    if(Editor.isEditor(node)) continue
    const {foldable} = nodeTypes[node.type]
    if(!foldable) break
    if(node.folded) return true;
  }
  return false;
}

function setCursor(editor) {
  Transforms.collapse(editor)
  const {selection} = editor;
  if(!selection) return
  const {focus} = selection;
  if(!focus) return;

  for(const np of Node.levels(editor, focus.path)) {
    const [node, path] = np
    if(Editor.isEditor(node)) continue

    const {foldable} = nodeTypes[node.type]
    if(!foldable) break
    if(node.folded) {
      Transforms.select(editor, Editor.start(editor, path))
      //focusByPath(editor, path)
      return
    }
  }
}
*/

//*****************************************************************************
//
// Folding
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Fold/unfold a node
//-----------------------------------------------------------------------------

export function foldNode(editor, node, path, fold) {

  if((node.folded ?? false) === (fold ?? false)) return;

  // Do folding / unfolding

  editor.withoutNormalizing(() => {
    if(fold) {
      const head = elemHeading(node) ?? {type: nodeTypes[node.type].header, children: [{text: ""}]}
      const {children} = node
      Transforms.removeNodes(editor, {at: path})
      Transforms.insertNodes(editor,
        {...node, folded: true, data: children, children: [head]},
        {at: path}
      )
    } else {
      const {data} = node
      Transforms.removeNodes(editor, {at: path})
      Transforms.insertNodes(editor,
        {...node, folded: false, data: undefined, children: data},
        {at: path}
      )
    }
  })
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
    match: n => !Editor.isEditor(n) && Element.isElement(n) && nodeTypes[n.type].foldable,
  })

  const folded = !node.folded
  foldNode(editor, node, path, folded)
  Transforms.select(editor, editor.start(path))
  //setCursor(editor)
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

  //Editor.withoutNormalizing(editor, () => {
    for(const [aindex, act] of editor.children.entries()) {
      const fold = types[act.type]
      foldNode(editor, act, [aindex], fold)
      if(fold) continue

      for(const [cindex, chapter] of nodeUnfolded(act).entries()) {
        if(nodeIsBreak(chapter)) continue
        const fold = types[chapter.type]
        foldNode(editor, chapter, [aindex, cindex], fold)
        if(fold) continue

        for(const [sindex, scene] of nodeUnfolded(chapter).entries()) {
          if(nodeIsBreak(scene)) continue
          foldNode(editor, scene, [aindex, cindex, sindex], types[scene.content])
        }
      }
    }
  //})

  Transforms.select(editor, Editor.start(editor, []))
  /*
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

  setCursor(editor)
*/
}

//-----------------------------------------------------------------------------
// Fold by tags
//-----------------------------------------------------------------------------

export function foldByTags(editor, tags) {
  console.log("FoldByTags:", tags)

  /*
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
  */
}
