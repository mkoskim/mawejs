console.log("Hello");

const fs = require("fs");
const path = require('path');

//console.log(path.resolve("$HOME"));

//console.log(fs.readdirSync(".", {withFileTypes: true}));

/*
fs.readdir(".", {withFileTypes: true}, (err, files) => {
    console.log(err, files);
});
*/

/*
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk(".", (err, files) => { console.log(err, files); });
*/

const { promisify } = require('util');
const { resolve } = require('path');
//const fs = require('fs');
//const readdir = promisify(fs.readdir);
//const stat = promisify(fs.stat);

async function getFiles(dir) {
  var files = await promisify(fs.readdir)(dir);
  files = files.map(file => resolve(dir, file));
  const subfiles = await Promise.all(files.map(async (subdir) => {
    const res = resolve(dir, subdir);

    try {
        const dirent = await promisify(fs.stat)(res);
        //return (dirent.isDirectory() ? getFiles(res) : []);
        return [];
    } catch(err)
    {
        return [];
    }
  }));
  return files.concat(subfiles).reduce((a, f) => a.concat(f), []);
  //return [resolve(dir)].concat(files);
}

//console.log(await readdir("."));

//*
getFiles("/home/markus/Dropbox/tarinat")
//getFiles("src")
  .then(files => console.log(files))
  .catch(e => console.error(e));
/**/
