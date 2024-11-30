import type { ConfirmDialogCta } from '@/composables/dialog/presets/ConfirmDialogProps'
import type { InfoDialogCta } from '@/composables/dialog/presets/InfoDialogProps'
import type { PromptDialogCta } from '@/composables/dialog/presets/PromptDialogProps'

export interface PluginLoadingOptions {
    delay: number | false
    overlay: boolean
}

export interface PluginDialogOptions {
    confirm: {
        confirmCta: ConfirmDialogCta
        rejectCta: ConfirmDialogCta
    }
    info: {
        defaultCta: InfoDialogCta<null>
    }
    prompt: {
        abortCta: PromptDialogCta
        saveCta: PromptDialogCta
    }
}

export interface PluginOptions {
    loading: PluginLoadingOptions
}
