import path from "node:path";
import { loadTest } from "./_support/loadTest.mjs";

//-----------------------------------------------------------------------------

console.log("Node version:", process.versions.node)

//-----------------------------------------------------------------------------

const testGroups = {
  export: [
    "test/export/test_export.js",
    "test/export/test_splits.js",
  ],
};

testGroups.all = [
  ...testGroups.export,
];

//-----------------------------------------------------------------------------
// Argument parsing for test runner. Usage:
//
//   1) Run all tests:
//
//      $ node test/run.mjs
//
//   2) Run tests for specific groups:
//
//      $ node test/run.mjs --group slate --group misc
//
//   3) Run specific test files:
//
//      $ node test/run.mjs test/test_misc/test_history.js
//
//   4) Run tests for a specific group and file:
//
//      $ node test/run.mjs --group slate test/test_misc/test_history.js
//
// Default command runs tests. Test targets can be selected by group, by test
// file, or by combining both. If no targets are given, all tests are run.
//
//-----------------------------------------------------------------------------

const [, , ...argv] = process.argv;
const { groups, files } = parseRunTargets(argv);
const testsToRun = resolveTests(groups, files);

function parseRunTargets(argv) {
  const groups = [];
  const files = [];

  for(let index = 0; index < argv.length; index++) {
    const arg = argv[index];

    if(arg === "--group") {
      const group = argv[++index];
      if(!group) {
        throw new Error("--group requires a group name");
      }
      groups.push(group);
      continue;
    }

    if(arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    files.push(arg);
  }

  return { groups, files };
}

function resolveTests(groups, files) {
  if(!groups.length && !files.length) {
    groups = ["all"];
  }

  return [
    ...new Set([
      ...groups.flatMap(group => getTestGroup(group)),
      ...files,
    ]),
  ];
}

function getTestGroup(group) {
  const tests = testGroups[group];
  if(!tests) {
    throw new Error(`Unknown test group: ${group}`);
  }
  return tests;
}

//*****************************************************************************
//
// Run tests
//
//*****************************************************************************

for (const testFile of testsToRun) {
  await runTest(testFile);
}

async function runTest(testFile) {
  const previousArgv = process.argv;
  process.argv = [process.argv[0], path.resolve(testFile)];
  try {
    await loadTest(testFile);
  } finally {
    process.argv = previousArgv;
  }
}
