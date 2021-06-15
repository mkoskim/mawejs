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
const {findsuffix} = require("./load")

async function scan(directory)
{
  const scanner = new Scanner(directory);

  scanner.filter.folder = f => (
    !f.hidden &&
    f.access
  );
  scanner.filter.file = f => {
    if(f.hidden || !f.access) return false;
    if(findsuffix(f)) return true;
    if(f.name === "Makefile") { f.format = "latex"; return true; }
    return false;
  }

  let count = 0;

  while(!scanner.isfinished()) {
    const files = await scanner.getmore();
    if(files.length) {
      count = count + files.length;
      files.map(f => console.log(f.format, f.name, f.relpath));
    }
  }
  console.log("Documents:", count);
}
