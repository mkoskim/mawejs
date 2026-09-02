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
const file = { id: path.join(cwd, "examples", "Story.mawe") };
const doc = { file };
const docWithoutFile = {};
const fileDir = path.join(cwd, "examples");

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
  await askFileToImport(doc),
  fileDir,
  "import with doc.file should suggest the file directory",
);

assert.equal(
  await askFileToImport(docWithoutFile),
  cwd,
  "import with document without file should suggest cwd",
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
  await askFileToSaveAs(docWithoutFile),
  path.join(cwd, "NewDoc.mawe"),
  "save-as with document without file should suggest NewDoc.mawe in cwd",
);

assert.equal(
  await askFileToRename(doc),
  file.id,
  "rename with doc.file should suggest the current file path",
);

console.log("Path suggestion tests passed");
