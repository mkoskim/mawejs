import assert from "node:assert/strict";
import { installFakeIpc } from "./support/fakeIpc.js";
import { mawe } from "../src/document/index.js";
import { storyToFlatted, flattedFormat, exportAs } from "../src/document/export/index.js";

installFakeIpc();

console.log("Empty document export test...");

// Reproduces issue #460: exporting an empty/freshly-created document used to
// crash because formatTXT and formatMD called `title.toUpperCase()` without
// guarding against an undefined title, and storyToFlatted's processDraft
// chain returned undefined for an empty draft (crashing on `.filter`).
// Every formatter must handle a doc with no title, no author, no scenes
// without throwing.
//
// The minimal XML matches what `reqNew` (src/gui/app/context.js) hands to
// createDocument: `<story format="mawe"/>` with no head, draft, notes, or
// storybook elements.
const emptyMaweXmlVariants = [
  '<story format="mawe" version="6"><head/><draft/><notes/><storybook/></story>',
  '<story format="mawe"/>',
];

const formats = ["RTF", "HTML", "TEX1", "TEX2", "TXT", "MD"];
const exportTypes = ["short", "long"];
const sectionContent = ["draft", "synopsis"];

// Defaults from src/gui/export/export.jsx#loadExportSettings — the test
// harness stubs export.jsx so we re-create them here to exercise the real
// "none/none/none" cascade that triggers the bug from issue #460.
const defaultExportSettings = {
  format: "rtf1",
  content: "draft",
  type: "short",
  acts: "none",
  chapters: "none",
  scenes: "none",
  prefix_act: "",
  prefix_chapter: "",
  prefix_scene: "",
};

for (const xml of emptyMaweXmlVariants) {
  for (const type of exportTypes) {
    for (const content of sectionContent) {
      const story = mawe.fromXML(mawe.buf2tree(xml));
      story.exports = { ...defaultExportSettings, type, content };

      const label = `xml=${xml.length}b type=${type} content=${content}`;

      const flatted = assert.doesNotThrow(
        () => storyToFlatted(story),
        `${label}: storyToFlatted must not throw`,
      );

      // assert.doesNotThrow returns undefined; recompute for downstream use.
      const flattedDoc = storyToFlatted(story);
      assert.ok(Array.isArray(flattedDoc.content), `${label}: content must be an array`);

      for (const fmt of formats) {
        assert.doesNotThrow(
          () => {
            const out = flattedFormat(exportAs[fmt], flattedDoc);
            assert.equal(typeof out, "string", `${fmt}: expected string output (${label})`);
          },
          `${fmt}: exporting an empty document must not throw (${label})`,
        );
      }
    }
  }
}

console.log("Empty document export test passed");
