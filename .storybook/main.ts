import type { StorybookConfig } from '@storybook/vue3-vite'
import { withoutVitePlugins } from '@storybook/builder-vite'

const config: StorybookConfig = {
    stories: ['../lib/**/*.stories.@(ts|tsx)', '../lib/**/*.@(md|mdx)'],
    addons: ['@storybook/addon-essentials'],
    framework: {
        name: '@storybook/vue3-vite',
        options: {},
    },
    core: {
        disableTelemetry: true,
        disableWhatsNewNotifications: false,
    },
    viteFinal: async (config) => {
        return {
            ...config,
            plugins: await withoutVitePlugins(config.plugins, ['vite:dts']),
        }
    },
}

export default config
