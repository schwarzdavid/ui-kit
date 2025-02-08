export type PluginI18nMessageKey = 'save' | 'cancel' | 'close' | 'yes' | 'no'

export interface PluginI18nOptions {
    messages: Record<PluginI18nMessageKey, string>
}

export interface PluginLoadingOptions {
    delay: number | false
    overlay: boolean
}

export interface PluginToastOptions {
    timeout: number
}

export interface PluginOptions {
    loading: PluginLoadingOptions
    toast: PluginToastOptions
    i18n: PluginI18nOptions
}
