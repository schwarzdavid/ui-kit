export interface PluginI18nOptions {
    messages: {
        save: string
        cancel: string
        close: string
        yes: string
        no: string
    }
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
