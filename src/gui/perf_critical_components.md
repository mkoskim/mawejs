# Performance-critical components

Scope: App with a document and the editor view selected, including conditional menus, dialogs and right-panel alternatives. Other main views and WithoutDoc excluded.

84 project component definitions, plus two context providers. Icons, host DOM elements and library internals excluded. This is a source-level inventory, not a mounted-instance or per-keystroke render count. Conditional branches are included even when closed.

## Why this entire tree is performance-critical

Typing updates the document state owned by `App`, not just local editor state. In `src/slatejs/slateDocument.js`, `bindEditors(doc, updateDoc)` creates the
section editors through `bindEditor()`, which installs this callback:

```js
editor.onChange = () => updateSection(editor, key, updateDoc)
```

For an AST change, `updateSection()` calls `updateDoc()` to update the section's `acts` and word counts, as well as `doc.track`. For other editor changes it still calls `updateDoc()` to update `doc.track`. When this changes the top-level state, React renders `App` again and reconciles the tree below it.

The feedback path is therefore:

```text
Typing → Slate change → editor.onChange → updateSection → updateDoc
       → App's doc state → surrounding UI and editor render tree
```

This is why work added anywhere between the document state and editor canvases, including sibling toolbars and indexes, can affect typing response. A button or label does not need to modify the Slate buffer itself to add work to this path.

Memoization, stable references and other React bailouts may avoid individual
component renders; the update path does not mean that every component always
renders. Preserve those boundaries when changing this tree.

## DocIndex: do not defer rendering

Do not defer `DocIndex` rendering, for example by wrapping it in `DeferredRender`
or feeding it a deferred version of the index tree. Drag-and-drop depends on
the index rendering in sync with its current structure; deferring that render
breaks DnD behavior. Preserve this constraint when optimizing either index.
This concerns the index structure itself, not a blanket ban on deferred values
for auxiliary calculations such as word-count formatting.

## Main render branches

Simplified component tree; shared layout wrappers, controls and library internals are omitted here and project components are listed below. Both indexes reuse `DocIndex` and its row components.

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

## Updating this map

Follow the React render tree, not just imports or ordinary function calls:

1. Start at `const [doc, updateDoc] = useImmer(null)` in `src/gui/app/app.jsx`. Examine what the component owning this state renders when a document is open and the editor view is selected.

2. Follow the rendered components down to `Object.entries(editors).map(([key, editor]) =>` in `src/gui/editor/editor.jsx`, then through `SlateEditable` to the library's `Editable`. Use these code anchors rather than fixed line numbers; if the code moves, follow its new location and update the anchors here.

3. At every level, also follow every rendered sibling branch and its descendants. Include both indexes, toolbars, buttons, comboboxes, labels, menus, dialogs, layout wrappers and any other components rendered in this area. A component does not need to receive `doc` directly to belong to this scope.

4. Resolve component definitions through imports and re-exports. Inspect JSX in function components, class render methods, render callbacks, `children`, component-valued props and configuration objects. Include conditional menus dialogs and panel alternatives even when they are not currently open. Exclude commented-out code and the other main views described in the scope.

5. Update the main-branch diagram and the inventory grouped by source file. Count each project component definition once, even if both indexes use it or a `.map()` renders many instances. Recalculate the total at the top; keep context providers, icons, DOM elements and library internals separate from that count. They remain relevant to performance even though they are not included in the component total.

JSX/AST analysis can help collect the references, but check dynamic component selection and render callbacks manually. This map describes possible render branches; it does not establish which components update on each keystroke.

## Component inventory

Update this inventory when adding, removing or moving components in these branches. The list is a static inventory, not evidence that every component renders on every keystroke. Components excluded from the count (including icons and DOM wrappers) still fall under the performance requirement.

### src/gui/app/app.jsx

- App
- View
- DocBar
- WithDoc
- FileMenu
- RecentItems
- HelpButton
- RenderDialogs
- ZoomSnackbar

### src/gui/common/factory.jsx

- VBox
- ToolBox
- HBox
- Button
- Tooltip
- PopupArrow
- IconButton
- Menu
- MenuItem
- Filler
- Submenu
- Separator
- MakeToggleGroup
- ToggleButton
- Popup
- Input
- DropDown
- DeferredRender
- Label
- Dialog
- VFiller

### src/gui/app/views.jsx

- ViewSelectButtons
- ViewSwitch

### src/gui/common/components.jsx

- OpenFolderButton
- HeadInfo
- EditHeadButton
- EditHead
- ActualWords
- WordsToday
- TargetWords
- MissingWords
- CharInfo
- ChooseVisibleElements
- ChooseWordFormat
- FormatWords

### src/gui/editor/editor.jsx

- EditView
- LeftPanel
- LeftPanelMenu
- ShowIndices
- SectionIndex
- SectionName
- EditorBox
- Searching
- RightPanel
- ChooseRightPanel
- RightPanelContent

### src/gui/common/docIndex.jsx

- DocIndex
- ActDropZone
- ActItem
- IndexItem
- ItemIcon
- ItemLabel
- ChapterDropZone
- ChapterItem
- SceneDropZone
- SceneItem

### src/slatejs/slateButtons.jsx

- FoldButtons
- StyleButtons
- ParagraphStyleSelect
- CharStyleButtons
- ReviewButtons

### src/slatejs/slateEditable.jsx

- SlateEditable

### src/gui/editor/wordTable.jsx

- WordTable
- WordCountRow

### src/gui/editor/tagTable.jsx

- TagTable
- TagRow

### src/gui/import/import.jsx

- ImportDialog
- SelectFormat

### src/gui/import/preview.jsx

- Preview
- ImportIndex
- ImportPreview

### src/gui/import/importText.jsx

- ImportText
- UpdateImported

### src/gui/app/recent.jsx

- RecentDialog
- FileEntry
