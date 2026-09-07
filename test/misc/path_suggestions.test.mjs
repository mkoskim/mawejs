import {describe, test, before} from "node:test"
import assert from "node:assert/strict";
import path from "node:path";
import { installFakeIpc } from "../_support/fakeIpc.js";
import {
  askFileToImport,
  askFileToLoad,
  askFileToRename,
  askFileToSaveAs,
} from "../../src/gui/app/context.js";

describe("Path suggestion tests", {concurrency: false}, () => {

  before(() => {
    installFakeIpc();
  })

  const cwd = process.cwd();
  const fileDir = path.join(cwd, "examples");
  const originDir = path.join(cwd, "examples", "import");
  const moeDir = path.join(cwd, "test", "import", "moe", "test_fixtures");

  const file = { id: path.join(fileDir, "Story.mawe") };
  const origin = { id: path.join(originDir, "Imported.docx") };
  const moeOrigin = { id: path.join(moeDir, "basic.moe") };

  const doc = { file };
  const docWithFileAndOrigin = { file, origin };
  const docWithOrigin = { origin };
  const docWithMoeOrigin = { origin: moeOrigin };
  const docWithTitle = { head: { title: "Story Title" } };
  const docWithName = { head: { name: "Story Name" } };
  const docWithoutFile = {};

  //---------------------------------------------------------------------------

  test("Load without file => cwd", async () => {
    assert.equal(await askFileToLoad(undefined), cwd)
  })

  test("Load with doc.file => file directory", async () => {
    assert.equal(await askFileToLoad(doc), fileDir)
  });

  test("Load with doc.origin => origin directory", async () => {
    assert.equal(await askFileToLoad(docWithOrigin), originDir);
  });

  test("Load with doc.file and doc.origin => file directory", async () => {
    assert.equal(await askFileToLoad(docWithFileAndOrigin), fileDir);
  });

  //---------------------------------------------------------------------------

  test("Import with doc.file => file directory", async () => {
    assert.equal(await askFileToImport(doc), fileDir)
  });

  test("Import with doc.origin => origin directory", async () => {
    assert.equal(await askFileToImport(docWithOrigin), originDir)
  })

  test("Import with document without file or origin => cwd", async () => {
    assert.equal(await askFileToImport(docWithoutFile), cwd)
  });

  //---------------------------------------------------------------------------

  test("save-as without file should suggest NewDoc.mawe in cwd", async () => {
    assert.equal(await askFileToSaveAs(undefined), path.join(cwd, "NewDoc.mawe"));
  });

  test("save-as with doc.file => file directory", async () => {
    assert.equal(await askFileToSaveAs(doc), file.id)
  })

  test("save-as with doc.file and doc.origin => file directory", async () => {
    assert.equal(await askFileToSaveAs(docWithFileAndOrigin), file.id);
  })

  test("save-as with doc.origin => origin basename with mawe suffix", async () => {
    assert.equal(await askFileToSaveAs(docWithOrigin), path.join(originDir, "Imported.mawe"))
  })

  test("save-as with moe doc.origin => origin directory and mawe suffix", async () => {
    assert.equal(await askFileToSaveAs(docWithMoeOrigin), path.join(moeDir, "basic.mawe"));
  })

  test("save-as with doc.head title => title with mawe suffix in cwd", async () => {
    assert.equal(await askFileToSaveAs(docWithTitle), path.join(cwd, "Story Title.mawe"));
  })

  test("save-as with doc.head name => name with mawe suffix in cwd", async () => {
    assert.equal(await askFileToSaveAs(docWithName), path.join(cwd, "Story Name.mawe"));
  })

  test("save-as with document without file, origin, or title => NewDoc.mawe in cwd", async () => {
    assert.equal(await askFileToSaveAs(docWithoutFile), path.join(cwd, "NewDoc.mawe"));
  });

  //---------------------------------------------------------------------------

  test("rename with doc.file => file directory", async () => {
    assert.equal(await askFileToRename(doc), file.id);
  });
})
