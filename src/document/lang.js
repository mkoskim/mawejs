//*****************************************************************************
//
// Languages
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// BCP 47: https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag
//-----------------------------------------------------------------------------

export const languages = {
  "fi": {native: "suomi", rtf: 1035, tex: "finnish"},
  "en": {native: "English", rtf: 1033 },
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
