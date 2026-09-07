import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { mawe } from "../../../src/document/index.js";
import { canonicalDocumentText } from "../../_support/canonicalDocument.js";

//-----------------------------------------------------------------------------

const expectedDir = path.join("test", "import", "moe", "expected");

export const fixtures = [
  "basic",
  "parts",
  "hiddenparts",
].map(makeFixture);

//-----------------------------------------------------------------------------

function makeFixture(name) {
  return {
    sourcefile: path.join("test", "import", "moe", "test_fixtures", `${name}.moe`),
    expectedfile: path.join(expectedDir, `${name}.txt`),
    operation: canonicalDocumentText,
  }
};

//-----------------------------------------------------------------------------

export async function loadSource(filename) {
  return await mawe.load(filename);
}

export async function loadExpected(filename) {
  return await readFile(filename, "utf8");
}

export async function updateFixtures() {
  for (const {sourcefile, expectedfile, operation} of fixtures) {
    const doc = await loadSource(sourcefile);
    const actual = operation(doc);
    await writeExpected(expectedfile, actual);
  }
}

async function writeExpected(filename, text) {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, text);
}
