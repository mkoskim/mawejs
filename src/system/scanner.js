//*****************************************************************************
//*****************************************************************************
//
// Directory scanner
//
//*****************************************************************************
//*****************************************************************************

/*
-------------------------------------------------------------------------------

Searching files is needed for various purposes, so lets try to make a
general purpose scanner for different needs.

// TODO: We need this scanner for other purposes, too! So, take this to
// storage side and make it generic directory scanner.

-------------------------------------------------------------------------------
*/

const fs = require("./localfs");

export class Scanner {

  constructor(directory) {
    this.directory = directory;
    this.scan = [directory];
    this.processing = undefined;
    this.batchsize = 10;
    this.average = 0;
    this.filter = {
      file: (f => true),
      folder: (f => true),
    }
  }

  isfinished() { return !this.scan.length && !this.processing; }

  getmore() {
    if(this.processing) return;

    const head = this.scan.splice(0, this.batchsize)

    if(!head) return;

    const start = Date.now();

    this.processing = head.map(async d => {
      const files = await fs.readdir(d).catch(e => [])
      return files.map(f => ({
        ...f,
        relpath: fs.relpath(this.directory, d)
      }));
    });

    return Promise.all(this.processing).then(results => {
      this.tunebatchsize(Date.now() - start);
      return this.processbatch(results.flat());
    })
  }

  processbatch(batch) {
    const folders = batch
      .filter(f => !f.symlink && f.type === "folder")
      .filter(this.filter.folder)

    this.scan.push(...folders.map(f => f.id))
    this.processing = undefined;
    return batch.filter(this.filter.file);
  }

  //---------------------------------------------------------------------------
  //
  // Batch size: The larger is the bunch of directories we process at once,
  // the quicker the tree is walked. But at the same time, it takes longer
  // to wait for results (Promise.all) and it hurts responsiveness. So, we
  // want to keep the batch size as large as possible, but small enough to
  // get frequent progress updates and maintain responsiveness.
  //
  // Adaptive tuning: we target to 100 ms execution time of a batch. If it
  // took longer, we decrease the batch size. If the processing were
  // substantially quick, we increase the batch size to make scanning
  // quicker.
  //
  //---------------------------------------------------------------------------

  tunebatchsize(elapsed) {
    this.average = this.average + (elapsed - this.average) / 10;

    if     (this.average > 250) this.batchsize = this.batchsize / 1.5;
    else if(this.average > 150) this.batchsize = this.batchsize - 5;
    else if(this.average > 80)  ;
    else if(this.average > 50)  this.batchsize = this.batchsize + 5;
    else                        this.batchsize = this.batchsize * 1.5;

    // Hard limits
    this.batchsize = Math.max(10, Math.min(150, this.batchsize));
  }
}
