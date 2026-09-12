import assert from "node:assert/strict";
import {test, describe} from "node:test";

import { buf2tree } from "../../src/document/fileutil.js";

console.log("XML tree shape tests...");

const story = { type: "element", name: "story", attributes: { format: "mawe" } };
const cases = [
  {
    name: "XML declaration is stored separately",
    xml: '<?xml version="1.0" encoding="UTF-8"?><story format="mawe"/>',
    expected: {
      declaration: { attributes: { version: "1.0", encoding: "UTF-8" } },
      elements: [story],
    },
  },
  {
    name: "DOCTYPE is included in elements",
    xml: '<!DOCTYPE story><story format="mawe"/>',
    expected: { elements: [{ type: "doctype", doctype: "story" }, story] },
  },
  {
    name: "Processing instructions are included in elements",
    xml: '<?custom value?><story format="mawe"/>',
    expected: {
      elements: [{ type: "instruction", name: "custom", instruction: "value" }, story],
    },
  },
  {
    name: "Comments are ignored by the application parser settings",
    xml: '<!-- comment --><story format="mawe"/>',
    expected: { elements: [story] },
  },
];

describe("XML tree shape", { concurrency: false }, () => {
  for (const { name, xml, expected } of cases) {
    test(name, () => {
      const tree = buf2tree(xml);
      assert.deepEqual(tree, expected);
    });
  }
});
