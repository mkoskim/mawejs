//*****************************************************************************
//*****************************************************************************
//
// Document class to help doc actions
//
//*****************************************************************************
//*****************************************************************************

const {getsuffix} = require("./util")
const fs = require("../storage/localfs");
const save = require("./save")

//-----------------------------------------------------------------------------

class Document {

  //---------------------------------------------------------------------------

  get file() { return this._file; }

  set file(f) {
    if(this._file == undefined) {
      this._file = f;
    } else {
      this._file = {...this._file, ...f}
    }
    this.suffix = getsuffix(f, [".mawe", ".mawe.gz"]);
    this.basename = fs.basename(f.name, this.suffix);
  }

  //---------------------------------------------------------------------------
  
  constructor(file, story) {
    this.file = file;
    this.story = story;

    this.compress = file.compressed;
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

    if(this.compress)
    {
      if(this.suffix !== ".mawe.gz") {
        await this.rename(null, ".mawe.gz");
      }
    } else if(this.suffix !== ".mawe") {
      await this.rename(null, ".mawe");
    }
  }
}

module.exports={Document}
