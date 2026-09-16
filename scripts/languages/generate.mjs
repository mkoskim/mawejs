import {readFile, writeFile} from 'node:fs/promises';
import {once} from 'node:events';
import {list} from 'tar';
import lcid from 'lcid';  // RTF language codes
import assert from 'node:assert/strict';

//-----------------------------------------------------------------------------
// Helper functions
//-----------------------------------------------------------------------------

// Replace underscores (_) with dash (-)
function canonicalCode(tag) {
  return Intl.getCanonicalLocales(tag.replaceAll('_', '-'))[0]
}

// "nameA (nameB)" --> "nameA / nameB"
function formatName(name, alt = false) {
  return name?.replace(/\s*\(([^)]*)\)\s*$/, alt ? ', $1' : "");
}

function getLanguageNames(code, alt) {
  const name   = new Intl.DisplayNames(["en"], { type: "language" }).of(code)
  const native = new Intl.DisplayNames([code], { type: "language" }).of(code)
  if(name === native) return {
    name: formatName(name, alt),
  }
  return {
    name: formatName(name, alt),
    native: formatName(native, alt),
  }
}

//*****************************************************************************
//
// Mapping [BCP 47]: { rtf: RTF language code }
//
//*****************************************************************************

function loadRTF() {
  // Correct legacy and inaccurate tags in the LCID source.
  const rtfSpellings = {
    'zh_CHS': 'zh-Hans',
    'zh_CHT': 'zh-Hant',
    'en_JA': 'en-JM',
    'en_CB': 'en-029',
    'es_UR': 'es-UY',
    'fr_CG': 'fr-CD',
    'mn_CN': 'mn-Mong-CN',
    'sr_BA': 'sr-Cyrl-BA',
    'sr_SP': 'sr-Cyrl-CS',
  }

  const entries = Object.fromEntries(
    Object.entries(lcid.all)
    .map(([code, rtf]) => [
      // Preserve historical CS: canonicalization would merge it into RS.
      rtfSpellings[code] ?? canonicalCode(code),
      {rtf}
    ])
  )
  // Modern Serbian (Cyrillic, Serbia), missing from the LCID package.
  entries['sr-Cyrl-RS'] = {rtf: 10266}
  return entries
}

//*****************************************************************************
//
// Load Babel entries
//
//*****************************************************************************

