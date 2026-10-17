import { type Decorator, type Preview, setup } from '@storybook/vue3-vite'
import { withVuetify } from './vuetify/withVuetify.decorator'
import { createVuetify } from 'vuetify'
import { createI18n } from 'vue-i18n'
import 'vuetify/styles'
import '@fontsource/noto-sans/400.css'
import '@fontsource/noto-sans/500.css'
import '@fontsource/noto-sans/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import enMessages from './i18n/en.json'
import { createUIKit } from '@/plugin/createUIKit'
import { createVuetifyOptions } from '@/vuetify'

setup((app) => {
    app.use(createVuetify(createVuetifyOptions()))
    app.use(createUIKit())
    app.use(createI18n({ locale: 'en', messages: { en: enMessages } }))
})

const decorators: Decorator[] = [withVuetify]

const preview: Preview = {
    decorators,

    parameters: {
        backgrounds: {
            options: {
                light: {
                    name: 'Light',
                    value: '#f6f5f1',
                },
                dark: {
                    name: 'Dark',
                    value: '#121110',
                },
            },
        },
        options: {
            storySort: {
                order: ['Installation', 'Configuration', 'Vuetify theme', 'Custom presets', 'composables', 'validators', 'components'],
            },
        },
    },

    tags: [],
}

export default preview
