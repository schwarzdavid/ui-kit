import { useI18n } from 'vue-i18n'

export type MaybeTranslate = (content: string, translate?: boolean) => string

export function useMaybeTranslation(): MaybeTranslate {
    const i18n = useI18n({ useScope: 'global' })
    const isKnownKey = (key: string): boolean => i18n.availableLocales.some(locale => i18n.te(key, locale))
    return (content, translate = true) => translate && isKnownKey(content) ? i18n.t(content) : content
}
