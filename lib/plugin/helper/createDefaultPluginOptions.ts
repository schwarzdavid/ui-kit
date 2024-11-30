import type { PluginOptions } from '@/plugin/types/PluginOptions'

export const createDefaultPluginOptions = (): PluginOptions => ({
    loading: {
        delay: 2000,
        overlay: false,
    },
})
