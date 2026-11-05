import { describe, expect, it } from 'vitest'
import { defineComponent, isReactive, reactive } from 'vue'
import { resolvePluginOptions } from '@/plugin/helper/resolvePluginOptions'
import { createDefaultPluginOptions } from '@/plugin/helper/createDefaultPluginOptions'

const Custom = defineComponent({ name: 'CustomPreset', render: () => null })

describe('resolvePluginOptions', () => {
    it('returns the defaults when called without options', () => {
        expect(resolvePluginOptions()).toEqual(createDefaultPluginOptions())
    })

    it('deep-merges everything except components', () => {
        const options = resolvePluginOptions({ toast: { timeout: 10 }, i18n: { messages: { yes: 'custom.yes' } } })
        expect(options.toast).toEqual({ timeout: 10, errorTimeout: false })
        expect(options.i18n.messages.yes).toBe('custom.yes')
        expect(options.i18n.messages.no).toBe('common.no')
        expect(options.i18n.messages.saveFailed).toBe('dialog.saveFailed')
        expect(options.i18n.messages.unknownError).toBe('error.unknown')
        expect(options.loading).toEqual({ delay: 2000, overlay: false })
    })

    it('ships default keys for the sheet handle labels', () => {
        const options = resolvePluginOptions()
        expect(options.i18n.messages.expand).toBe('action.expand')
        expect(options.i18n.messages.collapse).toBe('action.collapse')
    })

    it('closes dialogs on overlay clicks by default and lets the option disable it', () => {
        expect(resolvePluginOptions().dialog.closeOnOverlayClick).toBe(true)
        expect(resolvePluginOptions({ dialog: { closeOnOverlayClick: false } }).dialog.closeOnOverlayClick).toBe(false)
    })

    it('replaces dialog components per key and keeps the other defaults', () => {
        const defaults = createDefaultPluginOptions()
        const options = resolvePluginOptions({ components: { dialog: { confirm: Custom } } })
        expect(options.components.dialog.confirm).toBe(Custom)
        expect(options.components.dialog.info).toBe(defaults.components.dialog.info)
        expect(options.components.dialog.form).toBe(defaults.components.dialog.form)
        expect(options.components.toast).toBe(defaults.components.toast)
    })

    it('replaces the toast component', () => {
        expect(resolvePluginOptions({ components: { toast: Custom } }).components.toast).toBe(Custom)
    })

    it('does not merge a custom component into the default one', () => {
        const defaults = createDefaultPluginOptions()
        resolvePluginOptions({ components: { dialog: { confirm: Custom } } })
        expect(defaults.components.dialog.confirm).not.toHaveProperty('name', 'CustomPreset')
    })

    it('marks every component raw so Vue never proxies it', () => {
        const options = resolvePluginOptions({ components: { toast: Custom } })
        expect(isReactive(reactive({ toast: options.components.toast }).toast)).toBe(false)
    })
})
