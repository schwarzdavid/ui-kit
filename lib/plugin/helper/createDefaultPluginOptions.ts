import type { PluginOptions } from '@/plugin/types/PluginOptions'

export const createDefaultPluginOptions = (): PluginOptions => ({
    loading: {
        delay: 2000,
        overlay: false,
    },
    dialog: {
        info: {
            defaultCta: {
                text: '',
            },
        },
        confirm: {
            confirmCta: {
                text: '',
            },
            rejectCta: {
                text: '',
            },
        },
        prompt: {
            abortCta: {
                text: '',
            },
            saveCta: {
                text: '',
            },
        },
    },
    toast: {
        timeout: 4000,
    },
})
