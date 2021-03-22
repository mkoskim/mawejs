const fs = require("fs");
const path = require('path');
const hostfs = require("./hostfs");

//console.log(await readdir("."));

//*
//hostfs.getFiles("/home/markus/Dropbox/tarinat")
hostfs.getFiles("/home/")
//hostfs.getFiles("src")
  .then(files => console.log(files))
  .catch(e => console.error(e));
/**/

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
