# AGENTS.md

Guidance for AI coding assistants working in this repository.

## Project

MaweJS is an ElectronJS desktop application and a text editor for fiction
writers. It is intended for writing and restructuring long manuscripts.

The main editor is implemented with SlateJS. When changing editor behavior,
first look for existing Slate-related code under `src/slatejs/` and follow
the patterns already used there.

## Architecture

The project is intentionally moving toward an architecture where the editor
logic lives on the client side. The long-term goal is that the editor could
possibly be implemented as a web application later.

Electron is mainly used to provide desktop application capabilities, especially
access to local files. The Electron side may also expose other host information,
but it should not become the place where core editor or document logic lives.

Important directories:

- `electron/` - Electron main-process and backend code.
- `electron/preload/` - preload bridge code exposed to the renderer.
- `src/` - renderer/client application code.
- `src/gui/` - React UI, editor UI, SlateJS integration, views, and styling.
- `src/document/` - document loading, saving, migration, export, and document
  model utilities.
- `src/system/` - renderer-side abstractions for host services such as local
  file access and dialogs.
- `examples/` - example MaweJS documents used for manual testing and fixtures.
- `test/` - project tests.

Keep renderer/client logic in `src/` when possible. Use Electron and preload
code for host integration instead of putting editor behavior in the backend.

## Dead or Local Code

Some directories are intentionally not reliable sources for current behavior:

- `local/` is not committed to GitHub. It contains only local files for testing.
- `src/gui/sketches/` contains old and experimental code. It may be useful as
  inspiration later, for example for file browsing/search features, but do not
  treat it as production code unless the task explicitly says so.

## Development

Common commands:

- `npm run dev` - run the Electron app from source.
- `npm test` - run tests.
- `npm run build` - build the application.

This repository currently uses JavaScript and JSX. Follow the existing style and
file organization unless a task explicitly asks for a broader refactor.
