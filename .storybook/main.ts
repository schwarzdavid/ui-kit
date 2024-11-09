import type { StorybookConfig } from '@storybook/vue3-vite'
import { withoutVitePlugins } from '@storybook/builder-vite'

const config: StorybookConfig = {
    stories: ['../lib/**/*.stories.@(ts|tsx)', '../lib/**/*.@(md|mdx)'],
    addons: ['@storybook/addon-essentials', '@storybook/addon-mdx-gfm'],
    framework: {
        name: '@storybook/vue3-vite',
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
    viteFinal: async (config) => {
        return {
            ...config,
            plugins: await withoutVitePlugins(config.plugins, ['vite:dts']),
        }
    },
}

export default config
