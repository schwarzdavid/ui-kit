import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'
import { withSetup } from '@/__tests__/helpers/withSetup'

function setup() {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { action: { save: 'Save' } } } })
    return withSetup(() => useMaybeTranslation(), [i18n])
}

describe('useMaybeTranslation', () => {
    it('translates an existing key', () => {
        expect(setup()('action.save')).toBe('Save')
    })

    it('returns the content unchanged when the key does not exist', () => {
        expect(setup()('Plain text')).toBe('Plain text')
    })

    it('returns the content unchanged when translation is disabled', () => {
        expect(setup()('action.save', false)).toBe('action.save')
    })

    it('translates a key that exists only in the fallback locale', () => {
        const i18n = createI18n({
            legacy: false,
            locale: 'de',
            fallbackLocale: 'en',
            fallbackWarn: false,
            missingWarn: false,
            messages: { en: { action: { save: 'Save' } }, de: {} },
        })
        expect(withSetup(() => useMaybeTranslation(), [i18n])('action.save')).toBe('Save')
    })
})
