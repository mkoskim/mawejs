# Generators

Run `npm run generate` to update generated project data. Review the diff before
committing the result.

`scripts/run.mjs` imports and calls each generator's main function. Add another import and call
there when introducing a new generator.

- [Language table](languages/README.md): `languages/main.mjs`
