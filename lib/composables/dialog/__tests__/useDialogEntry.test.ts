import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, provide } from 'vue'
import { mount } from '@vue/test-utils'
import { useDialogEntry } from '@/composables/dialog/useDialogEntry'
import { DIALOG_ENTRY_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
import type { DialogEntryContext } from '@/composables/dialog/types/DialogEntryContext'
import { Errors } from '@/plugin/constants/errors'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('useDialogEntry', () => {
    it('throws outside of any injection context', () => {
        expect(() => useDialogEntry()).toThrow(Errors.DIALOG_ENTRY_CONTEXT_MISSING)
    })

    it('throws inside an app that has no dialog entry provided', () => {
        expect(() => createTestApp().runWithContext(() => useDialogEntry())).toThrow(Errors.DIALOG_ENTRY_CONTEXT_MISSING)
    })

    it('returns the provided context, also from a nested child', () => {
        const context: DialogEntryContext<{ title: string }, boolean> = { id: 'a', data: { title: 'Hi' }, resolve: vi.fn(), reject: vi.fn() }
        let received: DialogEntryContext<{ title: string }, boolean> | null = null
        const Child = defineComponent({
            setup() {
                received = useDialogEntry<{ title: string }, boolean>()
                return () => h('span')
            },
        })
        const Host = defineComponent({
            setup() {
                provide(DIALOG_ENTRY_INJECTION_KEY, context)
                return () => h('div', [h(Child)])
            },
        })
        mount(Host)
        expect(received).toBe(context)
    })
})
