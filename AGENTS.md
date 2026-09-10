# Working in MaweJS

- Read the relevant directory README before making changes; start with the
  [repository map](README.md#development).
- The repository includes unused code and historical documentation:
  `src/gui/sketches/` and `src/gui/app/store/`. Do not use them as evidence of
  current behavior or build features there unless explicitly requested.
  Do not delete or rewrite these experiments as incidental cleanup.
- `local/` contains untracked local test material, not application source.
- Keep editor and document logic in `src/`; Electron provides host integration.
- For editor behavior, start in `src/slatejs/` and follow existing patterns.
- Follow the existing JavaScript/JSX style. Check documentation claims against
  active code, and run checks appropriate to the change (see README).
