# Best-Practice Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every bug, packaging defect, consistency issue, process gap and documentation gap found in the 2026-10-16 best-practice audit of `@schwarzdavid/ui-kit`, with tests and CI so they stay fixed.

**Architecture:** The library keeps its queue-plus-outlet design. The plugin context moves to an idiomatic Vue `InjectionKey` so composables work inside `setup()` and inside `app.runWithContext()`, and all per-app state (dialog queue, toast queue, loading overlay) lives in that context. Tests use Vitest with jsdom and run composables through `app.runWithContext()` or a mounted host component.

**Tech Stack:** Vue 3.5, Vuetify 4, vue-i18n 11, Vuelidate 2, Vite 8, Vitest 5, vue-tsc 3, ESLint 10 with typescript-eslint 8, Storybook 10, Node 24, npm 11.

**Spec:** The audit report delivered in this session (summarised below as the task list). There is no separate spec file; each task's text is authoritative.

## Global Constraints

- Never run `git commit`, `git add` to stage a commit, `git commit --amend`, `git tag`, `git push`, `npm publish` or `npm version`. Leave every change uncommitted in the working tree. The controller snapshots the working tree for review; implementers never snapshot or commit.
- Never write code comments of any kind in any file: no `//`, `/* */`, `<!-- -->`, JSDoc or YAML `#` comments. Existing `eslint-disable` directives may stay. Prefer code that needs no new `eslint-disable`; if one is unavoidable, use the narrowest `eslint-disable-next-line <rule>` form with no explanation text.
- Style: 4-space indent, single quotes, no semicolons, 1TBS braces. In `.vue` files the `<script>` body is indented one level. Template indentation is 4 spaces.
- Use the `@` alias (maps to `lib/`) for every import that crosses a folder boundary. Do not add `.ts` extensions to import specifiers.
- Peer dependencies (`vue`, `vuetify`, `vue-i18n`, `@vuelidate/core`) must stay externalised in the build. `lodash-es` and `@vuelidate/validators` are runtime dependencies and also externalised. Nothing else may be bundled from `node_modules` except what Vite already bundles today.
- Tests live under `lib/**/__tests__/` and are named `*.test.ts`. Run one file with `npx vitest run <path>`; run everything with `npm test`. Test output must be pristine: no warnings, no stray console output.
- Every task ends with `npm run lint`, `npm run check` and `npm test` all passing, except Task 1 which ends before `npm test` is meaningful and verifies with `npm run build:lib` instead (see the task).
- Vitest runs in jsdom with Vuetify inlined (`server.deps.inline: ['vuetify']`, added in Task 1). jsdom lacks `window.visualViewport`, so tests must not mount `VDialog`-based preset components; test their logic through composables and helpers instead.
- Environment: Windows 11, Git Bash, Node 24.18, npm 11.16. Use forward slashes in paths.

## Review Focus

1. A toast closed by the user before its timeout: the promise returned by `useToast().info()` must resolve exactly once, and the timer must not fire a second resolve. Pinned by the `ToastEntry` tests in Task 3.
2. `useLoading` whose callback rejects: `loading` and the overlay must both reset to `false`. Pinned by the `useLoading` tests in Task 4.
3. A required prompt whose chosen value is `0` or `false`: the save button must be enabled and the dialog must resolve with that value. Pinned by the `isEmptyValue` tests in Task 5.
4. `MaybeTranslation` given plain text that is not an i18n key: it must render the text verbatim and emit no console warning. Pinned by the `MaybeTranslation` tests in Task 6.
5. Two Vue apps on one page each installing the plugin: each app must get its own dialog queue, toast queue and overlay flag. Pinned by the `createUIKit` and `useLoadingOverlay` tests in Task 2.

---

### Task 1: Packaging and dependency hygiene (Phase 1)

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (only through `npm install` and `npm audit fix`)
- Modify: `vite.config.ts`
- Modify: `vitest.config.ts`
- Modify: `tsconfig.node.json`
- Modify: `tsconfig.app.json`
- Create: `lib/internal/createId.ts`
- Create: `lib/internal/__tests__/createId.test.ts`
- Modify: `lib/composables/dialog/internal/useDialogQueue.ts`
- Modify: `lib/composables/toast/internal/useToastQueue.ts`
- Rename: `lib/composables/toast/types/TaostQueueEntry.ts` → `lib/composables/toast/types/ToastQueueEntry.ts`
- Modify: `lib/composables/toast/types/ToastQueue.ts`, `lib/composables/toast/components/ToastEntry.vue`, `lib/plugin/helper/createPluginContext.ts` (import path of the renamed file)
- Modify: `lib/plugin/createUIKit.ts`, `lib/composables/dialog/internal/useDialogCta.ts`, `lib/composables/dialog/components/dialog/presets/ConfirmDialog.vue`, `lib/composables/dialog/components/dialog/presets/InfoDialog.vue`, `lib/composables/vuelidate/validators.ts` (lodash → lodash-es import source only)
- Modify: `.storybook/preview.ts` (remove Pinia)
- Delete: `public/favicon.ico` (and the now-empty `public/` directory)

**Interfaces:**
- Produces: `createId(): string` in `lib/internal/createId.ts`, used by both queues.
- Produces: the file `lib/composables/toast/types/ToastQueueEntry.ts` exporting `ToastQueueEntry` and `CreateToastQueueEntry` (unchanged shapes).
- Produces: `npm test` script, Vitest able to import Vuetify components.

- [ ] **Step 1: Rewrite `package.json`**

Replace the file with exactly this content (devDependency versions are the currently installed ones; only the listed additions and removals change):

```json
{
  "name": "@schwarzdavid/ui-kit",
  "version": "0.0.1-alpha.17",
  "description": "Vue 3 + Vuetify composables and components for dialogs, toasts, loading states and Vuelidate helpers",
  "keywords": [
    "vue",
    "vue3",
    "vuetify",
    "composables",
    "dialog",
    "toast",
    "vuelidate",
    "ui-kit"
  ],
  "homepage": "https://github.com/schwarzdavid/ui-kit#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/schwarzdavid/ui-kit.git"
  },
  "bugs": {
    "url": "https://github.com/schwarzdavid/ui-kit/issues"
  },
  "type": "module",
  "sideEffects": [
    "*.css"
  ],
  "scripts": {
    "check": "vue-tsc --build --force",
    "docs": "storybook dev -p 6006 --no-open",
    "build:lib": "vue-tsc --build --force && vite build",
    "build:docs": "storybook build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "prepublishOnly": "npm run build:lib",
    "update:version": "npm version prerelease --preid alpha"
  },
  "author": "David Schwarz <david@ists-wurscht.at>",
  "license": "Apache-2.0",
  "files": [
    "dist"
  ],
  "module": "./dist/main.js",
  "types": "./dist/main.d.ts",
  "exports": {
    ".": {
      "types": "./dist/main.d.ts",
      "import": "./dist/main.js"
    },
    "./validators": {
      "types": "./dist/validators.d.ts",
      "import": "./dist/validators.js"
    },
    "./styles": "./dist/ui-kit.css"
  },
  "peerDependencies": {
    "@vuelidate/core": "^2.0.0",
    "vue": "^3.5.0",
    "vue-i18n": "^9.0.0 || ^10.0.0 || ^11.0.0",
    "vuetify": "^3.0.0 || ^4.0.0"
  },
  "dependencies": {
    "@vuelidate/validators": "^2.0.4",
    "lodash-es": "^4.18.1",
    "type-fest": "^5.10.0",
    "vue-component-type-helpers": "^3.3.13"
  },
  "devDependencies": {
    "@eslint/js": "10.0.1",
    "@intlify/unplugin-vue-i18n": "11.2.6",
    "@mdi/font": "7.4.47",
    "@microsoft/api-extractor": "7.59.4",
    "@storybook/addon-docs": "10.6.2",
    "@storybook/vue3-vite": "10.6.2",
    "@stylistic/eslint-plugin": "5.10.0",
    "@tsconfig/node24": "24.0.5",
    "@types/jsdom": "30.0.0",
    "@types/lodash-es": "4.17.12",
    "@types/node": "26.6.5",
    "@vitejs/plugin-vue": "6.0.10",
    "@vitest/eslint-plugin": "1.6.27",
    "@vue/test-utils": "2.5.1",
    "@vue/tsconfig": "0.9.1",
    "@vuelidate/core": "2.0.3",
    "eslint": "10.12.0",
    "eslint-plugin-storybook": "10.6.2",
    "eslint-plugin-vue": "10.11.1",
    "jsdom": "30.1.3",
    "sass": "1.105.1",
    "storybook": "10.6.2",
    "typescript": "6.0.3",
    "typescript-eslint": "8.71.2",
    "vite": "8.3.4",
    "vite-plugin-dts": "5.1.2",
    "vitest": "5.0.5",
    "vue": "3.5.44",
    "vue-component-type-helpers": "3.3.13",
    "vue-eslint-parser": "10.4.1",
    "vue-i18n": "11.4.14",
    "vue-tsc": "3.3.13",
    "vuetify": "4.2.6"
  },
  "overrides": {
    "vite": "8.3.4"
  }
}
```

Removed on purpose: `@chromatic-com/storybook`, `@laynezh/vite-plugin-lib-assets`, `@storybook/addon-links`, `@storybook/addon-onboarding`, `@types/lodash`, `@types/uuid`, `@vitejs/plugin-vue-jsx`, `pinia`, `uuid`, `lodash`, the `preview` script. `type-fest` and `vue-component-type-helpers` move to `dependencies` because the shipped `.d.ts` files import them. `vue` becomes a pinned devDependency.

- [ ] **Step 2: Rewrite `vite.config.ts`**

