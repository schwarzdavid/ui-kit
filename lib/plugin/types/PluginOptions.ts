import type { Component } from 'vue'
import type { PartialDeep } from 'type-fest'

export type PluginI18nMessageKey = 'save' | 'cancel' | 'close' | 'yes' | 'no' | 'saveFailed' | 'unknownError'

export interface PluginI18nOptions {
    messages: Record<PluginI18nMessageKey, string>
}

export interface PluginLoadingOptions {
    delay: number | false
    overlay: boolean
}

export interface PluginToastOptions {
    timeout: number
    errorTimeout: number | false
}

export interface PluginDialogComponentOptions {
    info: Component
    confirm: Component
    prompt: Component
    form: Component
}

export interface PluginComponentOptions {
    dialog: PluginDialogComponentOptions
    toast: Component
}

export interface PluginOptions {
    loading: PluginLoadingOptions
    toast: PluginToastOptions
    i18n: PluginI18nOptions
    components: PluginComponentOptions
}

export type CreateUIKitOptions = PartialDeep<Omit<PluginOptions, 'components'>> & {
    components?: {
        dialog?: Partial<PluginDialogComponentOptions>
        toast?: Component
    }
}
