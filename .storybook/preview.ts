import { type Decorator, type Preview, setup } from '@storybook/vue3'
import { withVuetify } from './vuetify/withVuetify.decorator'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { createI18n } from 'vue-i18n'
import '@mdi/font/css/materialdesignicons.css'
import enMessages from './i18n/en.json'
import { createPinia } from 'pinia'
import { createUIKit } from '@/plugin/createUIKit'

setup((app) => {
    app.use(createVuetify({
        theme: {
            themes: {
                light: {
                    colors: {
                        primary: '#FF9200',
                        secondary: '#FF004E',
                    },
                },
            },
        },
        display: {
            mobileBreakpoint: 'md',
        },
    }))
    app.use(createPinia())
    app.use(createUIKit())
    app.use(createI18n({ locale: 'en', messages: { en: enMessages } }))
})

const decorators: Decorator[] = [withVuetify]

const preview: Preview = {
    decorators,

    parameters: {
        backgrounds: {
            values: [
                {
                    name: 'Light',
                    value: '#121212',
                },
                {
                    name: 'Dark',
                    value: '#ffffff',
                },
            ],
        },
        options: {
            storySort: {
                order: ['Installation', 'Configuration', 'stores', 'composables', 'components'],
            },
        },
    },

    tags: [],
}

export default preview