```ts
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [
        dts({ bundleTypes: true, tsconfigPath: 'tsconfig.app.json' }),
        vue(),
        VueI18nPlugin({ runtimeOnly: false }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./lib', import.meta.url)),
        },
    },
    publicDir: false,
    build: {
        lib: {
            entry: {
                main: resolve(import.meta.dirname, 'lib/main.ts'),
                validators: resolve(import.meta.dirname, 'lib/validators.ts'),
            },
            formats: ['es'],
        },
        rollupOptions: {
            external: [
                'vue',
                'vuetify',
                'vuetify/components',
                'vue-i18n',
                '@vuelidate/core',
                '@vuelidate/validators',
                'lodash-es',
            ],
        },
    },
})
```

- [ ] **Step 3: Rewrite `vitest.config.ts`**

```ts
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            root: fileURLToPath(new URL('./', import.meta.url)),
            server: {
                deps: {
                    inline: ['vuetify'],
                },
            },
        },
    }),
)
```

- [ ] **Step 4: Update `tsconfig.node.json` and `tsconfig.app.json`**

`tsconfig.node.json` becomes:

```json
{
  "extends": "@tsconfig/node24/tsconfig.json",
  "include": [
    "vite.config.*",
    "vitest.config.*"
  ],
  "compilerOptions": {
    "composite": true,
    "noEmit": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "types": ["node"]
  }
}
```

In `tsconfig.app.json` change the `exclude` entry from `"lib/**/__tests__/*"` to `"lib/**/__tests__/**"`.

- [ ] **Step 5: Install and prune dependencies**

Run: `npm install`
Then: `npm audit fix` (never `--force`).
Expected: `node_modules/uuid`, `node_modules/@types/uuid`, `node_modules/pinia` no longer listed by `npm ls uuid @types/uuid pinia @vitejs/plugin-vue-jsx` (each reports `(empty)`), and `npm ls vue lodash-es @types/lodash-es` shows `vue@3.5.44`, `lodash-es@4.18.1` and `@types/lodash-es@4.17.12`.

- [ ] **Step 6: Write the failing test for `createId`**

`lib/internal/__tests__/createId.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createId } from '@/internal/createId'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('createId', () => {
    it('returns a version 4 UUID', () => {
        expect(createId()).toMatch(UUID_PATTERN)
    })

    it('returns a different id on every call', () => {
        const ids = new Set(Array.from({ length: 100 }, () => createId()))
        expect(ids.size).toBe(100)
    })
})
```

Run: `npx vitest run lib/internal/__tests__/createId.test.ts`
Expected: FAIL because `@/internal/createId` does not exist.

- [ ] **Step 7: Create `lib/internal/createId.ts`**

```ts
export function createId(): string {
    return crypto.randomUUID()
}
```

