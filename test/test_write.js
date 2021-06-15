//*****************************************************************************
//*****************************************************************************
//
// Test directory scanning
//
//*****************************************************************************
//*****************************************************************************

require("./fakewindow");
const fs = require("../src/storage/localfs");
const document = require("../src/document")

testwrite();

async function testwrite() {
  const doc = await document.load("../local/Beltane.mawe");

  const head = doc.story.body.head;
  console.log(`${head.author}: ${head.title}`);    
  console.log(doc.basename, doc.suffix);

  // Hack
  doc.file = {id: "../local/testwrite.mawe.gz", name: "testwrite.mawe.gz"}
  doc.compress = true;

  doc.save();
}
