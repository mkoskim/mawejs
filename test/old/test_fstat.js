//*****************************************************************************
//*****************************************************************************
//
// Test directory scanning
//
//*****************************************************************************
//*****************************************************************************

require("./fakenv");
const fs = require("../src/storage/localfs");

teststat();

async function teststat() {
  console.log(await fs.fstat("../local/README.md"));
  console.log(await fs.fstat("../local/Beltane.mawe"));
  console.log(await fs.fstat("../local/Beltane.mawe.gz"));

  const file = await fs.fstat("../local/Beltane.mawe.gz");
  console.log("Modified:", new Date(file.modified).toISOString())
}
