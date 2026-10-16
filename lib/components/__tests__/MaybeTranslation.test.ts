import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'

function mountWith(props: { content: string, translate?: boolean }) {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { common: { yes: 'Yes' } } } })
    return mount(MaybeTranslation, { props, global: { plugins: [i18n] } })
}

describe('MaybeTranslation', () => {
    it('renders the translation for an existing key', () => {
        expect(mountWith({ content: 'common.yes' }).text()).toBe('Yes')
    })

    it('renders unknown keys verbatim without warnings', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        expect(mountWith({ content: 'Hello world' }).text()).toBe('Hello world')
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('renders the content verbatim when translate is false', () => {
        expect(mountWith({ content: 'common.yes', translate: false }).text()).toBe('common.yes')
    })
})
