import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { installFakeIpc } from "./support/fakeIpc.js";
import { canonicalDocumentText } from "./support/canonicalDocument.js";
import { mawe } from "../src/document/index.js";

installFakeIpc();

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
const expectedDir = path.join("test", "load", "expected");

if (updateSnapshots) {
  console.log("Load test: updating reference files...")
  await updateReferenceFiles()
  console.log("Load test: files updated")
} else {
  console.log("Load test...")
  await testLoadExamples();
  console.log("Load test passed");
}

//-----------------------------------------------------------------------------

async function testLoadExamples() {
  for (const filename of migrationExamples) {

    console.log("Load test:", filename)

    const doc = await loadFixture(filename);

    /*
    assert.ok(doc.key, `${filename}: expected generated key`);
    assert.ok(doc.uuid, `${filename}: expected uuid`);
    assert.ok(doc.head, `${filename}: expected head`);
    assert.ok(doc.draft?.acts?.length > 0, `${filename}: expected draft acts`);
    assert.ok(doc.notes?.acts?.length > 0, `${filename}: expected notes acts`);
    assert.ok(doc.storybook?.acts?.length > 0, `${filename}: expected storybook acts`);
    */

    const actual = canonicalDocumentText(doc);
    const expectedFile = expectedFilename(filename);
    const expected = await readExpected(expectedFile);
    assert.equal(actual, expected, `${filename}: canonical text mismatch`);
  }
}

//-----------------------------------------------------------------------------

async function updateReferenceFiles() {
  for (const filename of migrationExamples) {
    const doc = await loadFixture(filename);
    const actual = canonicalDocumentText(doc);
    const expectedFile = expectedFilename(filename);
    await writeExpected(expectedFile, actual);
  }
}

//-----------------------------------------------------------------------------

async function loadFixture(relativePath) {
  return mawe.load(relativePath);
}

function expectedFilename(sourceFile) {
  const flattened = sourceFile
    .replace(/\.mawe(?:\.gz)?$/, "")
    .replaceAll("/", "-");

  return path.join(expectedDir, `${flattened}.txt`);
}

async function readExpected(filename) {
  return readFile(filename, "utf8");
}

async function writeExpected(filename, text) {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, text);
}
