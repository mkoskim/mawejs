//*****************************************************************************
//
// Languages
//
//*****************************************************************************

import {languages, aliases} from './languages.json';

//-----------------------------------------------------------------------------
// Languages as list, sorted alphabetically by BCP 47 tag
//-----------------------------------------------------------------------------

export const languageOptions = Object.entries(languages)
  .map(([code, {name, native}]) => ({
    code,
    name,
    ...(native ? {native} : {}),
  }))
  .sort((a, b) => a.code.localeCompare(b.code))

//-----------------------------------------------------------------------------
// Language support functions: Query languages by BCP 47 language tags
//-----------------------------------------------------------------------------

export function getLanguage(lang) {
  const code = aliases[lang] ?? lang
  return languages[code]
}

export function isLangSupported(lang) {
  return getLanguage(lang) !== undefined
}

export function getLangName(lang) {
  return getLanguage(lang)?.name ?? lang
}

export function getLangNative(lang) {
  const language = getLanguage(lang)
  return language?.native ?? language?.name ?? lang
}

export function getLangRTF(lang) {
  return getLanguage(lang)?.rtf
}

export function getLangTEX(lang) {
  return getLanguage(lang)?.babel
}

//-----------------------------------------------------------------------------
// Query matcher for autocomplete
//-----------------------------------------------------------------------------

export function languageMatches({code, name, native}, query) {
  const search = query.trim().toLowerCase()
  return (
    code.toLowerCase().startsWith(search) ||
    name.toLowerCase().split(' ').some(word => word.startsWith(search)) ||
    native?.toLowerCase().split(' ').some(word => word.startsWith(search))
  )
}
