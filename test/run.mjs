import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

//-----------------------------------------------------------------------------

const defaultTests = [
  "test/test_load.js",
  "test/test_roundtrip.js",
  "test/test_export_empty.js",
];

//-----------------------------------------------------------------------------

const workdir = process.cwd();
const [, , ...argv] = process.argv;
const testEntry = argv.find(arg => !arg.startsWith("-"));
const passthroughArgs = argv.filter(arg => arg !== testEntry);
const testsToRun = testEntry ? [testEntry] : defaultTests;
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

//-----------------------------------------------------------------------------

console.log("Node version:", process.versions.node)

for (const testFile of testsToRun) {
  await runTest(testFile, passthroughArgs);
}

//-----------------------------------------------------------------------------
// If you need to inspect the generated bundle manually, temporarily replace
// `outdir` with a fixed directory such as "out-test" and comment out the
// cleanup in the finally block.

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
