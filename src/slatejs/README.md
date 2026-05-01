SlateJS editor
==============

This directory contains the SlateJS integration used by the main MaweJS editor.

The Slate editor is the core editing surface for manuscripts. Changes here can
affect typing, document structure, folding, search, drag-and-drop, rendering,
and save/load compatibility through the document model, so keep changes focused
and test them with real documents when possible.

Main files:

- `slateEditor.js` - editor construction and editor behavior customizations.
  This includes normalization rules and editing behavior such as markup,
  paste handling, nesting fixes, word counts, line breaks, and fold protection.
- `slateEditable.jsx` - React rendering of the editable Slate surface.
- `slateDocument.js` - conversion and document helpers around Slate content.
- `slateHelpers.js` - shared Slate helper functions.
- `slateButtons.jsx` - editor toolbar/button UI.
- `slateMarks.js` - text marks and inline styling behavior.
- `slateFolding.js` - folding support.
- `slateSearch.js` - search support.
- `slateDnD.js` - drag-and-drop support.
- `slateReview.js` - review-related helpers.

The editor buffer represents a nested manuscript structure such as acts,
chapters, scenes, headings, notes, and paragraphs. Preserve this nesting model
when changing normalization or editing behavior.

Control elements
----------------

Read `src/document/README.md` before changing the buffer shape, normalization,
drag-and-drop, folding, focus, load/save, or export-related behavior. The
Slate buffer uses editable control elements (`hact`, `hchapter`, `hscene`) to
represent metadata for acts, chapters, and scenes.

Those control elements are ordinary children in the Slate tree. They may or may
not exist: implicit/default first blocks can omit their headers so writing can
start directly in manuscript text. As a result, child indexes depend on whether
the parent has a header. For example, the first scene in a chapter can be at
index `0` or `1`.

Drag-and-drop and folding are allowed to add a missing header. Folding needs a
visible handle for a folded block, and drag-and-drop needs a structural break
so moved blocks do not merge into neighboring content.

Prefer making document-format changes in `src/document/` and UI-shell changes
outside this directory. Use this directory for Slate-specific editor behavior
and rendering.
