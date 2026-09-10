/*
import "./export/convert.test.mjs";

/*/
//-----------------------------------------------------------------------------
// Utility functions (including test utility): We run these low level
// functions first, as they are used in certain other functions, so failing
// will cause them to fail, too.
//-----------------------------------------------------------------------------

import "./testutil/validate.test.mjs";
import "./util/split.test.mjs";
import "./util/gzip.test.mjs";

//-----------------------------------------------------------------------------
// XML tree handling
//-----------------------------------------------------------------------------

import "./xml/elem_create.test.mjs";
import "./xml/elemutil.test.mjs";
import "./xml/elem_find_deep.test.mjs";
import "./xml/elem_manipulation.test.mjs";
import "./xml/xml_tree.test.mjs";

//-----------------------------------------------------------------------------
// File operations
//-----------------------------------------------------------------------------

import "./load/format_detection.test.mjs";
import "./load/loader.test.mjs";
import "./load/load.test.mjs";
import "./load/roundtrip.test.mjs";
import "./load/save.test.mjs";

//-----------------------------------------------------------------------------
// Importing
//-----------------------------------------------------------------------------

import "./import/text/import_text.test.mjs";
import "./import/moe/import_moe.test.mjs";

//-----------------------------------------------------------------------------
// Exporting
//-----------------------------------------------------------------------------

import "./export/flatten.test.mjs";
import "./export/convert.test.mjs";

//-----------------------------------------------------------------------------
// SlateJS
//-----------------------------------------------------------------------------

import "./slate/search.test.mjs";
import "./slate/dnd.test.mjs";
import "./slate/folding.test.mjs";

//-----------------------------------------------------------------------------
// Misc.
//-----------------------------------------------------------------------------

import "./misc/path_suggestions.test.mjs";
import "./misc/history.test.mjs";
/**/
