import { describe, expect, it } from 'vitest'
import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
import { runWithUiKit } from '@/__tests__/helpers/createTestApp'

describe('useDialogCta', () => {
    it('falls back to the configured i18n message key', () => {
        const cta = runWithUiKit(() => useDialogCta(undefined, 'save'))
        expect(cta).toEqual({ text: 'action.save', translateText: true })
    })

    it('uses custom message keys from the plugin options', () => {
        const cta = runWithUiKit(() => useDialogCta(undefined, 'yes'), { i18n: { messages: { yes: 'custom.yes' } } })
        expect(cta.text).toBe('custom.yes')
    })

    it('lets explicit options override the defaults', () => {
        const cta = runWithUiKit(() => useDialogCta({ text: 'Click me', translateText: false }, 'cancel'))
        expect(cta).toEqual({ text: 'Click me', translateText: false })
    })

    it('ignores undefined option values', () => {
        const cta = runWithUiKit(() => useDialogCta({ text: undefined }, 'close'))
        expect(cta.text).toBe('action.close')
    })
})