Run: `npx vitest run lib/internal/__tests__/createId.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 8: Use `createId` in both queues and drop `uuid`**

In `lib/composables/dialog/internal/useDialogQueue.ts` remove the `v4` import and the whole `generateId` function; import `createId` from `@/internal/createId` and in `addToQueue` use `const id = createId()`. Replace the relative imports of `../types/DialogQueue` and `../types/DialogQueueEntry` with `@/composables/dialog/types/DialogQueue` and `@/composables/dialog/types/DialogQueueEntry`.

Apply the same change to `lib/composables/toast/internal/useToastQueue.ts` (remove `v4` import and `generateId`, use `createId()`).

- [ ] **Step 9: Rename the toast entry type file**

Rename `lib/composables/toast/types/TaostQueueEntry.ts` to `lib/composables/toast/types/ToastQueueEntry.ts` with `git mv` is forbidden (it stages); use a plain file rename (`mv`) instead. Update the import path in `lib/composables/toast/internal/useToastQueue.ts`, `lib/composables/toast/types/ToastQueue.ts`, `lib/composables/toast/components/ToastEntry.vue` and `lib/plugin/helper/createPluginContext.ts` to `@/composables/toast/types/ToastQueueEntry`.

- [ ] **Step 10: Switch lodash imports to lodash-es**

In each of `lib/plugin/createUIKit.ts`, `lib/composables/dialog/internal/useDialogCta.ts`, `lib/composables/dialog/components/dialog/presets/ConfirmDialog.vue`, `lib/composables/dialog/components/dialog/presets/InfoDialog.vue` and `lib/composables/vuelidate/validators.ts` change `from 'lodash'` to `from 'lodash-es'`. Nothing else in those files changes in this task.

- [ ] **Step 11: Remove Pinia from Storybook and delete `public/`**

In `.storybook/preview.ts` delete the line `import { createPinia } from 'pinia'` and the line `app.use(createPinia())`. Delete `public/favicon.ico` and the `public` directory.

- [ ] **Step 12: Verify**

Run, in order, and all must succeed:

```bash
npm run lint
npm run check
npx vitest run lib/internal/__tests__/createId.test.ts
npm run build:lib
```

Then confirm the build output:

```bash
ls dist
grep -ho "from *['\"][^'\"]*['\"]" dist/*.js | sort -u
grep -ho "from *['\"][^'\"]*['\"]" dist/*.d.ts | sort -u
```

Expected: `dist` contains only `main.js`, `main.d.ts`, `validators.js`, `validators.d.ts`, `ui-kit.css` (no `favicon.ico`). JS imports come only from `vue`, `vuetify`, `vuetify/components`, `vue-i18n`, `@vuelidate/core`, `@vuelidate/validators` and `lodash-es`. The `.d.ts` files import only from `vue`, `@vuelidate/core`, `@vuelidate/validators`, `type-fest` and `vue-component-type-helpers`. Finally run `npm audit --omit=dev` and expect `found 0 vulnerabilities`.

---

### Task 2: Plugin context through an InjectionKey (Phase 3 foundation)

**Files:**
- Create: `lib/plugin/constants/injectionKey.ts`
- Create: `lib/plugin/types/PluginContext.ts`
- Modify: `lib/plugin/helper/createPluginContext.ts`
- Modify: `lib/plugin/createUIKit.ts`
- Modify: `lib/plugin/composables/usePluginContext.ts`
- Modify: `lib/plugin/constants/errors.ts`
- Modify: `lib/composables/loading-overlay/useLoadingOverlay.ts`
- Modify: `env.d.ts`
- Create: `lib/__tests__/helpers/createTestApp.ts`
- Create: `lib/plugin/__tests__/usePluginContext.test.ts`
- Create: `lib/plugin/__tests__/createUIKit.test.ts`
- Create: `lib/composables/loading-overlay/__tests__/useLoadingOverlay.test.ts`

**Interfaces:**
- Consumes: `ToastQueueEntry` from `@/composables/toast/types/ToastQueueEntry` (Task 1).
- Produces: `UI_KIT_INJECTION_KEY: InjectionKey<PluginContext>`; `PluginContext` now has `loadingOverlay: Ref<boolean>`; `usePluginContext()` works inside `setup()` and inside `app.runWithContext()`; test helpers `createTestApp(options?)` and `runWithUiKit(callback, options?)`.

- [ ] **Step 1: Write the failing tests**

`lib/__tests__/helpers/createTestApp.ts`:

```ts
import { type App, createApp } from 'vue'
import type { PartialDeep } from 'type-fest'
import { createUIKit } from '@/plugin/createUIKit'
import type { PluginOptions } from '@/plugin/types/PluginOptions'

export function createTestApp(options?: PartialDeep<PluginOptions>): App {
    const app = createApp({ render: () => null })
    app.use(createUIKit(options))
    return app
}

export function runWithUiKit<T>(callback: () => T, options?: PartialDeep<PluginOptions>): T {
    return createTestApp(options).runWithContext(callback)
}
```

`lib/plugin/__tests__/usePluginContext.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { usePluginContext } from '@/plugin/composables/usePluginContext'
import { createUIKit } from '@/plugin/createUIKit'
import { Errors } from '@/plugin/constants/errors'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('usePluginContext', () => {
    it('throws when the plugin is not installed', () => {
        const app = createApp({ render: () => null })
        expect(() => app.runWithContext(() => usePluginContext())).toThrow(Errors.NOT_INSTALLED)
    })

    it('returns the context inside app.runWithContext', () => {
        const context = createTestApp().runWithContext(() => usePluginContext())
        expect(context.dialogQueue.value).toEqual([])
        expect(context.toastQueue.value).toEqual([])
        expect(context.loadingOverlay.value).toBe(false)
    })

    it('returns the context inside component setup', () => {
        let received: unknown = null
        const Host = defineComponent({
            setup() {
                received = usePluginContext()
                return () => h('div')
            },
        })
        mount(Host, { global: { plugins: [createUIKit()] } })
        expect(received).not.toBeNull()
    })

    it('returns the same context for every call within one app', () => {
        const app = createTestApp()
        const first = app.runWithContext(() => usePluginContext())
        const second = app.runWithContext(() => usePluginContext())
        expect(first).toBe(second)
    })
})
```

`lib/plugin/__tests__/createUIKit.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { usePluginContext } from '@/plugin/composables/usePluginContext'
import { createDefaultPluginOptions } from '@/plugin/helper/createDefaultPluginOptions'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('createUIKit', () => {
    it('uses the default options when none are given', () => {
        const { options } = createTestApp().runWithContext(() => usePluginContext())
        expect(options).toEqual(createDefaultPluginOptions())
    })

    it('deep-merges user options over the defaults', () => {
        const { options } = createTestApp({ toast: { timeout: 10 }, i18n: { messages: { yes: 'custom.yes' } } })
            .runWithContext(() => usePluginContext())
        expect(options.toast.timeout).toBe(10)
        expect(options.i18n.messages.yes).toBe('custom.yes')
        expect(options.i18n.messages.no).toBe('common.no')
        expect(options.loading).toEqual({ delay: 2000, overlay: false })
    })

    it('gives every app its own context', () => {
        const first = createTestApp().runWithContext(() => usePluginContext())
        const second = createTestApp().runWithContext(() => usePluginContext())
        expect(first).not.toBe(second)
    })
})
```

`lib/composables/loading-overlay/__tests__/useLoadingOverlay.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { useLoadingOverlay } from '@/composables/loading-overlay/useLoadingOverlay'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('useLoadingOverlay', () => {
    it('is scoped to the app instance', () => {
        const first = createTestApp().runWithContext(() => useLoadingOverlay())
        const second = createTestApp().runWithContext(() => useLoadingOverlay())
        first.value = true
        expect(second.value).toBe(false)
    })

    it('returns the same ref within one app', () => {
        const app = createTestApp()
        const first = app.runWithContext(() => useLoadingOverlay())
        const second = app.runWithContext(() => useLoadingOverlay())
        expect(first).toBe(second)
    })
})
```

Run: `npx vitest run lib/plugin lib/composables/loading-overlay`
Expected: FAIL. `usePluginContext` throws inside `runWithContext` because it still relies on `getCurrentInstance()`, `loadingOverlay` is missing from the context, and the overlay is a module singleton.

- [ ] **Step 2: Create the injection key and context type**

`lib/plugin/types/PluginContext.ts`:

```ts
import type { DeepReadonly, Ref } from 'vue'
import type { DialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'
import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import type { PluginOptions } from '@/plugin/types/PluginOptions'

export interface PluginContext {
    dialogQueue: Ref<DialogQueueEntry[]>
    toastQueue: Ref<ToastQueueEntry[]>
    loadingOverlay: Ref<boolean>
    options: DeepReadonly<PluginOptions>
}
```

`lib/plugin/constants/injectionKey.ts`:

```ts
import type { InjectionKey } from 'vue'
import type { PluginContext } from '@/plugin/types/PluginContext'

export const UI_KIT_INJECTION_KEY: InjectionKey<PluginContext> = Symbol('@schwarzdavid/ui-kit')
```

- [ ] **Step 3: Rewrite the plugin files**

`lib/plugin/helper/createPluginContext.ts`:

```ts
import { ref } from 'vue'
import type { DialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'
import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import type { PluginContext } from '@/plugin/types/PluginContext'
import type { PluginOptions } from '@/plugin/types/PluginOptions'

export function createPluginContext(options: PluginOptions): PluginContext {
    return {
        dialogQueue: ref<DialogQueueEntry[]>([]),
        toastQueue: ref<ToastQueueEntry[]>([]),
        loadingOverlay: ref(false),
        options,
    }
}
```

`lib/plugin/createUIKit.ts`:

```ts
import type { FunctionPlugin } from 'vue'
import type { PartialDeep } from 'type-fest'
import { merge } from 'lodash-es'
import type { PluginOptions } from '@/plugin/types/PluginOptions'
import { createDefaultPluginOptions } from '@/plugin/helper/createDefaultPluginOptions'
import { createPluginContext } from '@/plugin/helper/createPluginContext'
import { UI_KIT_INJECTION_KEY } from '@/plugin/constants/injectionKey'

export function createUIKit(options?: PartialDeep<PluginOptions>): FunctionPlugin<undefined[]> {
    return (app) => {
        const mergedOptions = merge(createDefaultPluginOptions(), options)
        app.provide(UI_KIT_INJECTION_KEY, createPluginContext(mergedOptions))
    }
}
```

`lib/plugin/constants/errors.ts`:

```ts
export const Errors = {
    NOT_INSTALLED: '@schwarzdavid/ui-kit is not available in this context. Install it with app.use(createUIKit()) and call its composables inside setup() or app.runWithContext().',
} as const
```

`lib/plugin/composables/usePluginContext.ts`:

```ts
import { inject } from 'vue'
import { Errors } from '@/plugin/constants/errors'
import { UI_KIT_INJECTION_KEY } from '@/plugin/constants/injectionKey'
import type { PluginContext } from '@/plugin/types/PluginContext'

export function usePluginContext(): PluginContext {
    const context = inject(UI_KIT_INJECTION_KEY, null)
    if (!context) {
        throw new Error(Errors.NOT_INSTALLED)
    }
    return context
}
```

`lib/composables/loading-overlay/useLoadingOverlay.ts`:

```ts
import type { Ref } from 'vue'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export function useLoadingOverlay(): Ref<boolean> {
    return usePluginContext().loadingOverlay
}
```

`env.d.ts` becomes the single line:

```ts
/// <reference types="vite/client" />
```

Search the codebase for any remaining reference to `__SCHWARZDAVID_UIKIT_SYMBOL__` or to `PluginContext` imported from `@/plugin/helper/createPluginContext` and update it to the new type file.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run lib/plugin lib/composables/loading-overlay`
Expected: PASS, 9 tests, no Vue warnings in the output.

- [ ] **Step 5: Verify**

Run `npm run lint`, `npm run check`, `npm test`. All pass.

---

### Task 3: Toast fixes (Phase 1)

**Files:**
- Modify: `lib/composables/toast/components/ToastEntry.vue`
- Modify: `lib/composables/toast/components/ToastOutlet.vue`
- Modify: `lib/composables/toast/useToast.ts`
- Create: `lib/composables/toast/__tests__/useToastQueue.test.ts`
- Create: `lib/composables/toast/__tests__/useToast.test.ts`
- Create: `lib/composables/toast/__tests__/ToastEntry.test.ts`

**Interfaces:**
- Consumes: `createTestApp`, `runWithUiKit` from `@/__tests__/helpers/createTestApp` (Task 2).
- Produces: `ToastFunction` type exported from `useToast.ts`; `ToastComposable` members become properties of that type.

- [ ] **Step 1: Write the failing tests**

`lib/composables/toast/__tests__/useToastQueue.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'
import type { CreateToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import { runWithUiKit } from '@/__tests__/helpers/createTestApp'

function createEntry(resolve = vi.fn()): CreateToastQueueEntry {
    return { message: 'hello', resolve, timeout: 100, translateMessage: false, type: ToastType.INFO }
}

describe('useToastQueue', () => {
    it('prepends new entries and assigns unique ids', () => {
        const queue = runWithUiKit(() => useToastQueue())
        const first = queue.addToQueue(createEntry())
        const second = queue.addToQueue(createEntry())
        expect(queue.queue.value.map(entry => entry.id)).toEqual([second.id, first.id])
        expect(first.id).not.toBe(second.id)
    })

    it('resolving an entry removes it and calls the original resolve', () => {
        const resolve = vi.fn()
        const queue = runWithUiKit(() => useToastQueue())
        const entry = queue.addToQueue(createEntry(resolve))
        entry.resolve()
        expect(queue.queue.value).toHaveLength(0)
        expect(resolve).toHaveBeenCalledTimes(1)
    })

    it('removeFromQueue accepts an id or an entry and ignores unknown ids', () => {
        const queue = runWithUiKit(() => useToastQueue())
        const first = queue.addToQueue(createEntry())
        const second = queue.addToQueue(createEntry())
        queue.removeFromQueue(first.id)
        queue.removeFromQueue(second)
        queue.removeFromQueue('unknown')
        expect(queue.queue.value).toHaveLength(0)
    })
})
```

`lib/composables/toast/__tests__/useToast.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { useToast } from '@/composables/toast/useToast'
import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('useToast', () => {
    it.each([
        ['info', ToastType.INFO],
        ['warn', ToastType.WARNING],
        ['error', ToastType.ERROR],
        ['success', ToastType.SUCCESS],
    ] as const)('%s queues an entry of the matching type with plugin defaults', (method, type) => {
        const app = createTestApp({ toast: { timeout: 1234 } })
        const toast = app.runWithContext(() => useToast())
        const queue = app.runWithContext(() => useToastQueue())
        void toast[method]('msg')
        expect(queue.queue.value[0]).toMatchObject({ message: 'msg', type, timeout: 1234, translateMessage: true })
    })

    it('per-call options override plugin defaults', () => {
        const app = createTestApp()
        const toast = app.runWithContext(() => useToast())
        const queue = app.runWithContext(() => useToastQueue())
        void toast.info('msg', { timeout: 5, translateMessage: false })
        expect(queue.queue.value[0]).toMatchObject({ timeout: 5, translateMessage: false })
    })

    it('the returned promise resolves when the entry is resolved', async () => {
        const app = createTestApp()
        const toast = app.runWithContext(() => useToast())
        const queue = app.runWithContext(() => useToastQueue())
        const pending = toast.success('msg')
        queue.queue.value[0].resolve()
        await expect(pending).resolves.toBeUndefined()
        expect(queue.queue.value).toHaveLength(0)
    })
})
```

`lib/composables/toast/__tests__/ToastEntry.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { VAlert } from 'vuetify/components'
import { createI18n } from 'vue-i18n'
import ToastEntry from '@/composables/toast/components/ToastEntry.vue'
import { ToastType } from '@/composables/toast/types/ToastType'

function mountEntry() {
    const resolve = vi.fn()
    const entry = { id: 'id', message: 'hello', resolve, timeout: 1000, translateMessage: false, type: ToastType.SUCCESS }
    const wrapper = mount(ToastEntry, {
        props: { entry },
        global: {
            plugins: [createVuetify(), createI18n({ legacy: false, locale: 'en', messages: { en: {} } })],
        },
    })
    return { wrapper, resolve }
}

describe('ToastEntry', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders the message', () => {
        const { wrapper } = mountEntry()
        expect(wrapper.text()).toContain('hello')
    })

    it('resolves the entry when the timeout elapses', () => {
        const { resolve } = mountEntry()
        vi.advanceTimersByTime(999)
        expect(resolve).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1)
        expect(resolve).toHaveBeenCalledTimes(1)
    })

    it('resolves exactly once when closed manually before the timeout', async () => {
        const { wrapper, resolve } = mountEntry()
        await wrapper.findComponent(VAlert).vm.$emit('click:close')
        vi.advanceTimersByTime(1000)
        expect(resolve).toHaveBeenCalledTimes(1)
    })

    it('does not resolve after being unmounted', () => {
        const { wrapper, resolve } = mountEntry()
        wrapper.unmount()
        vi.advanceTimersByTime(1000)
        expect(resolve).not.toHaveBeenCalled()
    })
})
```

Run: `npx vitest run lib/composables/toast`
Expected: FAIL. The promise test hangs or fails because `ToastEntry` never calls `entry.resolve`, and the "exactly once" and unmount tests fail for the same reason.

- [ ] **Step 2: Rewrite `ToastEntry.vue`**

```vue
<template>
    <VAlert
        theme="dark"
        class="toast-entry"
        closable
        density="compact"
        @click:close="closeToast">
        <MaybeTranslation :content="entry.message" :translate="entry.translateMessage" />
        <template #prepend>
            <VIcon :icon="icon" :color="color" />
        </template>
    </VAlert>
</template>

<script lang="ts" setup>
    import { computed, onBeforeUnmount, onMounted } from 'vue'
    import { VAlert, VIcon } from 'vuetify/components'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
    import { ToastType } from '@/composables/toast/types/ToastType'

    const TYPE_ICON_MAP: Record<ToastType, string> = {
        [ToastType.ERROR]: '$error',
        [ToastType.SUCCESS]: '$success',
        [ToastType.INFO]: '$info',
        [ToastType.WARNING]: '$warning',
    }

    const TYPE_COLOR_MAP: Record<ToastType, string> = {
        [ToastType.ERROR]: 'error',
        [ToastType.SUCCESS]: 'success',
        [ToastType.INFO]: 'primary',
        [ToastType.WARNING]: 'warning',
    }

    const props = defineProps<{
        entry: ToastQueueEntry
    }>()

    const icon = computed(() => TYPE_ICON_MAP[props.entry.type])
    const color = computed(() => TYPE_COLOR_MAP[props.entry.type])

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function clearTimer(): void {
        if (timeoutId !== null) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
    }

    function closeToast(): void {
        clearTimer()
        props.entry.resolve()
    }

    onMounted(() => {
        timeoutId = setTimeout(closeToast, props.entry.timeout)
    })

    onBeforeUnmount(clearTimer)
</script>

<style lang="scss" scoped>
.toast-entry {
    pointer-events: all;

    &:deep(.v-alert__prepend) {
        align-self: center;
    }
}
</style>
```

- [ ] **Step 3: Fix `ToastOutlet.vue` indentation and add a live region**

Replace the template with:

```vue
<template>
    <TransitionGroup
        name="fade"
        tag="div"
        class="toast-outlet"
        :class="outletClasses"
        role="status"
        aria-live="polite"
        @before-leave="onBeforeLeave">
        <ToastEntry v-for="entry in queue" :key="entry.id" :entry="entry" />
    </TransitionGroup>
</template>
```

The script and style blocks stay as they are.

- [ ] **Step 4: Rewrite `useToast.ts` without the four copies**

```ts
import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'
import type { ToastOptions } from '@/composables/toast/types/ToastOptions'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export type ToastFunction = (message: string, options?: Partial<ToastOptions>) => Promise<void>

export interface ToastComposable {
    info: ToastFunction
    warn: ToastFunction
    error: ToastFunction
    success: ToastFunction
}

export function useToast(): ToastComposable {
    const toastQueue = useToastQueue()
    const { options: { toast: defaultOptions } } = usePluginContext()

    function createToastFunction(type: ToastType): ToastFunction {
        return (message, options) => new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: options?.timeout ?? defaultOptions.timeout,
                translateMessage: options?.translateMessage ?? true,
                type,
            })
        })
    }

    return {
        info: createToastFunction(ToastType.INFO),
        warn: createToastFunction(ToastType.WARNING),
        error: createToastFunction(ToastType.ERROR),
        success: createToastFunction(ToastType.SUCCESS),
    }
}
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run lib/composables/toast`
Expected: PASS, 10 tests, pristine output.

- [ ] **Step 6: Verify**

Run `npm run lint`, `npm run check`, `npm test`. All pass.

---

### Task 4: useLoading fixes (Phase 1)

**Files:**
- Modify: `lib/composables/loading/useLoading.ts`
- Create: `lib/composables/loading/__tests__/useLoading.test.ts`

**Interfaces:**
- Consumes: `createTestApp` (Task 2), `useLoadingOverlay` from the context (Task 2).
- Produces: `LoadingAction = (...args: never[]) => unknown`; `useLoading(callback, options?)` honours per-call `delay` and `overlay`.

- [ ] **Step 1: Write the failing tests**

`lib/composables/loading/__tests__/useLoading.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLoading } from '@/composables/loading/useLoading'
import { useLoadingOverlay } from '@/composables/loading-overlay/useLoadingOverlay'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('useLoading', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns the callback result and toggles loading', async () => {
        const app = createTestApp({ loading: { delay: false } })
        const { loading, action } = app.runWithContext(() => useLoading((value: number) => Promise.resolve(value * 2)))
        const pending = action(21)
        expect(loading.value).toBe(true)
        await expect(pending).resolves.toBe(42)
        expect(loading.value).toBe(false)
    })

    it('waits at least the configured delay', async () => {
        const app = createTestApp({ loading: { delay: 500 } })
        const { loading, action } = app.runWithContext(() => useLoading(() => Promise.resolve('done')))
        const pending = action()
        await vi.advanceTimersByTimeAsync(499)
        expect(loading.value).toBe(true)
        await vi.advanceTimersByTimeAsync(1)
        await expect(pending).resolves.toBe('done')
        expect(loading.value).toBe(false)
    })

    it('per-call options override the plugin defaults', async () => {
        const app = createTestApp({ loading: { delay: 500, overlay: false } })
        const overlay = app.runWithContext(() => useLoadingOverlay())
        const { action } = app.runWithContext(() => useLoading(() => Promise.resolve(), { delay: false, overlay: true }))
        const pending = action()
        expect(overlay.value).toBe(true)
        await pending
        expect(overlay.value).toBe(false)
    })

    it('does not touch the overlay when overlay is disabled', async () => {
        const app = createTestApp({ loading: { delay: false } })
        const overlay = app.runWithContext(() => useLoadingOverlay())
        const { action } = app.runWithContext(() => useLoading(() => Promise.resolve()))
        const pending = action()
        expect(overlay.value).toBe(false)
        await pending
    })

    it('resets loading and the overlay when the callback rejects', async () => {
        const app = createTestApp({ loading: { delay: false, overlay: true } })
        const overlay = app.runWithContext(() => useLoadingOverlay())
        const { loading, action } = app.runWithContext(() => useLoading(() => Promise.reject(new Error('boom'))))
        await expect(action()).rejects.toThrow('boom')
        expect(loading.value).toBe(false)
        expect(overlay.value).toBe(false)
    })
})
```

Run: `npx vitest run lib/composables/loading`
Expected: FAIL on "per-call options override the plugin defaults" because the options parameter is ignored.

- [ ] **Step 2: Rewrite `useLoading.ts`**

```ts
import { readonly, type Ref, ref } from 'vue'
import { useLoadingOverlay } from '@/composables/loading-overlay/useLoadingOverlay'
import type { PluginLoadingOptions } from '@/plugin/types/PluginOptions'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export type LoadingAction = (...args: never[]) => unknown

export interface LoadingComposable<A extends LoadingAction> {
    loading: Readonly<Ref<boolean>>
    action(...args: Parameters<A>): Promise<Awaited<ReturnType<A>>>
}

function minimumDuration(millis: number | false): Promise<void> {
    if (!millis) {
        return Promise.resolve()
    }
    return new Promise((resolve) => {
        setTimeout(resolve, millis)
    })
}

export function useLoading<A extends LoadingAction>(actionCallback: A, options: Partial<PluginLoadingOptions> = {}): LoadingComposable<A> {
    const { options: { loading: defaultOptions } } = usePluginContext()
    const delay = options.delay ?? defaultOptions.delay
    const overlay = options.overlay ?? defaultOptions.overlay
    const loading = ref(false)
    const isOverlayActive = useLoadingOverlay()
    const callback = actionCallback as (...args: Parameters<A>) => ReturnType<A>

    async function action(...args: Parameters<A>): Promise<Awaited<ReturnType<A>>> {
        loading.value = true
        if (overlay) {
            isOverlayActive.value = true
        }
        try {
            const [result] = await Promise.all([
                callback(...args),
                minimumDuration(delay),
            ])
            return result
        } finally {
            loading.value = false
            if (overlay) {
                isOverlayActive.value = false
            }
        }
    }

    return { loading: readonly(loading), action }
}
```

- [ ] **Step 3: Run the tests**

Run: `npx vitest run lib/composables/loading`
Expected: PASS, 5 tests.

- [ ] **Step 4: Verify**

Run `npm run lint`, `npm run check`, `npm test`. All pass. Also confirm `lib/composables/dialog/components/dialog/presets/FormDialog.vue` and `lib/composables/loading/docs/examples/LoadingExample.vue` still type-check against the new `LoadingAction` constraint (they are covered by `npm run check`).

---

### Task 5: Dialog logic fixes (Phase 1 and Phase 3)

**Files:**
- Modify: `lib/composables/dialog/presets/FormDialogProps.ts`
- Modify: `lib/composables/dialog/presets/InfoDialogProps.ts`
- Modify: `lib/composables/dialog/components/dialog/presets/FormDialog.vue`
- Modify: `lib/composables/dialog/components/dialog/presets/PromptDialog.vue`
- Modify: `lib/composables/dialog/components/dialog/presets/ConfirmDialog.vue`
- Modify: `lib/composables/dialog/components/dialog/presets/InfoDialog.vue`
- Create: `lib/composables/dialog/internal/isEmptyValue.ts`
- Create: `lib/composables/dialog/__tests__/isEmptyValue.test.ts`
- Create: `lib/composables/dialog/__tests__/useDialogCta.test.ts`
- Create: `lib/composables/dialog/__tests__/useDialogQueue.test.ts`
- Create: `lib/composables/dialog/__tests__/useDialog.test.ts`

**Interfaces:**
- Consumes: `runWithUiKit`, `createTestApp` (Task 2); `useDialogCta(options, messageKey)` (existing).
- Produces: `isEmptyValue(value: unknown): boolean`; `FormDialogProps.translateTitle?: boolean`; `InfoDialogBaseProps.defaultCta?: Partial<DialogCta> | false`.

- [ ] **Step 1: Write the failing tests**

`lib/composables/dialog/__tests__/isEmptyValue.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isEmptyValue } from '@/composables/dialog/internal/isEmptyValue'

describe('isEmptyValue', () => {
    it.each([
        null,
        undefined,
        '',
        [],
        {},
        new Map(),
        new Set(),
        new Date('invalid'),
    ])('treats %s as empty', (value) => {
        expect(isEmptyValue(value)).toBe(true)
    })

    it.each([
        0,
        false,
        'text',
        [0],
        { key: 1 },
        new Map([['a', 1]]),
        new Set([1]),
        new Date(0),
    ])('treats %s as a value', (value) => {
        expect(isEmptyValue(value)).toBe(false)
    })
})
```

`lib/composables/dialog/__tests__/useDialogCta.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
import { runWithUiKit } from '@/__tests__/helpers/createTestApp'

describe('useDialogCta', () => {
    it('falls back to the configured i18n message key', () => {
        const cta = runWithUiKit(() => useDialogCta(undefined, 'save'))
        expect(cta).toEqual({ text: 'action.save', translateText: true })
    })

    it('uses custom message keys from the plugin options', () => {
        const cta = runWithUiKit(() => useDialogCta(undefined, 'yes'), { i18n: { messages: { yes: 'custom.yes' } } })
        expect(cta.text).toBe('custom.yes')
    })

    it('lets explicit options override the defaults', () => {
        const cta = runWithUiKit(() => useDialogCta({ text: 'Click me', translateText: false }, 'cancel'))
        expect(cta).toEqual({ text: 'Click me', translateText: false })
    })

    it('ignores undefined option values', () => {
        const cta = runWithUiKit(() => useDialogCta({ text: undefined }, 'close'))
        expect(cta.text).toBe('action.close')
    })
})
```

`lib/composables/dialog/__tests__/useDialogQueue.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { useDialogQueue } from '@/composables/dialog/internal/useDialogQueue'
import type { CreateDialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'
import { runWithUiKit } from '@/__tests__/helpers/createTestApp'

const Dummy = defineComponent({ render: () => null })

function createEntry(resolve = vi.fn(), reject = vi.fn()): CreateDialogQueueEntry {
    return { component: Dummy, props: {}, resolve, reject }
}

describe('useDialogQueue', () => {
    it('appends entries in order with unique ids', () => {
        const queue = runWithUiKit(() => useDialogQueue())
        const first = queue.addToQueue(createEntry())
        const second = queue.addToQueue(createEntry())
        expect(queue.queue.value.map(entry => entry.id)).toEqual([first.id, second.id])
        expect(first.id).not.toBe(second.id)
    })

    it('resolve removes the entry and forwards the value', () => {
        const resolve = vi.fn()
        const queue = runWithUiKit(() => useDialogQueue())
        const entry = queue.addToQueue(createEntry(resolve))
        entry.resolve('value')
        expect(queue.queue.value).toHaveLength(0)
        expect(resolve).toHaveBeenCalledWith('value')
    })

    it('reject removes the entry and forwards the reason', () => {
        const reject = vi.fn()
        const queue = runWithUiKit(() => useDialogQueue())
        const entry = queue.addToQueue(createEntry(vi.fn(), reject))
        entry.reject('reason')
        expect(queue.queue.value).toHaveLength(0)
        expect(reject).toHaveBeenCalledWith('reason')
    })

    it('removeFromQueue accepts an id or an entry and ignores unknown ids', () => {
        const queue = runWithUiKit(() => useDialogQueue())
        const first = queue.addToQueue(createEntry())
        const second = queue.addToQueue(createEntry())
        queue.removeFromQueue(first.id)
        queue.removeFromQueue(second)
        queue.removeFromQueue('unknown')
        expect(queue.queue.value).toHaveLength(0)
    })
})
```

`lib/composables/dialog/__tests__/useDialog.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { useDialog } from '@/composables/dialog/useDialog'
import { useDialogQueue } from '@/composables/dialog/internal/useDialogQueue'
import InfoDialog from '@/composables/dialog/components/dialog/presets/InfoDialog.vue'
import ConfirmDialog from '@/composables/dialog/components/dialog/presets/ConfirmDialog.vue'
import { ConfirmDialogLevel } from '@/composables/dialog/presets/ConfirmDialogProps'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

function setup() {
    const app = createTestApp()
    return {
        dialog: app.runWithContext(() => useDialog()),
        queue: app.runWithContext(() => useDialogQueue()),
    }
}

describe('useDialog', () => {
    it('info(title, content) queues an InfoDialog and resolves with the emitted value', async () => {
        const { dialog, queue } = setup()
        const pending = dialog.info('Title', 'Content')
        const entry = queue.queue.value[0]
        expect(entry.component).toBe(InfoDialog)
        expect(entry.props).toEqual({ data: { title: 'Title', content: 'Content' } })
        entry.resolve(null)
        await expect(pending).resolves.toBeNull()
        expect(queue.queue.value).toHaveLength(0)
    })

    it('info resolves with null when the dialog rejects', async () => {
        const { dialog, queue } = setup()
        const pending = dialog.info('Title', 'Content')
        queue.queue.value[0].reject()
        await expect(pending).resolves.toBeNull()
    })

    it('confirm(title, content, level) queues a ConfirmDialog with the level', async () => {
        const { dialog, queue } = setup()
        const pending = dialog.confirm('Title', 'Content', ConfirmDialogLevel.DANGER)
        const entry = queue.queue.value[0]
        expect(entry.component).toBe(ConfirmDialog)
        expect(entry.props).toEqual({ data: { title: 'Title', content: 'Content', level: ConfirmDialogLevel.DANGER } })
        entry.resolve(true)
        await expect(pending).resolves.toBe(true)
    })

    it('confirm rejects when the dialog rejects', async () => {
        const { dialog, queue } = setup()
        const pending = dialog.confirm({ title: 'Title', content: 'Content', throwOnReject: true })
        queue.queue.value[0].reject('closed')
        await expect(pending).rejects.toBe('closed')
    })
})
```

Run: `npx vitest run lib/composables/dialog`
Expected: FAIL. `isEmptyValue` does not exist; the remaining suites may pass already, which is fine.

- [ ] **Step 2: Create `isEmptyValue.ts`**

`lib/composables/dialog/internal/isEmptyValue.ts`:

```ts
export function isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
        return true
    }
    if (Array.isArray(value)) {
        return value.length === 0
    }
    if (value instanceof Date) {
        return Number.isNaN(value.getTime())
    }
    if (value instanceof Map || value instanceof Set) {
        return value.size === 0
    }
    if (typeof value === 'object') {
        return Object.keys(value).length === 0
    }
    return false
}
```

- [ ] **Step 3: Use `isEmptyValue` in `PromptDialog.vue`**

Import `isEmptyValue` from `@/composables/dialog/internal/isEmptyValue`. Change the save-button state to:

```ts
const isSaveDisabled = computed(() => !!props.data.required && isEmptyValue(resolveValue.value))
```

and the condition in `resolveDialog` to:

```ts
if (props.data.required && isEmptyValue(resolveValue.value)) {
```

Leave the rest of the file untouched.

- [ ] **Step 4: Fix `translateTitle` in the form dialog**

In `lib/composables/dialog/presets/FormDialogProps.ts` change `translateTitle?: string` to `translateTitle?: boolean`. In `FormDialog.vue` change `:translate="!!data.translateTitle"` to `:translate="data.translateTitle"` so an unset value falls back to the component default of `true`, like every other preset.

- [ ] **Step 5: Reuse `useDialogCta` in `ConfirmDialog.vue`**

Replace the `usePluginContext` destructuring, the `DEFAULT_CONFIRM_CTA` / `DEFAULT_REJECT_CTA` constants and the two `computed(... merge(...))` lines with:

```ts
const confirmCta = useDialogCta(props.data.confirmCta, 'yes')
const rejectCta = useDialogCta(props.data.rejectCta, 'no')
```

Add `import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'` and remove the now-unused imports of `merge`, `usePluginContext` and `DialogCta`. Keep `DEFAULT_MAX_WIDTH`.

- [ ] **Step 6: Reuse `useDialogCta` in `InfoDialog.vue` and narrow `defaultCta`**

In `lib/composables/dialog/presets/InfoDialogProps.ts` import `DialogCta` alongside `InteractiveDialogCta` and change the property to `defaultCta?: Partial<DialogCta> | false`.

In `InfoDialog.vue` replace the `usePluginContext` destructuring, `DEFAULT_CTA` and the `defaultCta` computed with:

```ts
const defaultCta = props.data.defaultCta === false ? null : useDialogCta(props.data.defaultCta, 'close')
```

Add the `useDialogCta` import, remove the unused `merge`, `usePluginContext` and `DialogValueCta` imports. Keep `DEFAULT_MAX_WIDTH`, `onCtaClick`, `isActionCta`, `closeDialog` and `resolveDialog` as they are.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run lib/composables/dialog`
Expected: PASS, 24 tests, pristine output.

- [ ] **Step 8: Verify**

Run `npm run lint`, `npm run check`, `npm test`. All pass.

---

### Task 6: Translation lookup, accessibility and the public type surface (Phase 3)

**Files:**
- Create: `lib/composables/internal/useMaybeTranslation.ts`
- Modify: `lib/components/internal/MaybeTranslation.vue`
- Modify: `lib/composables/dialog/components/dialog/presets/ConfirmDialog.vue`
- Modify: `lib/composables/dialog/components/dialog/presets/InfoDialog.vue`
- Modify: `lib/composables/dialog/components/dialog/presets/PromptDialog.vue`
- Modify: `lib/composables/dialog/components/dialog/presets/FormDialog.vue`
- Modify: `lib/main.ts`
- Create: `lib/__tests__/helpers/withSetup.ts`
- Create: `lib/composables/internal/__tests__/useMaybeTranslation.test.ts`
- Create: `lib/components/__tests__/MaybeTranslation.test.ts`

**Interfaces:**
- Consumes: `useDialogCta` (existing), `createTestApp` (Task 2).
- Produces: `useMaybeTranslation(): (content: string, translate?: boolean) => string`; `withSetup(composable, plugins)` test helper; new exports from `lib/main.ts`.

- [ ] **Step 1: Write the failing tests**

`lib/__tests__/helpers/withSetup.ts`:

```ts
import { defineComponent, type Plugin } from 'vue'
import { mount } from '@vue/test-utils'

export function withSetup<T>(composable: () => T, plugins: Plugin[] = []): T {
    let result!: T
    const Host = defineComponent({
        setup() {
            result = composable()
            return () => null
        },
    })
    mount(Host, { global: { plugins } })
    return result
}
```

`lib/composables/internal/__tests__/useMaybeTranslation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'
import { withSetup } from '@/__tests__/helpers/withSetup'

function setup() {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { action: { save: 'Save' } } } })
    return withSetup(() => useMaybeTranslation(), [i18n])
}

describe('useMaybeTranslation', () => {
    it('translates an existing key', () => {
        expect(setup()('action.save')).toBe('Save')
    })

    it('returns the content unchanged when the key does not exist', () => {
        expect(setup()('Plain text')).toBe('Plain text')
    })

    it('returns the content unchanged when translation is disabled', () => {
        expect(setup()('action.save', false)).toBe('action.save')
    })
})
```

`lib/components/__tests__/MaybeTranslation.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'

function mountWith(props: { content: string, translate?: boolean }) {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { common: { yes: 'Yes' } } } })
    return mount(MaybeTranslation, { props, global: { plugins: [i18n] } })
}

describe('MaybeTranslation', () => {
    it('renders the translation for an existing key', () => {
        expect(mountWith({ content: 'common.yes' }).text()).toBe('Yes')
    })

    it('renders unknown keys verbatim without warnings', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        expect(mountWith({ content: 'Hello world' }).text()).toBe('Hello world')
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('renders the content verbatim when translate is false', () => {
        expect(mountWith({ content: 'common.yes', translate: false }).text()).toBe('common.yes')
    })
})
```

Run: `npx vitest run lib/composables/internal lib/components`
Expected: FAIL. `useMaybeTranslation` does not exist and the "without warnings" test fails because the component calls `t()` on a missing key.

- [ ] **Step 2: Create `useMaybeTranslation.ts` and rewrite `MaybeTranslation.vue`**

`lib/composables/internal/useMaybeTranslation.ts`:

```ts
import { useI18n } from 'vue-i18n'

export type MaybeTranslate = (content: string, translate?: boolean) => string

export function useMaybeTranslation(): MaybeTranslate {
    const { t, te } = useI18n({ useScope: 'global' })
    return (content, translate = true) => translate && te(content) ? t(content) : content
}
```

`lib/components/internal/MaybeTranslation.vue`:

```vue
<template>{{ text }}</template>

<script lang="ts" setup>
    import { computed } from 'vue'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'

    const props = withDefaults(defineProps<{
        content: string
        translate?: boolean
    }>(), {
        translate: true,
    })

    const translate = useMaybeTranslation()
    const text = computed(() => translate(props.content, props.translate))
</script>
```

- [ ] **Step 3: Label the close buttons and use icon aliases**

In each of the four preset components add an accessible label to the icon-only close button. In the script section:

```ts
import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'
import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'

const translate = useMaybeTranslation()
const closeCta = useDialogCta(undefined, 'close')
const closeLabel = computed(() => translate(closeCta.text, closeCta.translateText))
```

(Skip imports that the file already has.) In the templates:

- `ConfirmDialog.vue`: `<VBtn v-if="!data.permanent" icon="$close" variant="text" :aria-label="closeLabel" @click="closeDialog" />`
- `InfoDialog.vue`: `<VBtn icon="$close" variant="text" :aria-label="closeLabel" @click="closeDialog(null)" />` (keep the existing `eslint-disable-next-line vue/v-on-handler-style` directive above it).
- `PromptDialog.vue`: `<VBtn icon="$close" :aria-label="closeLabel" @click="closeDialog" />` (was `mdi-close`).
- `FormDialog.vue`: `<VBtn icon="$close" :aria-label="closeLabel" @click="closeDialog" />` (was `mdi-close`).

- [ ] **Step 4: Complete the public exports in `lib/main.ts`**

Replace the file with:

```ts
import UiKitOutlet from '@/components/UiKitOutlet.vue'

export { UiKitOutlet }
export * from '@/composables/dialog/useDialog'
export * from '@/composables/dialog/presets/ConfirmDialogProps'
export * from '@/composables/dialog/presets/InfoDialogProps'
export * from '@/composables/dialog/presets/PromptDialogProps'
export * from '@/composables/dialog/presets/FormDialogProps'
export type { DialogCta, DialogValueCta, DialogActionCta, InteractiveDialogCta } from '@/composables/dialog/types/DialogCta'
export type { DialogComponentEmits } from '@/composables/dialog/types/DialogComponent'
export * from '@/composables/toast/useToast'
export type { ToastOptions } from '@/composables/toast/types/ToastOptions'
export { ToastType } from '@/composables/toast/types/ToastType'
export * from '@/composables/loading/useLoading'
export * from '@/composables/loading-overlay/useLoadingOverlay'
export * from '@/plugin/createUIKit'
export type {
    PluginOptions,
    PluginI18nOptions,
    PluginI18nMessageKey,
    PluginLoadingOptions,
    PluginToastOptions,
} from '@/plugin/types/PluginOptions'
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run lib/composables/internal lib/components lib/composables/toast`
Expected: PASS (the toast suite still passes with the rewritten `MaybeTranslation`).

- [ ] **Step 6: Verify**

Run `npm run lint`, `npm run check`, `npm test`, then `npm run build:lib` and confirm `dist/main.d.ts` contains `ToastType`, `PluginOptions` and `DialogCta`.

---

### Task 7: Vuelidate validators fixes (Phase 1)

**Files:**
- Modify: `lib/composables/vuelidate/validators.ts`
- Create: `lib/composables/vuelidate/__tests__/validators.test.ts`

**Interfaces:**
- Produces: `macAddress` export (a factory taking the separator, like the Vuelidate original); the misspelled `maxAddress` export is removed.

- [ ] **Step 1: Write the failing tests**

`lib/composables/vuelidate/__tests__/validators.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { MessageProps } from '@vuelidate/validators'
import { macAddress, minLength, required, setGlobalValidationSettings } from '@/composables/vuelidate/validators'

function messageProps(validator: string): MessageProps {
    return {
        $invalid: true,
        $model: '',
        $params: {},
        $pending: false,
        $property: 'field',
        $propertyPath: 'field',
        $response: null,
        $validator: validator,
    }
}

function resolveMessage(rule: { $message: unknown }, validator: string): string {
    const message = rule.$message
    return typeof message === 'function' ? String(message(messageProps(validator))) : String(message)
}

describe('validators', () => {
    it('builds the message path with the default prefix and no transform', () => {
        setGlobalValidationSettings({ t: path => `translated:${path}` })
        expect(resolveMessage(minLength(3), 'minLength')).toBe('translated:validation.minLength')
    })

    it.each([
        ['snake_case', 'validation.min_length'],
        ['kebab-case', 'validation.min-length'],
        ['PascalCase', 'validation.MinLength'],
        ['camelCase', 'validation.minLength'],
        ['none', 'validation.minLength'],
    ] as const)('applies the %s transform', (transform, expected) => {
        setGlobalValidationSettings({ t: path => path, message: { prefix: 'validation', transform } })
        expect(resolveMessage(required, 'minLength')).toBe(expected)
    })

    it('uses a custom prefix with the default transform', () => {
        setGlobalValidationSettings({ t: path => path, message: { prefix: 'errors' } })
        expect(resolveMessage(required, 'required')).toBe('errors.required')
    })

    it('supports a custom message path function', () => {
        setGlobalValidationSettings({ t: path => path, message: name => `custom.${name}` })
        expect(resolveMessage(required, 'required')).toBe('custom.required')
    })

    it('exports macAddress as a validator factory', () => {
        const rule = macAddress(':')
        expect(rule.$validator('00:1A:2B:3C:4D:5E', {}, {})).toBe(true)
        expect(rule.$validator('nope', {}, {})).toBe(false)
    })
})
```

Run: `npx vitest run lib/composables/vuelidate`
Expected: FAIL because `macAddress` is not exported.

- [ ] **Step 2: Fix `validators.ts`**

Replace the `messagePath` implementation inside `createI18nMessage` with:

```ts
messagePath(params) {
    if (typeof options === 'function') {
        return options(params.$validator)
    }
    return `${options.prefix}.${transformValidator(params.$validator, options.transform)}`
},
```

Replace `export const maxAddress = withI18nMessage(validators.macAddress)` with:

```ts
export const macAddress = withI18nMessage(validators.macAddress, { withArguments: true })
```

Replace `let options: ValidationMessageOptions = clone(DEFAULT_OPTIONS)` with `let options: ValidationMessageOptions = { ...DEFAULT_OPTIONS }`, and in `setGlobalValidationSettings` replace `assign({}, DEFAULT_OPTIONS, opt.message)` with `{ ...DEFAULT_OPTIONS, ...opt.message }`. Reduce the lodash-es import to `camelCase, kebabCase, snakeCase, upperFirst`.

- [ ] **Step 3: Run the tests**

Run: `npx vitest run lib/composables/vuelidate`
Expected: PASS, 9 tests.

- [ ] **Step 4: Verify**

Run `npm run lint`, `npm run check`, `npm test`. All pass. Confirm with `grep -rn "yolo\|maxAddress\|console.log" lib/composables/vuelidate/validators.ts` that none remain.

---

### Task 8: Mechanical hygiene batch (Phase 3 and Phase 2)

**Files:**
- Modify: `lib/composables/dialog/components/dialog/presets/ConfirmDialog.vue`
- Modify: `lib/composables/dialog/components/dialog/presets/InfoDialog.vue`
- Modify: `lib/composables/dialog/components/dialog/presets/PromptDialog.vue`
- Modify: `lib/composables/dialog/components/dialog/DialogOutlet.vue`
- Modify: `lib/composables/dialog/useDialog.ts`
- Modify: `lib/composables/dialog/docs/examples/ConfirmDialogExample.vue`
- Modify: `lib/composables/dialog/docs/examples/InfoDialogExample.vue`
- Modify: `lib/composables/dialog/docs/examples/PromptDialogExample.vue`
- Modify: `lib/composables/loading/docs/stories/Loading.stories.ts`
- Modify: `lib/composables/dialog/docs/stories/ConfirmDialog.stories.ts`, `FormDialog.stories.ts`, `InfoDialog.stories.ts`, `PromptDialog.stories.ts`
- Modify: `.storybook/preview.ts`
- Modify: `.storybook/main.ts`
- Modify: `.gitignore`
- Create: `.gitattributes`
- Create: `.editorconfig`

This is a batch of small, same-shape edits. Every listed file must change exactly as described.

- [ ] **Step 1: Normalise imports to the `@` alias and drop `.ts` extensions**

- `ConfirmDialog.vue`: `'../../../../../components/internal/MaybeTranslation.vue'` → `'@/components/internal/MaybeTranslation.vue'`; `'../../../types/DialogComponent.ts'` → `'@/composables/dialog/types/DialogComponent'`; `'../../../presets/ConfirmDialogProps'` → `'@/composables/dialog/presets/ConfirmDialogProps'`.
- `InfoDialog.vue`: `'../../../../../components/internal/MaybeTranslation.vue'` → `'@/components/internal/MaybeTranslation.vue'`; `'../../../presets/InfoDialogProps'` → `'@/composables/dialog/presets/InfoDialogProps'`; `'../../../types/DialogComponent'` → `'@/composables/dialog/types/DialogComponent'`.
- `PromptDialog.vue`: `'../../../presets/PromptDialogProps'` (both the type import and the value import) → `'@/composables/dialog/presets/PromptDialogProps'`; `'../../../../../components/internal/MaybeTranslation.vue'` → `'@/components/internal/MaybeTranslation.vue'`; `'../../../types/DialogComponent'` → `'@/composables/dialog/types/DialogComponent'`.
- `DialogOutlet.vue`: `'../../internal/useDialogQueue'` → `'@/composables/dialog/internal/useDialogQueue'`.
- `useDialog.ts`: every `'./components/dialog/presets/X.vue'` → `'@/composables/dialog/components/dialog/presets/X.vue'`; `'./internal/useDialogQueue'` → `'@/composables/dialog/internal/useDialogQueue'`; every `'./presets/XProps'` → `'@/composables/dialog/presets/XProps'`; `'./types/DialogQueueEntry'` → `'@/composables/dialog/types/DialogQueueEntry'`.
- `ConfirmDialogExample.vue`: `'../../useDialog'` → `'@/composables/dialog/useDialog'`; `'../../presets/ConfirmDialogProps'` → `'@/composables/dialog/presets/ConfirmDialogProps'`; `'./ConfirmDialogContent.vue'` → `'@/composables/dialog/docs/examples/ConfirmDialogContent.vue'`.
- `InfoDialogExample.vue`: `'../../useDialog'` → `'@/composables/dialog/useDialog'`; `'./InfoDialogContent.vue'` → `'@/composables/dialog/docs/examples/InfoDialogContent.vue'`.
- `PromptDialogExample.vue`: `'../../useDialog'` → `'@/composables/dialog/useDialog'`; `'../../presets/PromptDialogProps'` → `'@/composables/dialog/presets/PromptDialogProps'`; `'./PromptDialogContent.vue'` and `'./PromptDialogLargeContent.vue'` → `'@/composables/dialog/docs/examples/PromptDialogContent.vue'` and `'@/composables/dialog/docs/examples/PromptDialogLargeContent.vue'`.
- `Loading.stories.ts`: `'../examples/LoadingExample.vue'` → `'@/composables/loading/docs/examples/LoadingExample.vue'`.
- The four dialog stories: `'../examples/XExample.vue'` → `'@/composables/dialog/docs/examples/XExample.vue'`.

- [ ] **Step 2: Fix the SCSS settings import**

In `ConfirmDialog.vue` and `InfoDialog.vue` change `@use "../../../../../../node_modules/vuetify/settings";` to `@use "vuetify/settings";`.

- [ ] **Step 3: Fix the Storybook configuration**

In `.storybook/preview.ts` swap the two background names so the entry whose `value` is `'#121212'` is named `'Dark'` and the entry whose `value` is `'#ffffff'` is named `'Light'`, and change the `storySort.order` array to `['Installation', 'Configuration', 'composables', 'validators', 'components']`. In `.storybook/main.ts` delete the line `disableWhatsNewNotifications: false,`.

- [ ] **Step 4: Line-ending and editor configuration**

Create `.gitattributes`:

```
* text=auto eol=lf
*.ico binary
*.png binary
*.jpg binary
*.woff binary
*.woff2 binary
```

Create `.editorconfig`:

```
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.{json,yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

In `.gitignore` delete the two lines `/cypress/videos/` and `/cypress/screenshots/` and add a line `storybook-static` after `dist-ssr`.

- [ ] **Step 5: Verify**

Run `npm run lint`, `npm run check`, `npm test`. All pass. Run `grep -rn "\.\./\.\./\|from '\./" lib --include=*.ts --include=*.vue` and confirm the only remaining relative imports are none (every cross-file import now uses `@/`).

---

### Task 9: ESLint preset upgrade (Phase 3)

**Files:**
- Modify: `eslint.config.js`
- Modify: any `.vue` or `.ts` file that the stricter rules flag (expected: `FormDialog.vue`, `ToastEntry.vue`, `LoadingExample.vue`, `FormDialogContent.vue`, `PromptDialogContent.vue`, `UiKitOutlet.vue`, `StoryWrapper.vue`, `LoadingOverlay.vue`, and possibly others)

**Interfaces:**
- Produces: a lint configuration with `eslint:recommended`, `vue/flat/recommended` and the project's 4-space template style.

- [ ] **Step 1: Rewrite `eslint.config.js`**

```js
import js from '@eslint/js'
import storybook from 'eslint-plugin-storybook'
import vue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'
import ts from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'
import vueParser from 'vue-eslint-parser'

export default [
    {
        files: ['**/*.{ts,tsx,vue}'],
    },
    {
        ignores: ['dist/**', 'dist-ssr/**', 'coverage/**', 'storybook-static/**'],
    },
    js.configs.recommended,
    {
        ...ts.configs.eslintRecommended,
        files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    },
    ...vue.configs['flat/recommended'],
    ...ts.configs.strictTypeChecked,
    ...ts.configs.stylisticTypeChecked,
    stylistic.configs.customize({
        indent: 4,
        quotes: 'single',
        braceStyle: '1tbs',
    }),
    {
        ...vitest.configs.recommended,
        files: ['lib/**/__tests__/**/*.test.ts'],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: ['.vue'],
            },
        },
    },
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: ts.parser,
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            'vue/script-indent': ['error', 4, {
                baseIndent: 1,
            }],
            'vue/html-indent': ['error', 4],
            'vue/max-attributes-per-line': ['error', {
                singleline: 5,
                multiline: 1,
            }],
            'vue/html-closing-bracket-newline': ['error', {
                singleline: 'never',
                multiline: 'never',
            }],
            'vue/singleline-html-element-content-newline': 'off',
            '@stylistic/indent': 'off',
        },
    },
    {
        files: ['**/*.js'],
        ...ts.configs.disableTypeChecked,
    },
    {
        files: ['**/*.{ts,tsx,vue}'],
        rules: {
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-unnecessary-condition': ['error', {
                allowConstantLoopConditions: true,
                checkTypePredicates: true,
            }],
        },
    },
    ...storybook.configs['flat/recommended'],
]
```

- [ ] **Step 2: Auto-fix, then fix the rest by hand**

Run: `npm run lint:fix`
Then: `npm run lint`
Fix every remaining report by editing the flagged code so it satisfies the rule. Do not add rule overrides to the config beyond those listed above and do not add `eslint-disable` directives. Typical fixes: reorder attributes (`vue/attributes-order`), self-close empty components (`vue/html-self-closing`), one attribute per line when an element spans several lines, collapse double spaces, fix template indentation.

- [ ] **Step 3: Verify**

Run `npm run lint`, `npm run check`, `npm test`. All pass. Run `npm run build:lib` once to confirm the template edits still compile.

---

### Task 10: CI and publish workflows (Phase 2)

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `.github/workflows/publish.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
    branches:
      - master
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v5
      - name: Install NodeJS
        uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - name: Install Dependencies
        run: npm ci --ignore-scripts
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run check
      - name: Test
        run: npm test
      - name: Build library
        run: npm run build:lib
      - name: Build docs
        run: npm run build:docs
