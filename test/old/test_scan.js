//*****************************************************************************
//*****************************************************************************
//
// Test directory scanning
//
//*****************************************************************************
//*****************************************************************************

const fs = require("../src/storage/localfs");
const {Scanner} = require("../src/storage/scanner");
const document = require("../src/document")

//-----------------------------------------------------------------------------

export function run(args) {
  //testscan();
  scandocs(...args);
}

//-----------------------------------------------------------------------------

function scandocs(directory, ...args) {
  if(!directory) {
    console.log("Usage: node run.js test_scan.js <dir>")
    return ;
  }

  console.log("Scanning:", directory);
  document.scan(directory);
}

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
