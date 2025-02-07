export type PluginI18nMessageKey = 'save' | 'cancel' | 'close' | 'yes' | 'no'

export type PluginI18nValidationFn = (validatorName: string) => string

export type PluginI18nValidationTransform = 'snake_case' | 'camelCase' | 'PascalCase' | 'kebab-case' | 'none'

export interface PluginI18nValidationOptions {
    prefix: string
    transform: PluginI18nValidationTransform
}

export interface PluginI18nOptions {
    messages: Record<PluginI18nMessageKey, string>
    validation: PluginI18nValidationFn | PluginI18nValidationOptions
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
