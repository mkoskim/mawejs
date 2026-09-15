import {describe, test, before} from "node:test";
import assert from "node:assert/strict";
import {BrowserWindow} from "../_support/fakeElectron.js";
import {installFakeIpc} from "../_support/fakeIpc.js";
import {
  getSpellcheckLanguages,
  setSpellcheck,
} from "../../src/system/host.js";

describe("Spellcheck IPC", {concurrency: false}, () => {
  const session = BrowserWindow.webContents.session;

  before(() => installFakeIpc());

  test("returns the supported languages", async () => {
    assert.deepEqual(await getSpellcheckLanguages(), ["en", "en-US"]);
  });

  test("en supports enabling and disabling spellchecking", async () => {
    for (const enabled of [true, false]) {
      assert.equal(await setSpellcheck("en", enabled), enabled);
      assert.deepEqual(session.spellCheckerLanguages, ["en"]);
      assert.equal(session.spellCheckerEnabled, enabled);
    }
  });

  for (const lang of [undefined, "aa"]) {
    test(`${lang} clears the previous language and disables spellchecking`, async () => {
      for (const enabled of [true, false]) {
        await setSpellcheck("en", true);
        assert.equal(await setSpellcheck(lang, enabled), undefined);
        assert.deepEqual(session.spellCheckerLanguages, []);
        assert.equal(session.spellCheckerEnabled, false);
      }
    });
  }
});
