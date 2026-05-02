import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

//-----------------------------------------------------------------------------

console.log("Node version:", process.versions.node)

//-----------------------------------------------------------------------------

const testGroups = {
  load: [
    "test/test_load/test_load.js",
    "test/test_load/test_roundtrip.js",
  ],
  export: [
    "test/test_export/test_export.js",
  ],
  slate: [
    "test/test_slate/test_folding.js",
    "test/test_slate/test_dnd.js",
    "test/test_slate/test_search.js",
  ],
  misc: [
    "test/test_misc/test_history.js",
  ],
  // Test cases which have reference files, that can be updated
  update: [
    "test/test_load/test_load.js",
  ],
};

testGroups.all = [
  ...testGroups.load,
  ...testGroups.export,
  ...testGroups.slate,
  ...testGroups.misc,
];

//-----------------------------------------------------------------------------
// Argument parsing for test runner. Usage:
//
//   node test/run.mjs
//   node test/run.mjs --group slate --group misc
//   node test/run.mjs test/test_misc/test_history.js
//   node test/run.mjs --group slate test/test_misc/test_history.js
//   node test/run.mjs --update
//
// Default command runs tests. Test targets can be selected by group, by test
// file, or by combining both. If no targets are given, all tests are run.
// The --update command runs the update group and passes --update to the test.
//
//-----------------------------------------------------------------------------

const [, , ...argv] = process.argv;
const command = argv.includes("--update") ? "update" : "run";
const { testsToRun, passthroughArgs } = parseCommand(command, argv);

function parseCommand(command, argv) {
  if(command === "update") {
    return {
      testsToRun: getTestGroup("update"),
      passthroughArgs: ["--update"],
    };
  }

  const { groups, files } = parseRunTargets(argv);

  return {
    testsToRun: resolveTests(groups, files),
    passthroughArgs: [],
  };
}

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

//*****************************************************************************
//
// Stub map for replacing modules with test doubles
//
//*****************************************************************************

const workdir = process.cwd();

const stubMap = new Map([
  [path.resolve(workdir, "src/gui/app/views.jsx"), path.resolve(workdir, "test/support/stubs.js")],
  [path.resolve(workdir, "src/gui/app/views"), path.resolve(workdir, "test/support/stubs.js")],
  [path.resolve(workdir, "src/gui/arc/arc.jsx"), path.resolve(workdir, "test/support/stubs.js")],
  [path.resolve(workdir, "src/gui/arc/arc"), path.resolve(workdir, "test/support/stubs.js")],
  [path.resolve(workdir, "src/gui/editor/editor.jsx"), path.resolve(workdir, "test/support/stubs.js")],
  [path.resolve(workdir, "src/gui/editor/editor"), path.resolve(workdir, "test/support/stubs.js")],
  [path.resolve(workdir, "src/gui/export/export.jsx"), path.resolve(workdir, "test/support/stubs.js")],
  [path.resolve(workdir, "src/gui/export/export"), path.resolve(workdir, "test/support/stubs.js")],
  [path.resolve(workdir, "src/gui/common/hotkeys.js"), path.resolve(workdir, "test/support/stubs.js")],
  [path.resolve(workdir, "src/gui/common/hotkeys"), path.resolve(workdir, "test/support/stubs.js")],
]);
const fakeElectronModule = path.resolve(workdir, "test/support/fakeElectron.js");

//*****************************************************************************
//
// Run tests
//
//*****************************************************************************

for (const testFile of testsToRun) {
  await runTest(testFile, passthroughArgs);
}

function getTestGroup(group) {
  const tests = testGroups[group];
  if(!tests) {
    throw new Error(`Unknown test group: ${group}`);
  }
  return tests;
}

//-----------------------------------------------------------------------------
// If you need to inspect the generated bundle manually, temporarily replace
// `outdir` with a fixed directory such as "out-test" and comment out the
// cleanup in the finally block.
//-----------------------------------------------------------------------------

async function runTest(testFile, args) {
  const absEntry = path.resolve(workdir, testFile);
  const outdir = await mkdtemp(path.join(os.tmpdir(), "mawe-test-"));
  const outfile = path.join(outdir, "bundle.mjs");

  process.argv = [process.argv[0], absEntry, ...args];

  try {
    await build({
      bundle: true,
      entryPoints: [absEntry],
      format: "esm",
      jsx: "automatic",
      loader: {
        ".css": "empty",
      },
      outfile,
      platform: "node",
      target: "node22",
      plugins: [
        {
          name: "mawe-test-stubs",
          setup(build) {
            build.onResolve({ filter: /^electron$/ }, () => {
              return { path: fakeElectronModule };
            });

            build.onResolve({ filter: /.*/ }, args => {
              const resolved = path.resolve(args.resolveDir, args.path);
              const replacement = stubMap.get(resolved);
              if (replacement) {
                return { path: replacement };
              }
              return null;
            });
          },
        },
      ],
    });

    await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
  } finally {
    await rm(outdir, { force: true, recursive: true });
  }
}
