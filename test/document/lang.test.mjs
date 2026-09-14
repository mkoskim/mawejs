import {describe, test} from "node:test"
import assert from "node:assert/strict";
import {
  getLangRTF,
  getLangNative,
  getLangTEX,
  languages,
  isLangSupported,
  languageMatches,
  languageOptions,
  languageAliases,
  resolveLanguageCode,
} from "../../src/document/lang.js";

describe("Language selection", () => {
  test("maps ISO 639-1 languages to RTF language codes", () => {
    assert.equal(getLangRTF("fi"), 1035)
    assert.equal(getLangRTF("en"), 1033)
    assert.equal(getLangRTF("de"), 1031)
    assert.equal(getLangRTF("zh"), 2052)
  })

  test("resolves aliases without adding duplicate choices", () => {
    for (const [alias, target] of Object.entries(languageAliases)) {
      assert.equal(Object.hasOwn(languages, alias), false)
      assert.equal(Object.hasOwn(languages, target), true)
      assert.equal(resolveLanguageCode(alias), target)
    }
    assert.equal(resolveLanguageCode("FI"), "fi-FI")
    assert.equal(resolveLanguageCode("en"), "en-US")
    assert.equal(resolveLanguageCode("de"), "de-DE")
    assert.equal(resolveLanguageCode("en-GB"), "en-GB")
    assert.equal(resolveLanguageCode("not a language"), undefined)
    assert.equal(getLangNative("en-US"), "American English")
    assert.equal(languages["en-US"].native, undefined)
  })

  test("builds choices from the language table", () => {
    assert.deepEqual(
      languageOptions.find(({code}) => code === "fi-FI"),
      {code: "fi-FI", name: "Finnish", native: "Suomi"},
    )
    assert.deepEqual(
      languageOptions.find(({code}) => code === "en-US"),
      {code: "en-US", name: "American English", native: "American English"},
    )
  })

  test("matches language codes and native names case-insensitively", () => {
    const finnish = languageOptions.find(({code}) => code === "fi-FI")

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
    assert.equal(isLangSupported("toString"), false)
  })

  test("finds BCP 47 choices by English and native names", () => {
    const finnish = languageOptions.find(({code}) => code === "fi-FI")
    assert.equal(finnish.name, "Finnish")
    assert.equal(finnish.native, "Suomi")
    assert.equal(languageMatches(finnish, "fin"), true)
    assert.equal(languageMatches(finnish, "suo"), true)
    assert.equal(getLangNative("FI-fi"), finnish.native)
    assert.equal(getLangRTF("fi-FI"), 1035)
    assert.equal(getLangRTF("en-US"), 1033)
    assert.equal(getLangRTF("en-GB"), 2057)
    assert.equal(getLangTEX("fi"), "finnish")
    assert.equal(getLangTEX("en-GB"), "british")
  })

  test("every choice has a display name, without duplicate native names", () => {
    for (const [code, {name, native}] of Object.entries(languages)) {
      assert.ok(name?.trim(), `Missing English name for ${code}`)
      assert.notEqual(native, name, `Redundant native name for ${code}`)
      assert.ok(getLangNative(code)?.trim())
    }
    assert.equal(isLangSupported("eo"), true)
    assert.equal(getLangRTF("eo"), undefined)
    assert.equal(getLangNative("zh-Hant"), "繁體中文")
  })
})
