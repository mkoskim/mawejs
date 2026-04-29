import assert from "node:assert/strict";
import { installFakeIpc } from "./support/fakeIpc.js";
import { mawe } from "../src/document/index.js";
import { storyToFlatted, flattedFormat, exportAs } from "../src/document/export/index.js";

installFakeIpc();

//-----------------------------------------------------------------------------
// Defaults from src/gui/export/export.jsx#loadExportSettings — the test
// harness stubs export.jsx so we re-create them here to exercise the real
// "none/none/none" cascade that triggers the bug from issue#460.

const defaultExportSettings = {
  content: "draft",
  type: "short",
  acts: "none",
  chapters: "none",
  scenes: "none",
  /*
  prefix_act: "",
  prefix_chapter: "",
  prefix_scene: "",
  */
};

const formats = Object.keys(exportAs)

//*****************************************************************************
// Test exporting empty docs
//*****************************************************************************

// Reproduces issue#460: exporting an empty/freshly-created document used to
// crash because formatTXT and formatMD called `title.toUpperCase()` without
// guarding against an undefined title, and storyToFlatted's processDraft
// chain returned undefined for an empty draft (crashing on `.filter`).
// Every formatter must handle a doc with no title, no author, no scenes
// without throwing.
//
// The minimal XML matches what `reqNew` (src/gui/app/context.js) hands to
// createDocument: `<story format="mawe"/>` with no head, draft, notes, or
// storybook elements.

const stories = [
  mawe.create('<story name="Empty" format="mawe"/>') // Empty doc
];

//-----------------------------------------------------------------------------

console.log("Empty document export test...");

for (const exporting of stories) {

  const story = {
    ...exporting,
    exports: defaultExportSettings,
  }

  console.log("Exporting:", story.head.name)

  assert.doesNotThrow(
    () => doExport(story),
    `${story.head.name}: exporting must not throw`,
  );
}

console.log("Empty document export test passed");

//-----------------------------------------------------------------------------
// We run the exporters and check that they run w/o throwing errors and
// produce strings. No further validation is done at this moment.
//-----------------------------------------------------------------------------

function doExport(story) {
  const name = story.head.name

  const flatted = storyToFlatted(story)
  assert.ok(Array.isArray(flatted.content), `${name}: content must be an array`);

  for (const fmt of formats) {
    const out = flattedFormat(exportAs[fmt], flatted);
    assert.equal(typeof out, "string", `${fmt}: expected string output (${name})`);
  }
}
