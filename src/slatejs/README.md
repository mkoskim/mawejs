# Slate editor

Main manuscript editing surface. Keep behavior changes focused: they can affect
typing, paste, normalization, folding, search, drag-and-drop, and save/load.

- `slateEditor.js`: editor construction, normalization, and editing behavior.
- `slateEditable.jsx`: editable surface rendering.
- `slateDocument.js`, `slateHelpers.js`: conversion and shared helpers.
- `slateFolding.js`, `slateSearch.js`, `slateDnD.js`: folding, search, and drag-and-drop.
- `slateMarks.js`, `slateReview.js`, `slateButtons.jsx`: marks, review, and toolbar UI.

Before changing structure, normalization, folding, drag-and-drop, focus, or
load/save behavior, read the [document model](../document/README.md), especially
its optional control elements. Check `elements.js` and `util.js` there for
nesting, headings, element types, and word counts.

Preserve the nested manuscript model. Document-format changes belong in
`src/document/`; UI-shell changes belong in `src/gui/`.

Run `npm run test:slate` for editor changes and load/export tests when relevant
(see [development](../../README.md#development)). Check affected interactions
with real [.mawe examples](../../examples/README.md).
