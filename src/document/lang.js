//*****************************************************************************
//
// Languages
//
//*****************************************************************************

import {languages, aliases} from './languages.json';

//export const languages = generated.languages
//export const languageAliases = generated.aliases

//-----------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------

/*
export function resolveLanguageCode(lang) {
  if (!lang) return undefined
  let code
  try {
    code = Intl.getCanonicalLocales(lang)[0]
  } catch {
    return undefined
  }
  if (Object.hasOwn(languageAliases, code)) code = languageAliases[code]
  return Object.hasOwn(languages, code) ? code : undefined
}
*/

export function getLanguage(lang) {
  const code = aliases[lang] ?? lang
  return languages[code]
}

//-----------------------------------------------------------------------------
// Language support functions: Query languages by BCP 47 language tags
//-----------------------------------------------------------------------------

export const languageOptions = Object.entries(languages)
  .map(([code, {name, native}]) => ({
    code,
    name,
    ...(native ? {native} : {}),
  }))
  //.sorted((a, b) => a.code.localeCompare(b.code))

export function isLangSupported(lang) {
  return getLanguage(lang) !== undefined
}

export function languageMatches({code, name, native}, query) {
  const search = query.trim().toLowerCase()
  return (
    code.toLowerCase().startsWith(search) ||
    name.toLowerCase().split(' ').some(word => word.startsWith(search)) ||
    native?.toLowerCase().split(' ').some(word => word.startsWith(search))
  )
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
