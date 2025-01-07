import type { ConfirmDialogCta } from '@/composables/dialog/presets/ConfirmDialogProps'
import type { InfoDialogBaseCta } from '@/composables/dialog/presets/InfoDialogProps'
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
        defaultCta: InfoDialogBaseCta
    }
    prompt: {
        abortCta: PromptDialogCta
        saveCta: PromptDialogCta
    }
}

export interface PluginToastOptions {
    timeout: number
}

export interface PluginOptions {
    loading: PluginLoadingOptions
    dialog: PluginDialogOptions
    toast: PluginToastOptions
}