async function loadBabel() {

  async function getArchive() {
    try {
      return await readFile("scripts/languages/babel-main.tar.gz")
    } catch(e) {

    }

    const url = 'https://codeload.github.com/latex3/babel/tar.gz/refs/heads/main'
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Babel download failed: HTTP ${response.status}`)
    return Buffer.from(await response.arrayBuffer())
  }

  const archive = await getArchive()

  const entries = {}
  const parser = list({
    onReadEntry(entry) {
      if (!/^[^/]+\/locale\/[^/]+\/babel-[^/]+\.ini$/.test(entry.path)) {
        entry.resume()
        return
      }
      const chunks = []
      entry.on('data', chunk => chunks.push(chunk))
      entry.on('end', () => {
        const fields = parseIdentification(Buffer.concat(chunks).toString('utf8'))
        const code = fields['tag.bcp47']
        const babel = fields['name.babel']?.split(/\s+/)[0]
        const likely = fields['tag.bcp47.likely']
        const script = fields['script.tag.bcp47']
        const native = fields['name.local']
        const name = fields['name.english']
        if(code) entries[code] = {
          babel,
          likely,
          script,
          name,
          native,
        }
      })
    },
  })
  const completed = once(parser, 'end')
  parser.end(archive)
  await completed
  return entries

  //---------------------------------------------------------------------------
  // Babel INI comments occupy entire lines. Values may contain ';' and '#'.
  //---------------------------------------------------------------------------

  function parseIdentification(text) {
    const fields = {}
    let identification = false
    for (const line of text.split(/\r?\n/)) {
      const section = line.trim().match(/^\[(.+)\]$/)
      if (section) {
        identification = section[1] === 'identification'
        continue
      }
      if (!identification || line.trimStart().startsWith(';')) continue
      const field = line.match(/^\s*([^=]+?)\s*=\s*(.*?)\s*$/)
      if (field) fields[field[1]] = field[2]
    }
    return fields
  }
}

//*****************************************************************************
//
// Build language table: [BCP 47] => {name, native, support}
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Make code groups
//-----------------------------------------------------------------------------

let groups = {}

function addcode(code) {
  const [group, ...subgroups] = code.split("-")
  //const subgroup = subgroups.length ? subgroups.join("-") : undefined

  //console.log(group, subgroup)

  if(!groups[group]) groups[group] = {subgroups: {}}
  if(subgroups.length) {
    //const existing = groups[group]?.subgroups[code] ?? {}
    groups[group].subgroups[code] = {}
  } else {
    //const existing = groups[group].main ?? {}
    //groups[group].main = {}
  }
}

//-----------------------------------------------------------------------------
// Process groups
//-----------------------------------------------------------------------------

let aliases = {}
const texEntries = await loadBabel()
const rtfEntries = loadRTF()

function support(key, alias) {
  const {babel} = texEntries[key] ?? texEntries[alias] ?? {}
  const {rtf} = rtfEntries[key] ?? rtfEntries[alias] ?? {}
  if(!babel && !rtf) return undefined
  return {babel, rtf}
}

function makeEntry(key, alias = undefined, alt = false) {
  const {name, native} = getLanguageNames(key, alt)
  return {name, native, ...(support(key, alias) ?? {})}
}

// For autocomplete groups, match the full likely tag first, then omit its script.
function likelyRTF(likely) {
  if(!likely) return undefined
  const code = canonicalCode(likely)
  const {language, script} = new Intl.Locale(code)
  const withoutScript = script
    ? language + code.slice(language.length + script.length + 1)
    : code
  return rtfEntries[code]?.rtf ?? rtfEntries[withoutScript]?.rtf
}

function processGroups() {
  const mains    = {}
  const singles  = {}
  const multis   = {}
  const specials = {}
  const troubles = {}

  for(const [group, {subgroups}] of Object.entries(groups)) {
    const subcodes = Object.keys(subgroups)

    // No subcodes
    if(!subcodes.length) {
      mains[group] = makeEntry(group)
      continue
    }

    // One subcode, e.g. fi -> fi-FI
    if(subcodes.length == 1) {
      const [subkey] = subcodes
      aliases[subkey] = group
      singles[group] = makeEntry(group, subkey)
      continue
    }

    // Many subcodes
    {
      const subbabel = Object.keys(texEntries)
        .filter(code => code.startsWith(group + "-"))

      const main = {
        ...texEntries[group],
        ...rtfEntries[group],
        ...(subbabel.length ? {subbabel} : {}),
      }

      // Empty group entry, make sub-languages singles w/o alias
      if(JSON.stringify(main) === "{}") {
        for(const subkey of subcodes) {
          singles[subkey] = makeEntry(subkey)
        }
        continue;
      }

      // Groups that can be safely completed from group main
      const autocomplete = [
        "ar", "bo", "de", "en", "es", "fr", "hr", "it", "ne",
        "nl", "ms", "pt", "qu", "ro", "ru", "se", "sv", "ur",
      ].includes(group)

      if(autocomplete) {
        multis[group] = makeEntry(group)
        multis[group].rtf ??= likelyRTF(main.likely)
        for(const subkey of subcodes) {
          multis[subkey] = makeEntry(subkey, group, true)
        }
        continue;
      }

      // Explicit Babel fallbacks for groups with multiple writing systems.
      const babelFallbacks = {
        zh: {
          'zh-CN': 'zh-Hans',
          'zh-TW': 'zh-Hant',
          'zh-HK': 'zh-Hant-HK',
          'zh-MO': 'zh-Hant-MO',
          'zh-SG': 'zh-Hans-SG',
        },
        mn: {'mn-MN': 'mn'},
        sr: {'sr-Cyrl-CS': 'sr', 'sr-Cyrl-RS': 'sr'},
      }[group]

      if(babelFallbacks) {
        specials[group] = makeEntry(group)
        specials[group].rtf ??= likelyRTF(main.likely)
        for(const subkey of subcodes) {
          specials[subkey] = makeEntry(subkey, babelFallbacks[subkey], true)
        }
        // The RTF source identifies this script, although Babel has no entry.
        if(group === 'mn') specials['mn-Mong-CN'].script = 'Mong'
        continue;
      }

      assert(`Unhandled group: ${group}`)
      /*
      const subgroup = Object.fromEntries(
        subcodes.map(code => [code, makeEntry(code, undefined, true)])
      )

      troubles[group] = {
        main,
        subgroup
      }
      */
    }
  }

  groups = {
    //aliases,
    ...mains, ...singles,
    ...multis,
    ...specials,
    //...troubles
  }
}

//-----------------------------------------------------------------------------
// Make entries, group them and process groups
//-----------------------------------------------------------------------------

export async function generateLanguages() {

  // Make entries form langugages with RTF langcode
  const entries = [
    //...loadBCP47(),
    ...Object.entries(loadRTF()),
    //...await loadBabel(),
  ]

  for(const [key, value] of entries) {
    addcode(key, value)
  }

  processGroups()

  /*
  const languages = Object.entries(keys)
    .toSorted((a, b) => a[0].localeCompare(b[0]))
  */
  /*
  const languages = Object.fromEntries(
    Object.entries(names)
    .map(([code, value]) => [
      code,
      {...value, ...rtf[code]}
    ])
  )
  */

  const output = {
    generated: 'Generated by npm run generate. Do not edit language entries manually.',
    aliases,
    languages: groups,
    //entries,
    //codes: groups,
    //babel,
    //rtf,
    //languages,
    //aliases: {},
  }

  const destination = new URL('../../src/document/languages.json', import.meta.url)
  await writeFile(destination, JSON.stringify(output, null, 2) + '\n')

  //console.log(`Generated ${Object.keys(languages).length} languages.`)
}
