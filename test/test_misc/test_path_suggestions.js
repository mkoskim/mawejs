import assert from "node:assert/strict";
import path from "node:path";
import { installFakeIpc } from "../support/fakeIpc.js";
import {
  askFileToImport,
  askFileToLoad,
  askFileToRename,
  askFileToSaveAs,
} from "../../src/gui/app/context.js";

installFakeIpc();

console.log("Path suggestion tests...");

const cwd = process.cwd();
const fileDir = path.join(cwd, "examples");
const originDir = path.join(cwd, "examples", "import");
const moeDir = path.join(cwd, "test", "test_moe", "test_fixtures");
const file = { id: path.join(fileDir, "Story.mawe") };
const origin = { id: path.join(originDir, "Imported.docx") };
const moeOrigin = { id: path.join(moeDir, "title_item.moe") };
const doc = { file };
const docWithFileAndOrigin = { file, origin };
const docWithOrigin = { origin };
const docWithMoeOrigin = { origin: moeOrigin };
const docWithTitle = { head: { title: "Story Title" } };
const docWithName = { head: { name: "Story Name" } };
const docWithoutFile = {};

assert.equal(
  await askFileToLoad(undefined),
  cwd,
  "load without file should suggest cwd",
);

assert.equal(
  await askFileToLoad(doc),
  fileDir,
  "load with doc.file should suggest the file directory",
);

assert.equal(
  await askFileToLoad(docWithOrigin),
  originDir,
  "load with doc.origin should suggest the origin directory",
);

assert.equal(
  await askFileToLoad(docWithFileAndOrigin),
  fileDir,
  "load with doc.file and doc.origin should prefer the file directory",
);

assert.equal(
  await askFileToImport(doc),
  fileDir,
  "import with doc.file should suggest the file directory",
);

assert.equal(
  await askFileToImport(docWithOrigin),
  originDir,
  "import with doc.origin should suggest the origin directory",
);

assert.equal(
  await askFileToImport(docWithoutFile),
  cwd,
  "import with document without file or origin should suggest cwd",
);

assert.equal(
  await askFileToSaveAs(undefined),
  path.join(cwd, "NewDoc.mawe"),
  "save-as without file should suggest NewDoc.mawe in cwd",
);

assert.equal(
  await askFileToSaveAs(doc),
  file.id,
  "save-as with doc.file should suggest the current file path",
);

assert.equal(
  await askFileToSaveAs(docWithFileAndOrigin),
  file.id,
  "save-as with doc.file and doc.origin should prefer the current file path",
);

assert.equal(
  await askFileToSaveAs(docWithOrigin),
  path.join(originDir, "Imported.mawe"),
  "save-as with doc.origin should suggest origin basename with mawe suffix",
);

assert.equal(
  await askFileToSaveAs(docWithMoeOrigin),
  path.join(moeDir, "title_item.mawe"),
  "save-as with moe doc.origin should suggest origin directory and mawe suffix",
);

assert.equal(
  await askFileToSaveAs(docWithTitle),
  path.join(cwd, "Story Title.mawe"),
  "save-as with doc.head title should suggest title with mawe suffix in cwd",
);

assert.equal(
  await askFileToSaveAs(docWithName),
  path.join(cwd, "Story Name.mawe"),
  "save-as with doc.head name should suggest name with mawe suffix in cwd",
);

assert.equal(
  await askFileToSaveAs(docWithoutFile),
  path.join(cwd, "NewDoc.mawe"),
  "save-as with document without file, origin, or title should suggest NewDoc.mawe in cwd",
);

assert.equal(
  await askFileToRename(doc),
  file.id,
  "rename with doc.file should suggest the current file path",
);

console.log("Path suggestion tests passed");
