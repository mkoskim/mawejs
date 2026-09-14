//*****************************************************************************
//
// Languages
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// ISO 639-1: https://en.wikipedia.org/wiki/ISO_639-1
// IETF BCP 47: https://en.wikipedia.org/wiki/IETF_language_tag
// BCP 47: https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Import iso-639-1 library and fill in RTF & TeX support..
//-----------------------------------------------------------------------------

import ISO6391 from 'iso-639-1';

const support = {
  "fi": {rtf: 1035, tex: "finnish"},
  "en": {rtf: 1033 },
}

export const languages = Object.fromEntries(
  ISO6391.getLanguages(ISO6391.getAllCodes())
  .map(({code, name, nativeName}) => [code, {name, native: nativeName, ...support[code]}])
);

export const languageOptions = Object.entries(languages).map(([code, {name, native}]) => ({
  code,
  name,
  native,
}))

export function isLangSupported(lang) {
  return Object.hasOwn(languages, lang)
}

export function languageMatches({code, name, native}, query) {
  const search = query.trim().toLowerCase()
  return (
    code.toLowerCase().startsWith(search) ||
    name.toLowerCase().startsWith(search) ||
    native.toLowerCase().startsWith(search)
  )
}

export function getLangName(lang) {
  return languages[lang]?.name ?? lang
}

export function getLangNative(lang) {
  return languages[lang]?.native ?? lang
}

export function getLangRTF(lang) {
  return languages[lang]?.rtf
}

export function getLangTEX(lang) {
  return languages[lang]?.tex
}
