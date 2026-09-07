import assert from "node:assert/strict";
import path from "node:path";
import { installFakeIpc } from "../../_support/fakeIpc.js";
import { fixtures, loadSource, loadExpected } from "./fixtures.mjs";

installFakeIpc();

console.log("MOE import tests...");

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

for (const fixture of fixtures) {
  await testFixture(fixture);
}
console.log("MOE import tests passed");

async function testFixture({sourcefile: source, expectedfile, operation}) {
  const fixture = path.basename(source, ".moe");

  console.log("MOE import test:", source)

  const doc = await loadSource(source);
  const expected = await loadExpected(expectedfile);

  assert.ok(doc.key, `${source}: imported MOE document should get a React key`);
  assert.equal(doc.file, undefined, `${source}: imported MOE document should not get file`);
  assert.equal(doc.origin.id, path.resolve(source), `${source}: imported MOE document should keep origin`);
  assert.equal(doc.head.name, expectedNames[fixture], `${source}: title should also become document name`);
  assertExports(doc, fixture);
  assertMarks(doc, fixture);
  assert.equal(operation(doc), expected, `${source}: canonical text mismatch`);
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
