//*****************************************************************************
//*****************************************************************************
//
// Test directory scanning
//
//*****************************************************************************
//*****************************************************************************

require("./fakenv");
const fs = require("../src/storage/localfs");
const document = require("../src/document")

//testwrite_2();
testwatch();

async function testwrite_1() {
  const doc = await document.load("../local/Beltane.mawe");

  const head = doc.story.body.head;
  console.log(`${head.author}: ${head.title}`);    
  console.log(doc.basename, doc.suffix);

  // Hack
  doc.file = {id: "../local/testwrite.mawe.gz", name: "testwrite.mawe.gz"}
  doc.compress = false;

  doc.save();
}

async function testwrite_2() {
  const doc = await document.load("../local/Beltane.A.mawe");
  console.log(doc.file);

  doc.file = {id: "../local/Beltane.B.mawe", name: "Beltane.B.mawe"}
  doc.save();
  console.log(doc.file);
}

async function testwatch() {
  const nodefs = require('fs');
  
  const fileid = '../local/watchthis';
  
  console.log(`Watching for file changes on ${fileid}`);
  
  /*
  const watcher = nodefs.promises.watch(fileid);

  for await (const event of watcher) console.log(event);

  /*/
  nodefs.watch(fileid, (event, filename) => {
    //if (filename) {
      console.log(`${event} -> ${filename}`);
      return true;
    //}
  });
  /**/
}