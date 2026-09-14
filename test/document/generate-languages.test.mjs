import {describe, test} from 'node:test';
import assert from 'node:assert/strict';
import ISO6391 from 'iso-639-1';
import {buildLanguages} from '../../scripts/languages/main.mjs';
import {parseIdentification} from '../../scripts/languages/babel.mjs';
import {isLangSupported} from '../../src/document/lang.js';

describe('Language generation', () => {
  test('reads only identification fields, preserving punctuation in names', () => {
    const fields = parseIdentification(`; comment
[identification]
tag.bcp47 = fi
name.local = suomi ; # literal
name.babel = finnish
[captions]
name.local = ignored
`)
    assert.deepEqual(fields, {
      'tag.bcp47': 'fi',
      'name.local': 'suomi ; # literal',
      'name.babel': 'finnish',
    })
  })

  test('joins exact variants without borrowing another region or script', () => {
    const {languages} = buildLanguages({
      iso: {en: {native: 'English', name: 'English'}},
      names: {
        'en-GB': {native: 'English (UK)', name: 'English (UK)'},
        'en-AU': {native: 'English (Australia)', name: 'English (Australia)'},
        'sr-Latn': {native: 'srpski', name: 'Serbian (Latin)'},
        eo: {native: 'esperanto', name: 'Esperanto'},
      },
      rtf: {en_US: {rtf: 1033}, en_GB: {rtf: 2057}, sr_Cyrl: {rtf: 3098}},
      babel: {'en-GB': {
        native: 'British English', name: 'British English', tex: 'british',
      }},
    })
    const byCode = languages
    assert.equal(byCode.en.rtf, undefined)
    assert.deepEqual(byCode['en-GB'], {
      name: 'British English',
      rtf: 2057, tex: 'british',
    })
    assert.equal(byCode['en-AU'].rtf, undefined)
    assert.equal(byCode['en-AU'].tex, undefined)
    assert.equal(byCode['sr-Latn'].rtf, undefined)
    assert.deepEqual(byCode.eo, {native: 'esperanto', name: 'Esperanto'})
  })

  test('uses an explicitly declared likely Babel locale', () => {
    const {languages, aliases} = buildLanguages({
      iso: {fi: {native: 'suomi', name: 'Finnish'}},
      names: {'fi-FI': {native: 'Suomi', name: 'Finnish'}},
      rtf: {fi_FI: {rtf: 1035}},
      babel: {fi: {tex: 'finnish', likely: 'fi_Latn_FI'}},
    })
    assert.equal(languages['fi-FI'].rtf, 1035)
    assert.equal(languages['fi-FI'].tex, 'finnish')
    assert.equal(Object.hasOwn(languages, 'fi'), false)
    assert.deepEqual(aliases, {fi: 'fi-FI'})
  })

  test('preserves support for all existing document language codes', () => {
    for (const code of ISO6391.getAllCodes()) {
      assert.equal(isLangSupported(code), true, code)
    }
  })
})
