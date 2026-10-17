import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, provide } from 'vue'
import { mount } from '@vue/test-utils'
import { useToastEntry } from '@/composables/toast/useToastEntry'
import { TOAST_ENTRY_INJECTION_KEY } from '@/composables/toast/constants/injectionKey'
import type { ToastEntryContext } from '@/composables/toast/types/ToastEntryContext'
import { ToastType } from '@/composables/toast/types/ToastType'
import { Errors } from '@/plugin/constants/errors'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('useToastEntry', () => {
    it('throws outside of any injection context', () => {
        expect(() => useToastEntry()).toThrow(Errors.TOAST_ENTRY_CONTEXT_MISSING)
    })

    it('throws inside an app without a toast entry', () => {
        expect(() => createTestApp().runWithContext(() => useToastEntry())).toThrow(Errors.TOAST_ENTRY_CONTEXT_MISSING)
    })

    it('returns the provided context', () => {
        const context: ToastEntryContext = {
            entry: { id: 'a', message: 'Saved', translateMessage: false, timeout: 4000, type: ToastType.SUCCESS },
            close: vi.fn(),
            trigger: vi.fn(),
        }
        let received: ToastEntryContext | null = null
        const Host = defineComponent({
            setup() {
                provide(TOAST_ENTRY_INJECTION_KEY, context)
                return () => h(defineComponent({
                    setup() {
                        received = useToastEntry()
                        return () => h('span')
                    },
                }))
            },
        })
        mount(Host)
        expect(received).toBe(context)
    })
})