```

- [ ] **Step 2: Rewrite `.github/workflows/publish.yml`**

```yaml
name: Publish Package
on:
  release:
    types:
      - published
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v5
      - name: Install NodeJS
        uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
          registry-url: https://registry.npmjs.org
      - name: Install Dependencies
        run: npm ci --ignore-scripts
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run check
      - name: Test
        run: npm test
      - name: Publish Package
        run: npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_PUBLISH_TOKEN }}
```

- [ ] **Step 3: Verify**

Both files must be valid YAML: run `node -e "const fs=require('fs');for (const f of ['.github/workflows/ci.yml','.github/workflows/publish.yml']) { const t=fs.readFileSync(f,'utf8'); if (!/^name: /m.test(t) || !/^jobs:/m.test(t)) throw new Error(f) }"` and `npx --yes yaml-lint .github/workflows/ci.yml .github/workflows/publish.yml` if available; if `yaml-lint` cannot be installed, confirm the indentation by eye and note it in the report. Run `npm run lint` to confirm nothing else changed.

---

### Task 11: Documentation and example cleanup (Phase 4)

**Files:**
- Modify: `README.md`
- Create: `lib/docs/Installation.mdx`
- Create: `lib/docs/Configuration.mdx`
- Modify: `lib/composables/dialog/useDialog.mdx`
- Modify: `lib/composables/toast/useToast.mdx`
- Modify: `lib/composables/loading/useLoading.mdx`
- Create: `lib/composables/vuelidate/validators.mdx`
- Modify: `lib/composables/dialog/docs/examples/ConfirmDialogExample.vue`
- Modify: `lib/composables/dialog/docs/examples/InfoDialogContent.vue`
- Modify: `lib/composables/dialog/docs/examples/InfoDialogExample.vue`
- Modify: `lib/composables/dialog/docs/examples/FormDialogContent.vue`
- Modify: `lib/composables/dialog/docs/examples/FormDialogExample.vue`
- Modify: `lib/composables/dialog/docs/examples/PromptDialogContent.vue`
- Modify: `lib/composables/dialog/docs/examples/PromptDialogLargeContent.vue`
- Modify: `lib/composables/loading/docs/examples/LoadingExample.vue`

**Interfaces:**
- Consumes: every public API as it exists after Tasks 1 to 10 (read the source under `lib/` to confirm names and defaults; never document from memory).

Facts the docs must state correctly (verify each against the source before writing):

- Peer dependencies: `vue ^3.5`, `vuetify ^3 || ^4`, `vue-i18n ^9 || ^10 || ^11`, `@vuelidate/core ^2`. Entry points: `@schwarzdavid/ui-kit`, `@schwarzdavid/ui-kit/validators`, `@schwarzdavid/ui-kit/styles`. The library is ESM only.
- Setup: `app.use(createUIKit(options))`, mount `<UiKitOutlet />` once inside `<VApp>`, import the styles entry once. Composables work inside `setup()` and inside `app.runWithContext()`; they throw the `Errors.NOT_INSTALLED` message otherwise.
- `createUIKit` options and defaults: `loading.delay` `2000` (minimum spinner duration in ms, `false` disables), `loading.overlay` `false`, `toast.timeout` `4000`, `i18n.messages` `{ yes: 'common.yes', no: 'common.no', cancel: 'action.cancel', close: 'action.close', save: 'action.save' }`. These keys are looked up in the global vue-i18n instance; a key that does not exist is rendered verbatim.
- `useDialog`: `info`, `confirm`, `prompt`, `form`. The `info` default CTA is `{ text: 'action.close', translateText: true }` and `defaultCta` accepts `Partial<DialogCta> | false`. The `confirm` CTAs default to `{ text: 'common.yes', translateText: true }` and `{ text: 'common.no', translateText: true }`. `form()` takes `FormDialogProps<R, T, RejectOnEmpty>`: `title`, `translateTitle` (boolean, default `true`), `saveCta`, `abortCta`, `component` (must expose `finish(): Promisable<T>` and may emit `save`), `action?: (value: T) => Promise<R>`, `rejectOnEmpty`, and `props` when the component declares props. The form dialog runs `useVuelidate().$validate()` before calling `finish()`, disables all Vuetify inputs while the action runs, and resolves with the action result or `null` when closed.
- `useToast`: `info`, `warn`, `error`, `success`, each `(message, options?) => Promise<void>` where options are `timeout` and `translateMessage` (default `true`). The promise resolves when the toast disappears, whether by timeout or by the user closing it.
- `useLoading(callback, options?)`: returns `{ loading, action }`; `action` forwards arguments and the return value, keeps `loading` true for at least `delay` ms, and shows the global overlay when `overlay` is true. Per-call options override the plugin options.
- Validators entry: `setGlobalValidationSettings({ t, message })` must be called once with the app's `t` function; `message` is either a function `(validatorName) => path` or `{ prefix, transform }` with `transform` one of `'none' | 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case'` (default prefix `validation`, default transform `none`). List the exported validators including `macAddress(separator)` and `oneOf(values)`. Document `useVuelidateErrors(validation)` and its known limitation with `$each` validators.

