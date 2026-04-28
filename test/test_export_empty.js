import assert from "node:assert/strict";
import { installFakeIpc } from "./support/fakeIpc.js";
import { mawe } from "../src/document/index.js";
import { storyToFlatted, flattedFormat, exportAs } from "../src/document/export/index.js";

installFakeIpc();

console.log("Empty document export test...");

// Reproduces issue #460: exporting an empty/freshly-created document used to
// crash because formatTXT and formatMD called `title.toUpperCase()` without
// guarding against an undefined title. Every formatter must handle a doc
// with no title, no author, no scenes without throwing.
const emptyMaweXml = '<story format="mawe" version="6"><head/><draft/><notes/><storybook/></story>';
const story = mawe.fromXML(mawe.buf2tree(emptyMaweXml));
const flatted = storyToFlatted(story);

const formats = ["RTF", "HTML", "TEX1", "TEX2", "TXT", "MD"];
for (const fmt of formats) {
  assert.doesNotThrow(
    () => {
      const out = flattedFormat(exportAs[fmt], flatted);
      assert.equal(typeof out, "string", `${fmt}: expected string output`);
    },
    `${fmt}: exporting an empty document must not throw`,
  );
}

console.log("Empty document export test passed");
