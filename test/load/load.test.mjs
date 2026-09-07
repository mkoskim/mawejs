import {test, describe} from "node:test"
import assert from "node:assert/strict";
import { installFakeIpc } from "../_support/fakeIpc.js";
import {fixtures, loadSource, loadExpected} from "./fixtures.mjs"

installFakeIpc();

describe("Load test", {concurrency: false}, () => {
  for (const {sourcefile, expectedfile, operation} of fixtures) {
    test(sourcefile, async () => {
      const doc = await loadSource(sourcefile);

      assert.ok(doc.key, `Expected generated key`);
      assert.ok(doc.uuid, `Expected uuid`);

      /*
      assert.ok(doc.head, `${filename}: expected head`);
      assert.ok(doc.draft?.acts?.length > 0, `${filename}: expected draft acts`);
      assert.ok(doc.notes?.acts?.length > 0, `${filename}: expected notes acts`);
      assert.ok(doc.storybook?.acts?.length > 0, `${filename}: expected storybook acts`);
      */

      const actual = operation(doc);
      const expected = await loadExpected(expectedfile);
      assert.equal(actual, expected, `${sourcefile}: canonical text mismatch`);
    })
  }
})
