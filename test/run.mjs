import { spawn } from "node:child_process";
import { buildTest } from "./_support/loadTest.mjs";

const { outfile, cleanup } = await buildTest("test/all.test.mjs");

try {
  process.exitCode = await new Promise((resolve, reject) => {
    // Importing node:test runs the registered tests when this script finishes.
    const child = spawn(process.execPath, ["--enable-source-maps", ...process.argv.slice(2), outfile], {
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", code => resolve(code ?? 1));
  });
} finally {
  await cleanup();
}
