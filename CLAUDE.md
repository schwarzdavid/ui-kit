# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Hard rules

- **Never commit.** Do not run `git commit`, `git add` for staging a commit, `git commit --amend`, `git tag`, or `npm version` (which creates a commit and tag). Leave all changes uncommitted in the working tree.
- **Never push.** Do not run `git push`, `npm publish`, or anything else that sends code or packages to a remote.
- **Never write comments.** Do not add code comments of any kind (`//`, `/* */`, `<!-- -->`, JSDoc) to any file. Existing `eslint-disable` directives may stay, but do not add explanatory comments.

## Project

`@schwarzdavid/ui-kit` is a Vue 3 + Vuetify component/composable library published to npm as ESM only. Peer dependencies (`vue`, `vuetify`, `pinia`, `vue-i18n`, `@vuelidate/core`) are externalized in the build and must not be bundled.

## Commands

- `npm run docs` — Storybook dev server on port 6006 (primary way to develop and view components)
- `npm run build:lib` — type-check with `vue-tsc` and build the library into `dist/`
- `npm run build:docs` — static Storybook build
- `npm run check` — full `vue-tsc --build --force` type check
- `npm run lint` / `npm run lint:fix` — ESLint (type-checked, stylistic rules)
- Tests: Vitest is configured (`vitest.config.ts`, jsdom) but there is no npm script and no tests yet. Run with `npx vitest run`, a single file with `npx vitest run path/to/file`. Test files are expected under `lib/**/__tests__/`.

## Architecture

- **Entry points:** `lib/main.ts` (main export) and `lib/validators.ts` (Vuelidate helpers, exported as `@schwarzdavid/ui-kit/validators`). Styles are exported as `@schwarzdavid/ui-kit/styles`. Anything public must be re-exported from one of these entry files.
- **Plugin + context:** `createUIKit(options)` (`lib/plugin/createUIKit.ts`) deep-merges user options over `createDefaultPluginOptions()`, builds a `PluginContext` (reactive `dialogQueue`, `toastQueue`, and readonly `options`), and provides it under a symbol stored on `app.__SCHWARZDAVID_UIKIT_SYMBOL__` (typed in `env.d.ts`). Every composable obtains state via `usePluginContext()`, which throws if the plugin is not installed.
- **Queue + outlet pattern:** Composables like `useDialog` and `useToast` do not render anything themselves; they push entries into the context queues and return Promises. `UiKitOutlet` (which the consuming app mounts once) renders `DialogOutlet`, `ToastOutlet`, and `LoadingOverlay`, which read from those queues. Dialog entries are rendered as dynamic components that emit `resolve`/`reject`, which settle the Promise and remove the entry from the queue.
- **Dialog presets:** each preset (Info, Confirm, Prompt, Form) has a props type in `composables/dialog/presets/*Props.ts` and a component in `composables/dialog/components/dialog/presets/`. `useDialog.ts` maps each method to its preset and has heavily overloaded generic signatures for return-type inference.
- **i18n:** button labels come from `options.i18n.messages` in the plugin context. User-supplied strings are passed through `components/internal/MaybeTranslation.vue`, which uses the global `vue-i18n` instance to translate keys when they exist.
- **Docs:** each composable folder has a `*.mdx` doc page plus `docs/stories/*.stories.ts` and `docs/examples/*.vue`. Storybook wraps stories with Vuetify via `.storybook/vuetify/withVuetify.decorator.ts`.

## Conventions

- Import alias `@` maps to `lib/`.
- 4-space indent, single quotes, no semicolons, 1TBS braces; in `.vue` files the `<script>` body is indented one level.
- `internal/` folders hold non-exported helpers; `types/` folders hold interfaces.
