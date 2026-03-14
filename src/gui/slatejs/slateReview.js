//*****************************************************************************
//*****************************************************************************
//
// Review style
//
//*****************************************************************************
//*****************************************************************************

import { Editor, Transforms, Range, Element } from "slate"

export function reviewNode(editor, node, path, review) {
  //console.log("Review =", review)
  if((node.review ?? false) === (review ?? false)) return;
  Transforms.setNodes(editor, {review}, {at: path})
}

export function toggleReview(editor) {
  const { selection } = editor

  if(!selection) return
  if(!Range.isCollapsed(selection)) return

  const { focus } = selection
  //const [node, path] = Editor.node(editor, anchor)

  const [node, path] = Editor.above(editor, {
    at: focus,
    match: n => !Editor.isEditor(n) && Element.isElement(n),
  })

  //console.log("Toggle review", path, node)
  const review = !node.review
  reviewNode(editor, node, path, review)
}

export function setReview(editor, review) {
  const matches = Editor.nodes(editor, {
    at: [],
    match: (n, p) => {
      if(Editor.isEditor(n)) return false;
      if(!Element.isElement(n)) return false;

      if(n.type === "p" || n.type === "br" || n.type === "quote") {
        const [parent] = Editor.above(editor, {at: p})
        if(parent.content !== "scene") return false
        return true
      }
      return false
    }
  })

  Editor.withoutNormalizing(editor, () => {
    for(const [node, path] of matches) {
      reviewNode(editor, node, path, review)
    }
  })
}