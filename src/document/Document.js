//*****************************************************************************
//*****************************************************************************
//
// Document class to help doc actions
//
//*****************************************************************************
//*****************************************************************************

import {getSuffix} from "./util.js";
const fs = require("../storage/localfs");
const save = require("./elemtree/save")

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------

export class Document {

  //---------------------------------------------------------------------------
  // File object of this document. Setting it will update its fields, so
  // that we preserve info added by earlier operations.
  //---------------------------------------------------------------------------

  get file() { return this._file; }

  set file(f) {
    this._file = {...this._file, ...f}
    this.suffix = getSuffix(this._file, [".mawe", ".mawe.gz"]);
    this.basename = fs.basename(this._file.name, this.suffix);
  }

  //---------------------------------------------------------------------------

  constructor(file, story) {
    this.file = file;
    this.story = story;

    //if(!this?.story.name) this.story.name = this.basename;
  }

  //---------------------------------------------------------------------------

  async save() {
    this.file = await save.mawe(this);
  }

  //---------------------------------------------------------------------------

  async rename(name, suffix) {
    name   = name ? name : this.basename;
    suffix = suffix ? suffix : this.suffix;

    this.file = await fs.rename(this.file.id, name + suffix);
  }
}
