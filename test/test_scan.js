//*****************************************************************************
//*****************************************************************************
//
// Test directory scanning
//
//*****************************************************************************
//*****************************************************************************

require("./fakelectron");
const fs = require("../src/storage/localfs");
const {Scanner} = require("../src/storage/scanner");
const document = require("../src/document")

//testscan();
scandocs("/home/markus/Dropbox/tarinat");

//-----------------------------------------------------------------------------

async function testscan() {
  const dir = await fs.getlocation("home");
  console.log(dir);
  const scanner = new Scanner(dir);
  let files = [];

  while(files.length < 50e3)
  {
    const results = await scanner.getmore();
    files.push(...results);
  }
  console.log(files.length);
}

//-----------------------------------------------------------------------------

function scandocs(directory) {
  console.log("Scanning:", directory);
  document.scan(directory);
}