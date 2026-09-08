import {test, describe, it} from "node:test"
import assert from "node:assert/strict";
import {installFakeIpc} from "../_support/fakeIpc.js";
import {validateSection} from "../testutil/validateSection.js";
import {fixtures, loadSource, loadExpected} from "./fixtures.mjs"

installFakeIpc();

describe("Load test", {concurrency: false}, () => {
  for (const {sourcefile, expectedfile, operation} of fixtures) {
    test(sourcefile, async () => {
      const doc = await loadSource(sourcefile);

      it("has generated key", () => assert.ok(doc.key))
      it("has UUID", () => assert.ok(doc.uuid))
      it("has valid draft", () => validateSection(doc.draft.acts))
      it("has valid notes", () => validateSection(doc.notes.acts))
      it("has valid storybook", () => validateSection(doc.storybook.acts))

      /*
      assert.ok(doc.head, `${filename}: expected head`);
      assert.ok(doc.draft?.acts?.length > 0, `${filename}: expected draft acts`);
      assert.ok(doc.notes?.acts?.length > 0, `${filename}: expected notes acts`);
      assert.ok(doc.storybook?.acts?.length > 0, `${filename}: expected storybook acts`);
      */

      it("equals to test fixture", async () => {
        const actual = operation(doc);
        const expected = await loadExpected(expectedfile);
        assert.equal(actual, expected);
      })
    })
  }
})