- [ ] **Step 1: Write `README.md`**

Sections, in order: title and one-paragraph description; Installation (npm install command, peer dependency list, ESM-only note); Setup (plugin, outlet, styles, i18n keys, a complete `main.ts` example); Usage overview with one short snippet each for `useDialog`, `useToast`, `useLoading` and the validators entry; Documentation (how to run Storybook with `npm run docs`); Development (scripts `lint`, `check`, `test`, `build:lib`, `build:docs`); Known limitations (the `useVuelidateErrors` `$each` note); License (Apache-2.0).

- [ ] **Step 2: Write `lib/docs/Installation.mdx` and `lib/docs/Configuration.mdx`**

Each starts with `import { Meta } from '@storybook/addon-docs/blocks'` and `<Meta title="Installation" />` or `<Meta title="Configuration" />`. Installation covers the npm install, peers, plugin registration, outlet placement and the styles import. Configuration documents every `createUIKit` option in a table with Property, Type, Description, Default, followed by the i18n message keys and the validators entry's `setGlobalValidationSettings`.

- [ ] **Step 3: Update the composable docs**

In `useDialog.mdx`: replace the `form()` section's `TODO` with a Usage section, a props table for `FormDialogProps` and an example based on `FormDialogExample.vue` and `FormDialogContent.vue`; correct the `info` default CTA (`action.close`, `translateText`) and its type (`Partial<DialogCta> | false`); correct the `confirm` CTA defaults (`translateText`, not `translateTitle`); replace the two `## General Usage` paragraphs with a one-line pointer to the Installation page.

