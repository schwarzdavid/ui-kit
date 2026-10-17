# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Hard rules

- **Never commit.** Do not run `git commit`, `git add` for staging a commit, `git commit --amend`, `git tag`, or `npm version` (which creates a commit and tag). Leave all changes uncommitted in the working tree.
- **Never push.** Do not run `git push`, `npm publish`, or anything else that sends code or packages to a remote.
- **Never write comments.** Do not add code comments of any kind (`//`, `/* */`, `<!-- -->`, JSDoc) to any file. Existing `eslint-disable` directives may stay, but do not add explanatory comments.

## Project

`@schwarzdavid/ui-kit` is a Vue 3 + Vuetify component/composable library published to npm as ESM only. Peer dependencies (`vue`, `vuetify`, `vue-i18n`, `@vuelidate/core`) are externalized in the build and must not be bundled.

## Commands

- `npm run docs` — Storybook dev server on port 6006 (primary way to develop and view components)
- `npm run build:lib` — type-check with `vue-tsc` and build the library into `dist/`
- `npm run build:docs` — static Storybook build
- `npm run check` — full `vue-tsc --build --force` type check
- `npm run lint` / `npm run lint:fix` — ESLint (type-checked, stylistic rules)
- `npm run test` — runs the Vitest suite (`vitest run`, jsdom); a single file runs with `npx vitest run path/to/file`; tests live under `lib/**/__tests__/`

## Architecture

- **Entry points:** `lib/main.ts` (main export), `lib/validators.ts` (Vuelidate helpers, exported as `@schwarzdavid/ui-kit/validators`) and `lib/vuetify/index.ts` (the Mail Admin `createVuetify` configuration, exported as `@schwarzdavid/ui-kit/vuetify`; requires Vuetify 4). `lib/vuetify/settings.scss` is emitted to `dist/vuetify/settings.scss` and exported as `@schwarzdavid/ui-kit/vuetify/settings.scss`. Styles are exported as `@schwarzdavid/ui-kit/styles`. Anything public must be re-exported from one of these entry files.
- **Plugin + context:** `createUIKit(options)` (`lib/plugin/createUIKit.ts`) resolves `CreateUIKitOptions` through `resolvePluginOptions()` (deep-merge over `createDefaultPluginOptions()`, except `components`, which are replaced per key and `markRaw`ed), builds a `PluginContext` (reactive `dialogQueue`, `toastQueue`, `toastTimers`, `loadingOverlay` and the readonly `options`) and provides it under the `InjectionKey` in `lib/plugin/constants/injectionKey.ts`. Every composable obtains state via `usePluginContext()`, which throws if the plugin is not installed.
- **Queue + outlet pattern:** Composables like `useDialog` and `useToast` do not render anything themselves; they push entries into the context queues and return Promises. `UiKitOutlet` (which the consuming app mounts once) renders `DialogOutlet`, `ToastOutlet`, and `LoadingOverlay`. The outlets render one `DialogEntryProvider` / `ToastEntryProvider` per entry, which `provide`s the entry context and renders the component from `options.components`. Presets have no props or emits: they call `useDialogEntry()` (`data`, `resolve`, `reject`) or `useToastEntry()` (`entry`, `close`, `trigger`). Toast timers live in the queue (`useToastQueue`), not in the component.
- **Dialog presets:** each preset (Info, Confirm, Prompt, Form) has a props type in `composables/dialog/presets/*Props.ts` and a component in `composables/dialog/components/dialog/presets/`. All four render through the internal `DialogFrame` (widths `sm` 440 / `md` 560 / `lg` 720, Escape handling, fullscreen below `sm` for Prompt and Form). The form component of a consumer registers its value with `useDialogForm(finish)` instead of expose/emit. `useDialog.ts` maps each method to the component configured in `options.components.dialog` and has heavily overloaded generic signatures for return-type inference. Consumers can replace any preset or the toast component through `createUIKit({ components })`.
- **i18n:** button labels come from `options.i18n.messages` in the plugin context. User-supplied strings are passed through `components/internal/MaybeTranslation.vue`, which uses the global `vue-i18n` instance to translate keys when they exist.
- **Docs:** each composable folder has a `*.mdx` doc page plus `docs/stories/*.stories.ts` and `docs/examples/*.vue`. Storybook wraps stories with Vuetify via `.storybook/vuetify/withVuetify.decorator.ts`. Top-level pages live in `lib/docs/*.mdx`; `lib/docs/examples/` holds the custom-presets demo, including `UiKitScope.vue`, which provides a scoped plugin context for stories.

## Conventions

- Import alias `@` maps to `lib/`.
- 4-space indent, single quotes, no semicolons, 1TBS braces; in `.vue` files the `<script>` body is indented one level.
- `internal/` folders hold non-exported helpers; `types/` folders hold interfaces.
- Theme colours in component CSS always carry a stock-Vuetify fallback, e.g. `rgb(var(--v-theme-ink, var(--v-theme-on-surface)))`. Icons are `svg:` paths from `lib/internal/icons.ts`, never `mdi-*` class names.
