import { loadTest } from "./_support/loadTest.mjs";

const fixtureFiles = [
  "test/load/fixtures.mjs",
  "test/import/moe/fixtures.mjs",
];

const cleanups = [];
const registerCleanup = cleanup => cleanups.push(cleanup);

try {
  const { installFakeIpc } = await loadTest("test/_support/fakeIpc.js", registerCleanup);
  installFakeIpc();

  for (const filename of fixtureFiles) {
    console.log("Updating fixtures:", filename);
    const { updateFixtures } = await loadTest(filename, registerCleanup);
    await updateFixtures();
  }
  console.log("Fixtures updated");
} finally {
  await Promise.all(cleanups.map(cleanup => cleanup()));
}
