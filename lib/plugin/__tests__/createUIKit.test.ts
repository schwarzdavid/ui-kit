import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { usePluginContext } from '@/plugin/composables/usePluginContext'
import { createDefaultPluginOptions } from '@/plugin/helper/createDefaultPluginOptions'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('createUIKit', () => {
    it('uses the default options when none are given', () => {
        const { options } = createTestApp().runWithContext(() => usePluginContext())
        expect(options).toEqual(createDefaultPluginOptions())
    })

    it('deep-merges user options over the defaults', () => {
        const { options } = createTestApp({ toast: { timeout: 10 }, i18n: { messages: { yes: 'custom.yes' } } })
            .runWithContext(() => usePluginContext())
        expect(options.toast.timeout).toBe(10)
        expect(options.i18n.messages.yes).toBe('custom.yes')
        expect(options.i18n.messages.no).toBe('common.no')
        expect(options.loading).toEqual({ delay: 2000, overlay: false })
    })

    it('exposes the configured components and toast defaults in the context', () => {
        const Custom = defineComponent({ render: () => null })
        const { options } = createTestApp({ components: { toast: Custom } }).runWithContext(() => usePluginContext())
        expect(options.components.toast).toBe(Custom)
        expect(options.components.dialog.confirm).toBe(createDefaultPluginOptions().components.dialog.confirm)
        expect(options.toast.errorTimeout).toBe(false)
    })

    it('gives every app its own context', () => {
        const first = createTestApp().runWithContext(() => usePluginContext())
        const second = createTestApp().runWithContext(() => usePluginContext())
        expect(first).not.toBe(second)
    })
})
