import type { PluginOptions } from '@/plugin/types/PluginOptions'

export const createDefaultPluginOptions = (): PluginOptions => ({
    loading: {
        delay: 2000,
        overlay: false,
    },
    toast: {
        timeout: 4000,
    },
    i18n: {
        messages: {
            yes: 'common.yes',
            no: 'common.no',
            cancel: 'action.cancel',
            close: 'action.close',
            save: 'action.save',
        },
    },
})
