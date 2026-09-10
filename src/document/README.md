# Document model

Document structure, loading, saving, migration, analysis, and export belong here.
GUI code should use this layer instead of duplicating format logic.

- `elements.js`: element types and markup definitions.
- `head.js`: document header metadata.
- `nodeutil.js`: structural helpers and word counts.
- `xmljs/`: XML loading, saving, tree handling, and migration.
- [export](export/README.md): output formats.

## Load/save safety: protect the manuscript

A manuscript can represent years of irreplaceable work. Load/save correctness is
critical across the entire flow: GUI callbacks, Slate operations, normalization,
migration, serialization, compression, and file access. A broken in-memory state
can be repaired; saving it over an intact manuscript can cause permanent loss.

- Save the latest document state. A stale React closure can silently lose recent
  edits even when the saved document is otherwise valid.
- Complete conversion, XML serialization, and compression before opening the
  destination for writing. If preparation fails, do not call the writer,
  truncate or replace an existing file, or create a new destination.
- A successful write or valid XML is not enough: the saved document must reopen
  in MaweJS with its content and metadata preserved, including `.mawe.gz`
  roundtrips. Preserve compatibility with existing files and
  [migration examples](../../examples/migration/README.md) unless a format
  change is explicitly intended.
- Never hide structural failures by discarding manuscript content or substituting
  an empty document. Intentional conversion, such as omitting editor control
  nodes, must preserve their intended content and metadata.

Run `npm test` when changing this flow. [Roundtrip tests](../../test/load/roundtrip.test.mjs)
check content preservation; [save tests](../../test/load/save.test.mjs) exercise
`mawe.save()` and `mawe.saveas()` with real temporary files, including gzip.
Their failure cases verify that serialization errors never call the writer,
existing bytes remain intact and loadable, and absent destinations stay absent.
These cases do not prove every malformed tree is rejected: add coverage for
newly affected behavior, including conversions that succeed while losing content.
See also the [load](../../test/load/) and [export](../../test/export/) tests.

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
one. Use helpers such as `nodeHeading()` in `nodeutil.js` instead of fixed offsets.
