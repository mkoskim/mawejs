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
its load/save safety requirements and optional control elements. Check `elements.js` and `nodeutil.js` there for
nesting, headings, element types, and word counts.

Preserve the nested manuscript model. Document-format changes belong in
`src/document/`; UI-shell changes belong in `src/gui/`.

Run `npm test` for editor changes; see the [Slate](../../test/slate/),
[load](../../test/load/), and [export](../../test/export/) tests for relevant
coverage. Check affected interactions
with real [.mawe examples](../../examples/README.md).
