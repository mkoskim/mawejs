//*****************************************************************************
//
// Export development: run with npm run export:dev from the project root.
//
//*****************************************************************************

import path from "node:path";
import { writeFile } from "node:fs/promises";
import { installFakeIpc } from "../_support/fakeIpc.js";
import { flattenDoc, convertFlatted } from "../../src/document/export/processDoc.js";
import { getTextConverter } from "../../src/document/export/convert2TXT.js";
import { getHTMLConverter } from "../../src/document/export/convert2HTML.js";
import { mawe } from "../../src/document/index.js";
import { exit } from "node:process";
import { nodeIsContainer } from "../../src/document/elements.js";

//*****************************************************************************
//
// Loading a file
//
//*****************************************************************************

// Paths are relative to the project root, as in the load tests.

//const filename = "examples/migration/Story.v8.mawe";
const filename = "local/tarinat/fanfic/Gjerta_WFF3b_Jaskier/WFF3b_Jaskier.v1.r2.mawe";

installFakeIpc();
const doc = await mawe.load(filename);

//*****************************************************************************
//
// Export settings
//
//*****************************************************************************

const settings = {
  ...doc.exports,

  //content: "synopsis",
  //content: "storybook",

  //prefix_act: "Act", acts: "numbered",

  //prefix_chapter: "Chapter", chapters: "numbered",
  //prefix_chapter: "Chapter", chapters: "named",
  //prefix_chapter: "Chapter", chapters: "separated",
  //prefix_chapter: "Luku",
  //prefix_chapter: "Luku", chapters: "numbered&named",

  //prefix_scene: "Scene", scenes: "numbered&named",
}

//*****************************************************************************
//
// Flat doc
//
//*****************************************************************************

const flatted = flattenDoc(doc, settings);

/*
flatted.filter(nodeIsContainer).forEach(node => console.log(node))
exit()
/**/

//*****************************************************************************
//
// Convert flatted
//
//*****************************************************************************

const converters = [
  getTextConverter({format: "md"}),
  //getTextConverter({format: "txt"}),
  //getHTMLConverter(),
];

//*****************************************************************************
//
// Write converted
//
//*****************************************************************************

const outputPrefix = path.resolve("test/export/export.test");

// Prepare every conversion before replacing any preview files.
const outputs = converters.map(converter => ({
  filename: outputPrefix + converter.suffix,
  content: [
    converter.header?.(),
    convertFlatted(converter, flatted, settings),
    converter.footer?.(),
  ].filter(part => part !== undefined).join("\n"),
}));

for (const {filename, content} of outputs) {
  await writeFile(filename, content, "utf8");
  console.log("Exported:", filename);
}
