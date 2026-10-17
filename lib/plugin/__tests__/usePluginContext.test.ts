import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { mount } from '@vue/test-utils'
import { usePluginContext } from '@/plugin/composables/usePluginContext'
import { createUIKit } from '@/plugin/createUIKit'
import { Errors } from '@/plugin/constants/errors'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('usePluginContext', () => {
    it('throws when the plugin is not installed', () => {
        const app = createApp(() => null)
        expect(() => app.runWithContext(() => usePluginContext())).toThrow(Errors.NOT_INSTALLED)
    })

    it('returns the context inside app.runWithContext', () => {
        const context = createTestApp().runWithContext(() => usePluginContext())
        expect(context.dialogQueue.value).toEqual([])
        expect(context.toastQueue.value).toEqual([])
        expect(context.loadingOverlay.value).toBe(false)
        expect(context.toastTimers.size).toBe(0)
    })

    it('returns the context inside component setup', () => {
        let received: unknown = null
        const Host = {
            setup() {
                received = usePluginContext()
                return () => h('div')
            },
        }
        mount(Host, { global: { plugins: [createUIKit()] } })
        expect(received).not.toBeNull()
    })

    it('returns the same context for every call within one app', () => {
        const app = createTestApp()
        const first = app.runWithContext(() => usePluginContext())
        const second = app.runWithContext(() => usePluginContext())
        expect(first).toBe(second)
    })

    it('throws the library error without a Vue warning when called outside any context', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        try {
            expect(() => usePluginContext()).toThrow(Errors.NOT_INSTALLED)
            expect(warn).not.toHaveBeenCalled()
        } finally {
            warn.mockRestore()
        }
    })
})
