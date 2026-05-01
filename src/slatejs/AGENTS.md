# AGENTS.md

Guidance for AI coding assistants working in this directory.

This is the SlateJS integration for the main MaweJS editor. Treat it as a
high-risk area: small changes can affect typing, paste behavior, normalization,
folding, search, drag-and-drop, rendering, and save/load behavior through the
document model.

Before changing editor behavior:

- Read `src/slatejs/README.md`.
- Check `src/document/elements.js` and `src/document/util.js` when touching
  document structure, element types, headings, nesting, or word counts.
- Preserve the nested manuscript model used by the editor: acts, chapters,
  scenes, headings, notes, and paragraphs.
- Keep document-format changes in `src/document/` unless the task is truly
  Slate-specific.

Prefer focused changes and test with real `.mawe` example files when behavior
could affect editing, load/save, or export.
