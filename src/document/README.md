Document model, load, save, and export
--------------------------------------

This directory contains document-level logic for MaweJS stories.

Use this area for code that works with the document model itself: loading,
saving, migration, export, structural utilities, and document analysis. GUI
code should call into this layer instead of duplicating document-format logic.

Important areas:

- `elements.js` - document element types and markup definitions.
- `head.js` - document header metadata.
- `util.js` - document utility functions used by GUI and editor code.
- `xmljs/` - XML-based loading, saving, tree handling, and migration.
- `export/` - exporting documents to external formats.

Be careful with compatibility when changing document loading, saving, or
migration code. Existing `.mawe` files and migration examples should keep
working unless the task explicitly changes the format.

Control elements and editable metadata
--------------------------------------

MaweJS stores manuscripts in a Slate-compatible tree. This affects the
document model itself, not only the editor UI: anything that must be editable
inside Slate has to be represented as a node with editable text leaves under
`children`.

Acts, chapters, and scenes have metadata such as name, target word count,
folded state, and numbering state. That metadata cannot be edited directly as
plain object attributes inside Slate. Instead, editable metadata is represented
with control elements:

- `hact` for act metadata.
- `hchapter` for chapter metadata.
- `hscene` for scene metadata.

These header/control elements are children of the block they describe. For
example, a named chapter is shaped like this:

```text
chapter
  hchapter
  scene
  scene
```

This shape is intentional. The header is both an editable Slate block and a
structural break between containers. Normalization code keeps the control
element and the container attributes in sync, and headers can also be generated
from container attributes when needed.

Do not assume every container has a header. The first implicit/default act,
chapter, or scene may omit its header so a new document can start directly in
the manuscript text. A header is added when it is needed for editable metadata,
folding, drag-and-drop, or another structural operation.

This means child indexes are not always content indexes. If a container has a
header, its first content block is at child index `1`; without a header, it is
at child index `0`. Code that moves through acts, chapters, scenes, or
paragraphs should use document helpers such as `elemHeading()` instead of
assuming fixed offsets.
