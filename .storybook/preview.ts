import { type Decorator, type Preview, setup } from '@storybook/vue3-vite'
import { withVuetify } from './vuetify/withVuetify.decorator'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { createI18n } from 'vue-i18n'
import '@mdi/font/css/materialdesignicons.css'
import enMessages from './i18n/en.json'
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
                    name: 'Dark',
                    value: '#121212',
                },
                dark: {
                    name: 'Light',
                    value: '#ffffff',
                },
            },
        },
        options: {
            storySort: {
                order: ['Installation', 'Configuration', 'composables', 'validators', 'components'],
            },
        },
    },

    tags: [],
}

export default preview
