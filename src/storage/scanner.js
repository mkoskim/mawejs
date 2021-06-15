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

// TODO: Sketch "adaptive" batch sizes? So that the scanner takes time
// how long it took to get the bunch done, and adapts the bunch size to that.

-------------------------------------------------------------------------------
*/

const fs = require("./localfs");

class Scanner {

  constructor(directory) {
    this.directory = directory;
    this.scan = [directory];
    this.files = [];
    this.processing = undefined;
    this.batchsize = 10;
    this.average = 0;
  }

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
      this.processbatch(results.flat());
    })
  }

  processbatch(batch) {
    const files   = this.filterfiles(batch)
    const folders = this.filterfolders(batch)
  
    const dirs = this.processing.length;
    //console.log("Batch:", dirs, "New files:", files.length);

    this.scan.push(...folders.map(f => f.id))
    this.files.push(...files)
    this.processing = undefined;
  }

  filterfiles(batch) {
    return batch;
  }

  filterfolders(batch) {
    return batch
      .filter(f => !f.symlink)
      .filter(f => f.type === "folder")
    ;
  }

  tunebatchsize(elapsed) {
    this.average = this.average + (elapsed - this.average) / 10;

    if(this.average > 250) this.batchsize = this.batchsize / 1.5;
    else if(this.average > 120) this.batchsize = this.batchsize - 5;
    else if(this.average <  50) this.batchsize = this.batchsize * 1.5;
    else if(this.average < 80) this.batchsize = this.batchsize + 5;

    this.batchsize = Math.max(10, Math.min(150, this.batchsize));
  }
}

/*
class DirScanner {
    constructor(directory, hooks) {
      console.log("Creating FileScanner:", directory);
  
      this.directory = directory;
      this.hooks = hooks;
  
      this.scan  = [directory];       // Directories for scanning
      this.processing = undefined;    // Directories under scanning
      this.files = [];                // Files retrieved
  
      this.contains = undefined;      // Pattern to match
      this.report = undefined;    // Function to report maches
      this.requested  = undefined;    // Amount of matches requested
      this.reported = undefined;
    }
  
    //---------------------------------------------------------------------------
  
    matches(contains) {
      return this.files
        .filter(f => f.name.toLowerCase().includes(contains.toLowerCase()));
    }
  
    more2come() {
      return this.processing || this.scan.length;
    }
  
    //---------------------------------------------------------------------------
  
    fetch(setMatches, contains, num) {
      //console.log("Fetch:", contains, num);
      this.report = setMatches;
      this.requested = num;
      this.contains = contains;
      this.reported = { matched: -1, files: this.files.length };
      this.timer = setInterval(this.progress.bind(this), 250);
      this.tryresolve();
    }
  
    stop()
    {
      clearInterval(this.timer);
      this.timer = undefined;
      this.report = undefined;
    }
  
    tryresolve() {
      if(!this.report) return;
  
      const matched = this.matches(this.contains);
      //console.log("Files:", this.files.length, "Scan", this.scan.length, "Contains", this.contains)
  
      if(matched.length >= this.requested || !this.more2come()) {
        this.resolve(matched, this.requested);
      } else {
        // Process 100 entries at time. We might need to adjust this based on the filesystem
        // speed. The larger the amount, the faster the scan, but at the same time, it reports
        // intermediate results slower.
        this.getmore(100);
      }
    }
  
    // Report progression
    progress()
    {
      if(!this.report) return;
  
      const matched = this.matches(this.contains);
      if(matched.length > this.reported.matched || this.files.length > this.reported.files) {
        const state = {
          files: matched.slice(0, this.requested),
          hasMore: this.more2come(),
        }
        this.report(state);
        this.reported = {
          matched: state.files.length,
          files: this.files.length,
        }
        //console.log("Partial:", state);
      }
    }
  
    // Resolve request
    resolve(files, num) {
      if(this.report) {
        const state = {
          files: files.slice(0, num),
          hasMore: files.length > num,
        }
        console.log("Resolve:", state);
        this.report(state);  
      }
      this.stop();
    }
  
    // By default:
    // - we match only on file name, not its path
    // - We search only for files, not for folders
    // - We exclude both hidden files and folders from search
    // - We exclude inaccessible files
    // - We exclude files with unknown types
   
    processBatch(batch)
    {
      const files = batch
        .filter(f => !f.hidden)
        .filter(f => f.access)
        .filter(f => ["file", "folder"].includes(f.type))
      ;
  
      const folders = files
        .filter(f => !f.symlink)
        .filter(f => f.type === "folder")
        .map(f => f.id)
      ;
  
      this.scan.push(...folders)
      this.files.push(...files)
      //console.log("Files", this.files.length, "Scan:", this.scan.length);
    }
  
    getmore(num) {
      // Do nothing if we are already processing directories
      if(this.processing) return ;
  
      // Get directories for scanning
      const head = this.scan.splice(0, num)
  
      if(!head) return this.tryresolve();
  
      // Read contents of the work set
      this.processing = head.map(async d => {
        const rp = fs.relpath(this.directory, d);
        const relpath = rp !== "." ? rp : "";
  
        const files = await fs.readdir(d).catch(e => [])
        return files.map(f => ({...f, relpath: relpath}));
      });
  
      Promise.all(this.processing).then(results => {
        this.processing = undefined;
        this.processBatch(results.flat());
        this.tryresolve();
      })
    }
  }
  */

module.exports = {Scanner}
