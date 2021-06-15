//*****************************************************************************
//*****************************************************************************
//
// Test bench for things. Let's try to make an interface so that we can
// test different things in pure node environment.
//
//*****************************************************************************
//*****************************************************************************

require("./fakewindow");
const fs = require("../src/storage/localfs");
const {Scanner} = require("../src/storage/scanner");

async function testscan() {
  const dir = await fs.getlocation("home");
  console.log(dir);
  const scanner = new Scanner(dir);

  while(scanner.files.length < 50e3)
  {
    await scanner.getmore();
  }
  console.log(scanner.files.length);
}

testscan();

/*
fs.readdir("..").then(result => {
    console.log(result);
})
*/
