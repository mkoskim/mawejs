import assert from "node:assert/strict";
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
    name: "processing instructions are included in elements",
    xml: '<?custom value?><story format="mawe"/>',
    expected: {
      elements: [{ type: "instruction", name: "custom", instruction: "value" }, story],
    },
  },
  {
    name: "comments are ignored by the application parser settings",
    xml: '<!-- comment --><story format="mawe"/>',
    expected: { elements: [story] },
  },
];

for (const { name, xml, expected } of cases) {
  const tree = buf2tree(xml);
  console.log(`${name}`);
  assert.deepEqual(tree, expected, name);
  //console.log(`${name}: ${JSON.stringify(tree)}`);
}

console.log("XML tree shape tests passed");
