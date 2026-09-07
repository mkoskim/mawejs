import { after } from "node:test";
import { loadTest } from "./_support/loadTest.mjs";

//-----------------------------------------------------------------------------
// Utility functions: We run these low level functions first, as they
// are used in certain other functions, so failing will cause them
// to fail, too.
//-----------------------------------------------------------------------------

await loadTest("test/util/split.test.mjs", after);
await loadTest("test/util/gzip.test.mjs", after);

//-----------------------------------------------------------------------------
// XML tree handling
//-----------------------------------------------------------------------------

await loadTest("test/xml/elem_create.test.mjs", after);
await loadTest("test/xml/elemutil.test.mjs", after);
await loadTest("test/xml/elem_find_deep.test.mjs", after);
await loadTest("test/xml/elem_manipulation.test.mjs", after);
await loadTest("test/xml/xml_tree.test.mjs", after);

//-----------------------------------------------------------------------------
// File operations
//-----------------------------------------------------------------------------

await loadTest("test/load/format_detection.test.mjs", after);
await loadTest("test/load/load.test.mjs", after);
await loadTest("test/load/roundtrip.test.mjs", after);
await loadTest("test/load/save.test.mjs", after);

//-----------------------------------------------------------------------------
// Importing
//-----------------------------------------------------------------------------

await loadTest("test/import/moe/import_moe.test.mjs", after);

//-----------------------------------------------------------------------------
// SlateJS
//-----------------------------------------------------------------------------

await loadTest("test/slate/search.test.mjs", after);
await loadTest("test/slate/dnd.test.mjs", after);
await loadTest("test/slate/folding.test.mjs", after);

//-----------------------------------------------------------------------------
// Misc.
//-----------------------------------------------------------------------------

await loadTest("test/misc/path_suggestions.test.mjs", after);
await loadTest("test/misc/history.test.mjs", after);
