# @schwarzdavid/ui-kit

Vue 3 + Vuetify composables and components for promise-based dialogs, toasts, loading states and translated Vuelidate validators. Dialogs and toasts are created from code with `useDialog()` and `useToast()`, rendered by a single `<UiKitOutlet />`, and settle a Promise when the user closes them.

## Installation

```sh
npm install @schwarzdavid/ui-kit
```

The following peer dependencies must be installed in your application:

| Package           | Version                         |
|-------------------|---------------------------------|
| `vue`             | `^3.5.0`                        |
| `vuetify`         | `^3.0.0 \|\| ^4.0.0`            |
| `vue-i18n`        | `^9.0.0 \|\| ^10.0.0 \|\| ^11.0.0` |
| `@vuelidate/core` | `^2.0.0`                        |

The package is published as ESM only and has three entry points:

- `@schwarzdavid/ui-kit` for the plugin, the outlet component and the composables
- `@schwarzdavid/ui-kit/validators` for the translated Vuelidate validators
- `@schwarzdavid/ui-kit/styles` for the stylesheet

## Setup

1. Register Vuetify, vue-i18n and the ui-kit plugin with `app.use(createUIKit(options))`. All options are optional; see the Configuration page in the docs for the full list and defaults.
2. Import `@schwarzdavid/ui-kit/styles` once.
3. Mount `<UiKitOutlet />` once inside `<VApp>`, usually in `App.vue`. It renders every dialog, toast and the loading overlay.
4. Provide translations for the button labels. By default the dialogs look up `common.yes`, `common.no`, `action.cancel`, `action.close` and `action.save` in the global vue-i18n instance. A key that does not exist is rendered verbatim, so the dialogs still work without translations.

```ts
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createI18n } from 'vue-i18n'
import { createUIKit } from '@schwarzdavid/ui-kit'
import { setGlobalValidationSettings } from '@schwarzdavid/ui-kit/validators'
import 'vuetify/styles'
import '@schwarzdavid/ui-kit/styles'
import App from './App.vue'

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
        en: {
            common: { yes: 'Yes', no: 'No' },
            action: { cancel: 'Cancel', close: 'Close', save: 'Save' },
            validation: { required: 'This field is required' },
        },
    },
})

setGlobalValidationSettings({
    t: (path, params) => i18n.global.t(path, params),
})

createApp(App)
    .use(createVuetify())
    .use(i18n)
    .use(createUIKit({
        toast: { timeout: 6000 },
    }))
    .mount('#app')
```

```vue
<template>
    <VApp>
        <VMain>
            <RouterView />
        </VMain>
        <UiKitOutlet />
    </VApp>
</template>

<script lang="ts" setup>
    import { UiKitOutlet } from '@schwarzdavid/ui-kit'
</script>
```

The composables must be called inside `setup()` or inside `app.runWithContext()`. Anywhere else they throw `@schwarzdavid/ui-kit is not available in this context. Install it with app.use(createUIKit()) and call its composables inside setup() or app.runWithContext().`

## Usage

### useDialog

```ts
import { useDialog } from '@schwarzdavid/ui-kit'

const dialog = useDialog()

const confirmed = await dialog.confirm('items.delete.title', 'items.delete.content')
await dialog.info('about.title', 'about.content')
```

`useDialog()` also provides `prompt()` for custom input components and `form()` for validated forms.

### useToast

```ts
import { useToast } from '@schwarzdavid/ui-kit'

const toast = useToast()

await toast.success('items.saved')
toast.error('Upload failed', { translateMessage: false, timeout: 8000 })
```

Each toast function returns a Promise that resolves when the toast disappears.

### useLoading

```ts
import { useLoading } from '@schwarzdavid/ui-kit'

const { loading, action: save } = useLoading(async (id: number) => api.save(id), { overlay: true })

const result = await save(42)
```

### Validators

The validators entry wraps the `@vuelidate/validators` rules so that their messages are translated. Call `setGlobalValidationSettings` once with your translation function (see Setup), then use the rules with `useVuelidate`. `useVuelidateErrors` turns a validation object into a nested object of translated error messages.

```ts
import useVuelidate from '@vuelidate/core'
import { email, minLength, required, useVuelidateErrors } from '@schwarzdavid/ui-kit/validators'

const v = useVuelidate({
    name: { required, minLength: minLength(3) },
    email: { required, email },
}, state)

const errors = useVuelidateErrors(v)
```

## Documentation

The full documentation, including live demos of every composable, is a Storybook. Run it locally with:

```sh
npm run docs
```

and open http://localhost:6006.

## Development

| Script               | Description                                                    |
|----------------------|----------------------------------------------------------------|
| `npm run lint`       | Run ESLint                                                     |
| `npm run check`      | Type-check the project with `vue-tsc`                          |
| `npm test`           | Run the Vitest test suite                                      |
| `npm run build:lib`  | Type-check and build the library into `dist/`                  |
| `npm run build:docs` | Build the static Storybook into `storybook-static/`            |

## Known limitations

- `useVuelidateErrors` has not been made to work with `$each` collection validators (rules built with Vuelidate's `helpers.forEach`). Errors of the individual collection items are not mapped into the result; read them from the validation object directly.

## License

Apache-2.0
