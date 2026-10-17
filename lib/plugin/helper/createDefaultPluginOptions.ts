import { markRaw } from 'vue'
import type { PluginOptions } from '@/plugin/types/PluginOptions'
import InfoDialog from '@/composables/dialog/components/dialog/presets/InfoDialog.vue'
import ConfirmDialog from '@/composables/dialog/components/dialog/presets/ConfirmDialog.vue'
import PromptDialog from '@/composables/dialog/components/dialog/presets/PromptDialog.vue'
import FormDialog from '@/composables/dialog/components/dialog/presets/FormDialog.vue'
import ToastEntry from '@/composables/toast/components/ToastEntry.vue'

export const createDefaultPluginOptions = (): PluginOptions => ({
    loading: {
        delay: 2000,
        overlay: false,
    },
    toast: {
        timeout: 4000,
        errorTimeout: false,
    },
    i18n: {
        messages: {
            yes: 'common.yes',
            no: 'common.no',
            cancel: 'action.cancel',
            close: 'action.close',
            save: 'action.save',
            saveFailed: 'dialog.saveFailed',
            unknownError: 'error.unknown',
        },
    },
    components: {
        dialog: {
            info: markRaw(InfoDialog),
            confirm: markRaw(ConfirmDialog),
            prompt: markRaw(PromptDialog),
            form: markRaw(FormDialog),
        },
        toast: markRaw(ToastEntry),
    },
})
