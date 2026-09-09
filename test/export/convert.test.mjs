//*****************************************************************************
//
// Test flattened document conversions for various formats
//
//*****************************************************************************

import {describe, test, it} from "node:test"
import assert from "node:assert/strict";

import {
  createSection, createAct, createChapter, createScene,
  createParagraph, createText,
} from "../testutil/nodetree.mjs";

import { flattenDoc, convertFlatted } from "../../src/document/export/processDoc.js";
import { getTextConverter } from "../../src/document/export/convert2TXT.js";

