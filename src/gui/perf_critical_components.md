# Performance-critical components

Scope: `App` with a document open and the editor view selected, including
conditional menus, dialogs, and right-panel alternatives. Other main views and
`WithoutDoc` are excluded. This is a source-level map of possible render branches,
not a measurement of mounted instances or renders per keystroke.

## Typing update path

In [slateDocument.js](../slatejs/slateDocument.js), `bindEditors()` calls
`bindEditor()`, which installs `editor.onChange` to call `updateSection()`.
AST changes update section content and word counts; other editor changes still
update `doc.track`. Both use `updateDoc()`:

```text
Typing → Slate change → editor.onChange → updateSection → updateDoc
       → App's doc state → surrounding UI and editor render tree
```

When top-level state changes, React renders `App` and reconciles its descendants.
Work in sibling toolbars, indexes, buttons, and labels can therefore affect typing
response even without directly modifying the Slate buffer. Preserve memoization,
stable references, and other bailouts: not every component renders on every change.

## DocIndex: do not defer rendering

Keep both indexes in sync with their current structure. Wrapping `DocIndex` in
`DeferredRender` or passing it a deferred index tree breaks drag-and-drop.
This restriction concerns index structure; auxiliary calculations such as
word-count formatting may still use deferred values.

## Main render branches

Layout wrappers and many controls are omitted; both indexes reuse `DocIndex`.

```text
App
├─ View
│  ├─ DocBar → WithDoc
│  │  ├─ FileMenu → RecentItems
│  │  ├─ ViewSelectButtons
│  │  ├─ OpenFolderButton, HeadInfo, word/character counters
│  │  └─ HelpButton
│  └─ ViewSwitch → EditView
│     ├─ LeftPanel
│     │  ├─ LeftPanelMenu
│     │  └─ ShowIndices → SectionIndex → DocIndex
│     ├─ EditorBox
│     │  ├─ FoldButtons, StyleButtons, Searching, ReviewButtons
│     │  └─ Slate → SlateEditable → Editable
│     └─ RightPanel
│        ├─ ChooseRightPanel
│        └─ RightPanelContent
│           ├─ ShowIndices → SectionIndex → DocIndex
│           ├─ WordTable
│           └─ TagTable
└─ RenderDialogs
   ├─ ImportDialog
   ├─ RecentDialog
   └─ ZoomSnackbar
```

`Slate` and `Editable` above come from `slate-react`. Editor instances and index rows repeat according to the document and view settings.

## Component inventory

Each project component definition is listed once, regardless of instance count.
Context providers, icons, DOM elements, and library internals are omitted from
this inventory but remain relevant to performance.

| Source | Components |
| --- | --- |
| [src/gui/app/app.jsx](app/app.jsx) | `App`, `View`, `DocBar`, `WithDoc`, `FileMenu`, `RecentItems`, `HelpButton`, `RenderDialogs`, `ZoomSnackbar` |
| [src/gui/common/factory.jsx](common/factory.jsx) | `VBox`, `ToolBox`, `HBox`, `Button`, `Tooltip`, `PopupArrow`, `IconButton`, `Menu`, `MenuItem`, `Filler`, `Submenu`, `Separator`, `MakeToggleGroup`, `ToggleButton`, `Popup`, `Input`, `DropDown`, `DeferredRender`, `Label`, `Dialog`, `VFiller` |
| [src/gui/app/views.jsx](app/views.jsx) | `ViewSelectButtons`, `ViewSwitch` |
| [src/gui/common/components.jsx](common/components.jsx) | `OpenFolderButton`, `HeadInfo`, `EditHeadButton`, `EditHead`, `ActualWords`, `WordsToday`, `TargetWords`, `MissingWords`, `CharInfo`, `ChooseVisibleElements`, `ChooseWordFormat`, `FormatWords` |
| [src/gui/editor/editor.jsx](editor/editor.jsx) | `EditView`, `LeftPanel`, `LeftPanelMenu`, `ShowIndices`, `SectionIndex`, `SectionName`, `EditorBox`, `Searching`, `RightPanel`, `ChooseRightPanel`, `RightPanelContent` |
| [src/gui/common/docIndex.jsx](common/docIndex.jsx) | `DocIndex`, `ActDropZone`, `ActItem`, `IndexItem`, `ItemIcon`, `ItemLabel`, `ChapterDropZone`, `ChapterItem`, `SceneDropZone`, `SceneItem` |
| [src/slatejs/slateButtons.jsx](../slatejs/slateButtons.jsx) | `FoldButtons`, `StyleButtons`, `ParagraphStyleSelect`, `CharStyleButtons`, `ReviewButtons` |
| [src/slatejs/slateEditable.jsx](../slatejs/slateEditable.jsx) | `SlateEditable` |
| [src/gui/editor/wordTable.jsx](editor/wordTable.jsx) | `WordTable`, `WordCountRow` |
| [src/gui/editor/tagTable.jsx](editor/tagTable.jsx) | `TagTable`, `TagRow` |
| [src/gui/import/import.jsx](import/import.jsx) | `ImportDialog`, `SelectFormat` |
| [src/gui/import/preview.jsx](import/preview.jsx) | `Preview`, `ImportIndex`, `ImportPreview` |
| [src/gui/import/importText.jsx](import/importText.jsx) | `ImportText`, `UpdateImported` |
| [src/gui/app/recent.jsx](app/recent.jsx) | `RecentDialog`, `FileEntry` |

## Updating this map

1. Start at `App`'s `useImmer(null)` document state in [app.jsx](app/app.jsx).
   Follow the editor view through the editor-instance map in
   [editor.jsx](editor/editor.jsx), `SlateEditable`, and the library's `Editable`.
2. Follow rendered siblings and descendants too, including conditional branches,
   callbacks, `children`, and dynamically selected components. Resolve imports
   and re-exports; exclude commented-out code and views outside the scope above.
3. Update the diagram, source links, and inventory when components move or change.
   Use code anchors rather than fixed line numbers. Check dynamic branches
   manually even when using JSX/AST tooling; the map does not measure render frequency.
