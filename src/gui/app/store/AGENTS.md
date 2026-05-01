# AGENTS.md

Guidance for AI coding assistants working in this directory.

This Redux store code is not currently used by the application.

Redux state management was tried here, but it did not yet solve the current
application needs. It may be revisited later, so do not delete or rewrite it as
cleanup unless the task explicitly asks for that.

Do not build new features on top of this store unless the task explicitly says
to revive or redesign Redux-based state management.

For current application state and flow, start from `src/gui/app/` and the active
components/views that use React state and context.
