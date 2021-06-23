#!/usr/bin/env node
//-----------------------------------------------------------------------------
// Create fake environment for API calls
//-----------------------------------------------------------------------------

global.window = {
  ipc: {
    callMain: require("../public/backend/ipcdispatch").ipcDispatch,
  },
}

//-----------------------------------------------------------------------------
// Use esm for ES6 import/export
// Set options as a parameter, environment variable, or rc file.

require = require("esm")(module/*, options*/)

const [node, run, testcase, ...args] = process.argv

console.log(node, run, testcase, args);

require("./" + testcase).run(args);

//module.exports = require("./test_scan.js")
