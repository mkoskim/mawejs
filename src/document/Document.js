//*****************************************************************************
//*****************************************************************************
//
// Document class to help doc actions
//
//*****************************************************************************
//*****************************************************************************

const {suffix2format} = require("./util")
const fs = require("../storage/localfs");
const save = require("./save")

//-----------------------------------------------------------------------------

class Document {

  //---------------------------------------------------------------------------

  get file() { return this._file; }

  set file(f) {
    this._file = {...this._file, ...f}
    this.suffix = suffix2format(this._file, [".mawe", ".mawe.gz"]);
    this.basename = fs.basename(this._file.name, this.suffix);
  }

  //---------------------------------------------------------------------------
  
  constructor(file, story) {
    this.file = file;
    this.story = story;

    if(!this.story.name) this.story.name = this.basename;
  }

  //---------------------------------------------------------------------------
  
  async rename(name, suffix) {
    name   = name ? name : this.basename;
    suffix = suffix ? suffix : this.suffix;

    this.file = await fs.rename(this.file.id, name + suffix);
  }

  async save() {
    this.file = await save.mawe(this);
  }
}

module.exports={Document}
