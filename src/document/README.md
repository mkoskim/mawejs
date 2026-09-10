# Document model

Document structure, loading, saving, migration, analysis, and export belong here.
GUI code should use this layer instead of duplicating format logic.

- `elements.js`: element types and markup definitions.
- `head.js`: document header metadata.
- `util.js`: structural helpers and word counts.
- `xmljs/`: XML loading, saving, tree handling, and migration.
- [export](export/README.md): output formats.

Preserve compatibility with existing `.mawe` files unless a format change is
explicitly intended. Use `npm run test:load`, `npm run test:export`, and
[migration examples](../../examples/migration/README.md) as appropriate.

## Editable metadata and control elements

The manuscript is a nested Slate-compatible tree of acts, chapters, scenes,
headings, notes, and paragraphs. Editable metadata needs nodes with text leaves
under `children`, rather than only plain container attributes.

`hact`, `hchapter`, and `hscene` represent act, chapter, and scene metadata
(name, target word count, folding, and numbering). These control elements are
children of their containers and act as structural breaks:

```text
chapter
  hchapter
  scene
  scene
```

Normalization synchronizes control elements with container attributes; headers
can also be generated from those attributes.

**Headers are optional.** Implicit/default first blocks may omit them so writing
can start directly in manuscript text. Folding may add a header as a visible
handle; drag-and-drop may add one to prevent neighboring blocks from merging.

The first content child is therefore at index `0` without a header or `1` with
one. Use helpers such as `elemHeading()` in `util.js` instead of fixed offsets.
