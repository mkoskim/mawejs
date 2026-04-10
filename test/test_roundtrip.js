import assert from "node:assert/strict";
import { installFakeIpc } from "./support/fakeIpc.js";
import { canonicalDocumentText } from "./support/canonicalDocument.js";

installFakeIpc();

const { mawe } = await import("../src/document/index.js");

const migrationExamples = [
  "examples/migration/Story.v1.mawe",
  "examples/migration/Story.v2.mawe",
  "examples/migration/Story.v3.mawe",
  "examples/migration/Story.v4.mawe",
  "examples/migration/Story.v5.mawe",
  "examples/migration/Story.v6.mawe",
  "examples/migration/Story.v7.mawe",
];

const updateSnapshots = process.argv.includes("--update");

if(updateSnapshots) {
  // Nothing to do
} else {
  console.log("Roundtrip test...");
  await testRoundtripExamples();
  console.log("Roundtrip test passed");
}

async function testRoundtripExamples() {
  for (const filename of migrationExamples) {

    console.log("Roundtrip test:", filename)

    const original = await mawe.load(filename);
    const originalText = canonicalDocumentText(original);

    const xml = mawe.toXML(original);
    const roundtripped = mawe.fromXML(mawe.buf2tree(xml));
    const roundtripText = canonicalDocumentText(roundtripped);

    assert.equal(roundtripText, originalText, `${filename}: roundtrip canonical text mismatch`);
  }
}
