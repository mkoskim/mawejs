Document model, load, save, and export
--------------------------------------

This directory contains document-level logic for MaweJS stories.

Use this area for code that works with the document model itself: loading, saving, migration, export, structural utilities, and document analysis. GUI code should call into this layer instead of duplicating document-format logic.

Important areas:

- `elements.js` - document element types and markup definitions.
- `head.js` - document header metadata.
- `util.js` - document utility functions used by GUI and editor code.
- `xmljs/` - XML-based loading, saving, tree handling, and migration.
- `export/` - exporting documents to external formats.

Be careful with compatibility when changing document loading, saving, or migration code. Existing `.mawe` files and migration examples should keep working unless the task explicitly changes the format.

Load/save safety: protect the manuscript
--------------------------------------

A manuscript can represent months or years of irreplaceable work. Treat load
and save correctness as a data-preservation requirement across the entire
application, including GUI callbacks, Slate operations, normalization, migration,
serialization, compression and file access.

A loading or editing bug may produce a broken tree, display incorrect content,
or crash the GUI. As long as the stored manuscript remains intact, that bug can
be fixed and the file loaded again. The critical escalation is allowing that
broken in-memory state to overwrite the manuscript with corrupt, incomplete or
unreadable content. That can turn a recoverable software bug into the permanent
loss of years of writing.

A successful file write is not sufficient evidence of a successful save. The
saved content must be readable by MaweJS and preserve the manuscript. Even valid
XML can be unusable or silently omit text. Serialization completing without an
exception does not, by itself, prove that the source tree was valid.

Preserve these requirements when changing any part of the document flow:

- Save the latest document state. A stale React closure can pass an old, otherwise
  valid document to the saver and silently lose recent edits.
- Complete document conversion, XML serialization and any compression before
  opening the destination for writing. If preparation throws, do not call the
  file writer, truncate or replace an existing file, or create a new destination.
- Preserve content through save/load roundtrips, including `.mawe.gz` compression
  and decompression, and retain compatibility with existing migration examples.
- Do not hide structural failures by silently discarding manuscript content or
  substituting an empty document merely to let saving succeed. Deliberate format
  handling, such as omitting editor control nodes, must preserve their intended
  content and metadata.

The tests in `test/load/` protect complementary parts of this contract:

- Roundtrip tests check that serialized documents can be loaded back with the
  expected content.
- Save tests exercise `mawe.save()` and `mawe.saveas()` through actual temporary
  files, including compressed files, and verify the loaded result.
- Save failure tests deliberately break trees, assert that serialization throws,
  and verify that the file writer is never called, existing bytes remain intact
  and loadable, and an absent destination remains absent.

These failure tests cover the deliberately exercised exceptions; they do not
prove that every malformed tree is rejected. When changing structural handling,
consider both failure modes: an exception before writing and a conversion that
succeeds while losing or corrupting content. Run the relevant load, roundtrip
and save tests, and add cases for newly affected behavior.

Control elements and editable metadata
--------------------------------------

MaweJS stores manuscripts in a Slate-compatible tree. This affects the document model itself, not only the editor UI: anything that must be editable inside Slate has to be represented as a node with editable text leaves under `children`.

Acts, chapters, and scenes have metadata such as name, target word count, folded state, and numbering state. That metadata cannot be edited directly as plain object attributes inside Slate. Instead, editable metadata is represented with control elements:

- `hact` for act metadata.
- `hchapter` for chapter metadata.
- `hscene` for scene metadata.

These header/control elements are children of the block they describe. For example, a named chapter is shaped like this:

```text
chapter
  hchapter
  scene
  scene
```

This shape is intentional. The header is both an editable Slate block and a structural break between containers. Normalization code keeps the control node and the container attributes in sync, and headers can also be generated from container attributes when needed.

Do not assume every container has a header. The first implicit/default act, chapter, or scene may omit its header so a new document can start directly in the manuscript text. A header is added when it is needed for editable metadata, folding, drag-and-drop, or another structural operation.

This means child indexes are not always content indexes. If a container has a header, its first content block is at child index `1`; without a header, it is at child index `0`. Code that moves through acts, chapters, scenes, or paragraphs should use document helpers such as `nodeHeading()` instead of assuming fixed offsets.
