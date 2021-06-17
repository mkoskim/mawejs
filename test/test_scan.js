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

const args = process.argv.slice(2)

//testscan();
scandocs(args);

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

function scandocs(args) {
  if(!args.length) {
    console.log("Usage: node test_scan.js <dir> <options>")
    return ;
  }
  const [directory, _] = args;

  console.log("Scanning:", directory);
  document.scan(directory);
}