import type { StorybookConfig } from '@storybook/vue3-vite'
import { withoutVitePlugins } from '@storybook/builder-vite'
import vuetify from 'vite-plugin-vuetify'

const config: StorybookConfig = {
    stories: ['../lib/**/*.stories.@(ts|tsx)', '../lib/**/*.@(md|mdx)'],
    addons: ['@storybook/addon-docs'],
    framework: {
        name: '@storybook/vue3-vite',
        options: {
            docgen: 'vue-component-meta',
        },
    },
    core: {
        disableTelemetry: true,
    },
    viteFinal: async (config) => {
        return {
            ...config,
            plugins: [
                ...await withoutVitePlugins(config.plugins, ['unplugin-dts']),
                vuetify({ autoImport: false, styles: { configFile: '.storybook/vuetify/settings.scss' } }),
            ],
        }
    },
}

export default config
