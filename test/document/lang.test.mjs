import {describe, test} from "node:test"
import assert from "node:assert/strict";
import {
  isLangSupported,
  languageMatches,
  languageOptions,
} from "../../src/document/lang.js";

describe("Language selection", () => {
  test("builds choices from the language table", () => {
    assert.deepEqual(
      languageOptions.find(({code}) => code === "fi"),
      {code: "fi", name: "Finnish", native: "suomi"},
    )
    assert.deepEqual(
      languageOptions.find(({code}) => code === "en"),
      {code: "en", name: "English", native: "English"},
    )
  })

  test("matches language codes and native names case-insensitively", () => {
    const finnish = languageOptions.find(({code}) => code === "fi")

    assert.equal(languageMatches(finnish, "FI"), true)
    assert.equal(languageMatches(finnish, "suo"), true)
    assert.equal(languageMatches(finnish, " English "), false)
  })

  test("detects supported codes without matching inherited properties", () => {
    assert.equal(isLangSupported("en"), true)
    assert.equal(isLangSupported("en-US"), false)
    assert.equal(isLangSupported("toString"), false)
  })
})