In `useToast.mdx`: add a Usage section with the signature, an options table (`timeout`, `translateMessage`), the promise semantics and a short example; replace the general-usage paragraphs with a pointer to Installation.

In `useLoading.mdx`: add a description, the signature, an options table (`delay`, `overlay`) and an example mirroring `LoadingExample.vue`.

Create `lib/composables/vuelidate/validators.mdx` with `<Meta title="validators" />`: setup via `setGlobalValidationSettings`, the message path rules with a table of the five transforms and the resulting key for `minLength`, the list of exported validators, and `useVuelidateErrors`.

- [ ] **Step 4: Clean up the example components**

- `ConfirmDialogExample.vue`: change both `'Drück mich'` texts to `'Confirm'` and `'Abort'`.
- `InfoDialogContent.vue`: table headers `Column 1`, `Column 2`; cells `Value 1.1`, `Value 1.2`, `Value 2.1`, `Value 2.2`.
- `InfoDialogExample.vue`: replace `alert('Test')` with incrementing a `const actionCount = ref(0)` and render `<p v-if="actionCount" class="mt-4">Action triggered {{ actionCount }} times</p>` below the buttons.
- `FormDialogContent.vue`: label the second field `Age`; `finish()` returns `Promise.resolve(state.value.name)` and has no `console.log`; remove the duplicate `VDateInput` import line by merging it into the single `vuetify/components` import.
- `FormDialogExample.vue`: button text `Open form dialog`, dialog title `Create profile`, store the resolved value in `const result = ref<string | null>(null)` and render `<p v-if="result !== null" class="mt-4">Saved name: {{ result }}</p>`.
- `PromptDialogContent.vue`: template becomes `<VCardItem><VTextField v-model="model" :label="label" /></VCardItem>` (import `VTextField` with `VCardItem`), model type `defineModel<string | null>({ required: true })`; in `PromptDialogExample.vue` change `initialValue: {}` to `initialValue: ''` and keep everything else.
- `PromptDialogLargeContent.vue`: translate the two German paragraphs to English (`This could be a sidebar holding filters and other settings.` and `Elements can also be placed directly in the toolbar through the <teleport> component, for example to show a sidebar on small screens. Shrink the window to see it.`).
- `LoadingExample.vue`: replace both `console.log(result)` with assignment to `const lastResult = ref<string | null>(null)` and render `<p v-if="lastResult !== null" class="mt-4">Last result: {{ lastResult }}</p>`.

- [ ] **Step 5: Verify**

Run `npm run lint`, `npm run check`, `npm test`, then `npm run build:docs` and confirm it exits 0 and `storybook-static/index.html` exists. Delete `storybook-static` afterwards. Open each MDX file and confirm every default value in a table matches `createDefaultPluginOptions.ts` and the preset props files.

---

## Out of scope (recorded for the final report)

- `DialogComponent<T>` in `lib/composables/dialog/types/DialogComponent.ts` intersects with `any` and therefore accepts any component; tightening it is an API design change deferred to a separate plan.
- `useVuelidateErrors` support for `$each` validators (README TODO) stays open.
- The `PromptDialog` rejects with `undefined` when a required value is missing; passing an `Error` requires widening the queue's `reject` signature and is deferred.
