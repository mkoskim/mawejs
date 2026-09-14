# Language table generator

Run `npm run generate` when you want to update `src/document/languages.json`.
Review the diff and commit it if the result is useful. Builds and the application
only read this file; they do not run the generator.

The script loads its sources with `Promise.all`, merges their keyed objects, and
writes the JSON directly. Errors stop the run. There are no temporary files,
retries, cached archives, or recovery steps.

## Sources

Sources are read as follows:

- `iso6391.mjs`: base names from the installed `iso-639-1` package.
- `main.mjs`: additional names and locales from the installed `langmap` package,
  excluding its two fictional pirate locales.
- `rtf.mjs`: RTF codes from the installed `lcid` package.
- `babel.mjs`: downloads the current [Babel source archive](https://github.com/latex3/babel)
  and reads locale names, defaults and Babel names from its INI files in memory.

Babel names take precedence over langmap, then ISO names. Updating the npm data
sources uses npm; Babel's current data is fetched on each generation.

Each loader returns an object keyed by the source's language identifiers.
Babel also returns its declared default locale as `likely` on each entry.
`main.mjs` converts source identifiers to BCP 47 and merges the objects.
RTF codes are attached only to their matching locale; the RTF loader creates no
fallback entries. Generic languages are resolved through the separate alias table. `aliases.mjs` selects specific
language codes using Babel's default locale, or a sole available variant.
The JSON contains `aliases` and a `languages` object keyed by BCP 47 code.
Values contain `name` and optional `native`, `rtf`, `tex`.
An identical native and English name is stored only once. Missing export mappings
are allowed. Names come from the sources, not the machine's UI language.

Source license notices are in [licenses/](licenses/).
