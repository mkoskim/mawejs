import { before, describe, test } from "node:test";
import assert from "node:assert/strict";

import { installFakeIpc } from "../_support/fakeIpc.js";
import { fixtures, loadSource } from "./fixtures.mjs";

import {mawe} from "../../src/document/index.js";
import {maweFromBuffer} from "../../src/document/xmljs/load.js";

describe("Document roundtrip", { concurrency: false }, () => {
  before(() => installFakeIpc());

  for (const { sourcefile, operation } of fixtures) {
    test(sourcefile, async () => {
      const original = await loadSource(sourcefile);
      const originalText = operation(original);

      const xml = mawe.toXML(original);
      const roundtripped = maweFromBuffer(xml);
      const roundtripText = operation(roundtripped);

      assert.equal(roundtripText, originalText);
    });
  }
});
