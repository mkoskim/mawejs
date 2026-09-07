import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Shared JSX, CSS and host-service preparation for both test runners.
const workdir = process.cwd();

const stubMap = new Map([
  [path.resolve(workdir, "src/gui/app/views.jsx"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/gui/app/views"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/gui/arc/arc.jsx"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/gui/arc/arc"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/gui/editor/editor.jsx"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/gui/editor/editor"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/gui/export/export.jsx"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/gui/export/export"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/gui/common/hotkeys.js"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/gui/common/hotkeys"), path.resolve(workdir, "test/_support/stubs.js")],
  [path.resolve(workdir, "src/system/dialog.js"), path.resolve(workdir, "test/_support/dialogStub.js")],
  [path.resolve(workdir, "src/system/dialog"), path.resolve(workdir, "test/_support/dialogStub.js")],
]);

const fakeElectronModule = path.resolve(workdir, "test/_support/fakeElectron.js");

// Node tests defer cleanup until their after hook; legacy tests run on import.
export async function loadTest(testFile, registerCleanup) {
  const absEntry = path.resolve(workdir, testFile);
  const outdir = await mkdtemp(path.join(os.tmpdir(), "mawe-test-"));
  const outfile = path.join(outdir, "bundle.mjs");

  const cleanup = () => rm(outdir, { force: true, recursive: true });
  let deferredCleanup = false;

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
      target: "node24",
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

    if (registerCleanup) {
      registerCleanup(cleanup);
      deferredCleanup = true;
    }
    return await import(pathToFileURL(outfile).href);
  } finally {
    if (!deferredCleanup) await cleanup();
  }
}
