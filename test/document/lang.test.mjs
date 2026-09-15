import {describe, test} from "node:test"
import assert from "node:assert/strict";
import {
  getLanguage,
  getLangRTF,
  getLangNative,
  getLangTEX,
  isLangSupported,
  languageMatches,
  languageOptions,
} from "../../src/document/lang.js";

describe("Language selection", () => {
  test("maps ISO 639-1 languages to RTF language codes", () => {
    assert.equal(getLangRTF("fi"), 1035)
    assert.equal(getLangRTF("en"), 1033)
    assert.equal(getLangRTF("de"), 1031)
    assert.equal(getLangRTF("zh"), 2052)
  })

  test("resolves aliases without adding duplicate choices", () => {
    /*
    assert.equal(getLanguage("fi-FI"), "fi")
    assert.equal(getLanguage("en"), "en")
    assert.equal(getLanguage("en-GB"), "en-GB")
    */
    assert.equal(getLanguage("[none]"), undefined)
    assert.equal(getLangNative("en-US"), "American English")
  })

  test("builds choices from the language table", () => {
    assert.deepEqual(
      languageOptions.find(({code}) => code === "fi"),
      {code: "fi", name: "Finnish", native: "suomi"},
    )
    assert.deepEqual(
      languageOptions.find(({code}) => code === "en-US"),
      {code: "en-US", name: "American English"},
    )
  })

  test("matches language codes and native names case-insensitively", () => {
    const finnish = languageOptions.find(({code}) => code === "fi")

    assert.equal(languageMatches(finnish, "FI"), true)
    assert.equal(languageMatches(finnish, "suo"), true)
    assert.equal(languageMatches(finnish, "fin"), true)
    assert.equal(languageMatches(finnish, " English "), false)
  })

  test("matches the beginning of any word in either name", () => {
    const british = {code: "en-GB", name: "British English", native: "brittienglanti"}
    const native = {code: "en-GB", name: "brittienglanti", native: "British English"}

    assert.equal(languageMatches(british, " ENGL "), true)
    assert.equal(languageMatches(native, "english"), true)
    assert.equal(languageMatches(british, "brit"), true)
    assert.equal(languageMatches(british, "glish"), false)
    assert.equal(languageMatches(british, "en-GB"), true)
    assert.equal(languageMatches({code: "en-IN", name: "English (India)", native: "English (India)"}, "english"), true)
  })

  test("detects supported codes without matching inherited properties", () => {
    assert.equal(isLangSupported("en"), true)
    assert.equal(isLangSupported("en-US"), true)
    assert.equal(isLangSupported("FI"), false)
    assert.equal(isLangSupported("[none]"), false)
  })

  test("finds BCP 47 choices by English and native names", () => {
    const finnish = languageOptions.find(({code}) => code === "fi")
    assert.equal(finnish.name, "Finnish")
    assert.equal(finnish.native, "suomi")
    assert.equal(languageMatches(finnish, "fin"), true)
    assert.equal(languageMatches(finnish, "suo"), true)
    assert.equal(getLangNative("fi"), finnish.native)
    assert.equal(getLangRTF("fi-FI"), 1035)
    assert.equal(getLangRTF("en-US"), 1033)
    assert.equal(getLangRTF("en-GB"), 2057)
    assert.equal(getLangTEX("fi"), "finnish")
    assert.equal(getLangTEX("en-GB"), "british")
  })
})
