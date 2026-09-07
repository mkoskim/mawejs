import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { mawe } from "../../src/document/index.js";
import { canonicalDocumentText } from "../_support/canonicalDocument.js";

//-----------------------------------------------------------------------------

const expectedDir = path.join("test", "load", "expected");

export const fixtures = [
  "examples/migration/Story.v1.mawe",
  "examples/migration/Story.v2.mawe",
  "examples/migration/Story.v3.mawe",
  "examples/migration/Story.v4.mawe",
  "examples/migration/Story.v5.mawe",
  "examples/migration/Story.v6.mawe",
  "examples/migration/Story.v7.mawe",
  "examples/migration/Story.v8.mawe",
].map(makeFixture);

//-----------------------------------------------------------------------------

function makeFixture(sourcefile) {
  return {
    sourcefile,
    expectedfile: expectedFilename(sourcefile),
    operation: canonicalDocumentText,
  }
};

export async function loadSource(filename) {
  return await mawe.load(filename);
}

export async function loadExpected(filename) {
  return await readFile(filename, "utf8");
}

//-----------------------------------------------------------------------------

function expectedFilename(sourceFile) {
  const flattened = sourceFile
    .replace(/\.mawe(?:\.gz)?$/, "")
    .replaceAll("/", "-");

  return path.join(expectedDir, `${flattened}.txt`);
}

//-----------------------------------------------------------------------------

export async function updateFixtures() {
  for (const {sourcefile, expectedfile, operation} of fixtures) {
    const doc = await loadSource(sourcefile);
    const actual = operation(doc);
    await writeExpected(expectedfile, actual);
  }
}

//-----------------------------------------------------------------------------

async function writeExpected(filename, text) {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, text);
}
