import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { installFakeIpc } from "../support/fakeIpc.js";
import { canonicalDocumentText } from "../support/canonicalDocument.js";
import { mawe } from "../../src/document/index.js";

installFakeIpc();

console.log("MOE import tests...");

const fixtures = [
  "basic",
  "parts",
  "hiddenparts",
];

const expectedNames = {
  basic: "Basic MOE Fixture",
  parts: "MOE Parts Fixture",
  hiddenparts: "MOE Hidden Parts Fixture",
};

const expectedExports = {
  basic: {type: "short", acts: "none", chapters: "named"},
  parts: {type: "short", acts: "none", chapters: "named"},
  hiddenparts: {type: "long", acts: "none", chapters: "numbered"},
};

const updateSnapshots = process.argv.includes("--update");

if (updateSnapshots) {
  console.log("MOE import tests: updating reference files...")
  await updateReferenceFiles()
  console.log("MOE import tests: files updated")
} else {
  for (const fixture of fixtures) {
    await testFixture(fixture);
  }
  console.log("MOE import tests passed");
}

async function testFixture(fixture) {
  const source = sourceFilename(fixture);
  const expectedFile = expectedFilename(fixture);

  console.log("MOE import test:", source)

  const doc = await mawe.load(source);
  const expected = await readFile(expectedFile, "utf8");

  assert.ok(doc.key, `${source}: imported MOE document should get a React key`);
  assert.equal(doc.file, undefined, `${source}: imported MOE document should not get file`);
  assert.equal(doc.origin.id, path.resolve(source), `${source}: imported MOE document should keep origin`);
  assert.equal(doc.head.name, expectedNames[fixture], `${source}: title should also become document name`);
  assertExports(doc, fixture);
  assertMarks(doc, fixture);
  assert.equal(canonicalDocumentText(doc), expected, `${source}: canonical text mismatch`);
}

async function updateReferenceFiles() {
  for (const fixture of fixtures) {
    const source = sourceFilename(fixture);
    const doc = await mawe.load(source);
    const actual = canonicalDocumentText(doc);
    await writeExpected(expectedFilename(fixture), actual);
  }
}

function sourceFilename(fixture) {
  return path.join("test", "test_moe", "test_fixtures", `${fixture}.moe`);
}

function expectedFilename(fixture) {
  return path.join("test", "test_moe", "expected", `${fixture}.txt`);
}

async function writeExpected(filename, text) {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, text);
}

function assertMarks(doc, fixture) {
  if(fixture !== "basic") return

  assert.equal(firstText(doc.draft, "Draft Scene").bold, undefined);
  assert.equal(firstText(doc.draft, "Draft Scene").italic, undefined);
  assert.equal(firstText(doc.notes, "Excluded Draft Scene").italic, true);
  assert.equal(firstText(doc.notes, "Notes Scene").bold, true);

  assertTextMark(doc.draft, "Draft Scene", "italic", {italic: true});
  assertTextMark(doc.draft, "Draft Scene", "bold", {bold: true});
  assertTextMark(doc.draft, "Draft Scene", "synopsis", {italic: true});
  assertTextMark(doc.draft, "Draft Scene", "comment", {bold: true});
}

function assertExports(doc, fixture) {
  for(const [key, value] of Object.entries(expectedExports[fixture])) {
    assert.equal(doc.exports[key], value, `${fixture}: export ${key} should be ${value}`);
  }
}

function firstText(section, sceneName) {
  const scene = findScene(section, sceneName);
  return scene.children.find(child => child.type === "p").children[0];
}

function findScene(section, sceneName) {
  for(const act of section.acts) {
    for(const chapter of act.children.filter(child => child.type === "chapter")) {
      for(const scene of chapter.children.filter(child => child.type === "scene")) {
        if(scene.name === sceneName) return scene;
      }
    }
  }

  throw new Error(`Scene not found: ${sceneName}`);
}

function assertTextMark(section, sceneName, text, marks) {
  const node = findText(section, sceneName, text);

  for(const [mark, value] of Object.entries(marks)) {
    assert.equal(node[mark], value, `${sceneName}: ${text} should have ${mark}=${value}`);
  }
}

function findText(section, sceneName, text) {
  const scene = findScene(section, sceneName);
  const blocks = scene.children.filter(child => ["p", "bookmark", "comment"].includes(child.type));

  for(const block of blocks) {
    for(const child of block.children) {
      if(child.text === text) return child;
    }
  }

  throw new Error(`Text not found in ${sceneName}: ${text}`);
}
