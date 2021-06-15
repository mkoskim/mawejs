//*****************************************************************************
//*****************************************************************************
//
// Search documents from a directory tree
//
//*****************************************************************************
//*****************************************************************************

module.exports = {scan}

const fs = require("../storage/localfs");
const {Scanner} = require("../storage/scanner");

async function scan(directory)
{
  const scanner = new Scanner(directory);

  scanner.filter.folder = f => (
    !f.hidden &&
    f.access
  );
  scanner.filter.file = f => {
    if(f.hidden || !f.access) return false;
    if(f.name.endsWith(".moe")) { f.format = "moe"; return true; }
    if(f.name.endsWith(".mawe")) { f.format = "mawe"; return true; }
    if(f.name.endsWith(".mawe.gz")) { f.format = "mawe"; return true; }
    if(f.name === "Makefile") { f.format = "latex"; return true; }
    return false;
  }

  let count = 0;

  while(!scanner.isfinished()) {
    const files = await scanner.getmore();
    if(files.length) {
      count = count + files.length;
      files.map(f => console.log(f.format, f.name));
    }
  }
  console.log("Documents:", count);
}
