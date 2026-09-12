//*****************************************************************************
//
// Export development: read a story, set export settings, write exported
// file.
//
//*****************************************************************************

import path from "node:path";
import { writeFile } from "node:fs/promises";
import { installFakeIpc } from "../_support/fakeIpc.js";
import { doc2flatted, flatted2file } from "../../src/document/export/process.js";
import { mawe } from "../../src/document/index.js";
import { exit } from "node:process";
import { nodeIsContainer } from "../../src/document/elements.js";

import { getTextConverter } from "../../src/document/export/convert2TXT.js";
import { getHTMLConverter } from "../../src/document/export/convert2HTML.js";
import { getRTFConverter } from "../../src/document/export/convert2RTF.js";
import { getTEXConverter } from "../../src/document/export/convert2TEX.js";

//*****************************************************************************
//
// Loading a file
//
//*****************************************************************************

installFakeIpc();

// Paths are relative to the project root, as in the load tests.

//const filename = "examples/migration/Story.v8.mawe";
const filename = "local/tarinat/fanfic/Gjerta_WFF3b_Jaskier/WFF3b_Jaskier.v1.r2.mawe";
//const filename = "local/gjerta/Drakara/DrakaraK1/DrakaraK1.mawe";

const doc = await mawe.load(filename);

//*****************************************************************************
//
// Export settings
//
//*****************************************************************************

const exports = {
  ...doc.exports,

  //type: "short",

  //content: "synopsis",
  //content: "storybook",

  //acts: "none",
  //acts: "numbered", prefix_act: "Act",

  //chapters: "none",
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

const flatted = doc2flatted({...doc, exports});

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
  getHTMLConverter(),

  getRTFConverter(),
  //getRTFConverter({sides: "double"}),
  //getRTFConverter({size: "Letter"}),
  //getRTFConverter({size: "A5"}),
  //getRTFConverter({size: "A5", sides: "double"}),

  getTEXConverter({size: "a5"}),
  //getTEXConverter({size: "a5", sides: "double"}),
];

//*****************************************************************************
//
// Write converted
//
//*****************************************************************************

const outputPrefix = path.resolve("test/export/dev.export");

// Prepare every conversion before replacing any preview files.
const outputs = converters.map(converter => ({
  filename: outputPrefix + converter.suffix,
  content: flatted2file(converter, {...doc, exports}, flatted)
}));

for (const {filename, content} of outputs) {
  await writeFile(filename, content, "utf8");
  console.log("Exported:", filename);
}
