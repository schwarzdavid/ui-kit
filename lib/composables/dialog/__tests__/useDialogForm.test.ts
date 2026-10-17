import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, provide, readonly, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useDialogForm } from '@/composables/dialog/useDialogForm'
import { DIALOG_FORM_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
import type { DialogFormContext, DialogFormProvider } from '@/composables/dialog/types/DialogFormContext'
import { Errors } from '@/plugin/constants/errors'

describe('useDialogForm', () => {
    it('throws outside of a form dialog', () => {
        expect(() => useDialogForm(() => 'x')).toThrow(Errors.DIALOG_FORM_CONTEXT_MISSING)
    })

    it('registers the finish handler and returns submit and loading from the provider', () => {
        const finish = () => 'value'
        const loading = readonly(ref(false))
        const provider: DialogFormProvider = { register: vi.fn(), submit: vi.fn(() => Promise.resolve()), loading }
        const received: { current: DialogFormContext | null } = { current: null }
        const Child = defineComponent({
            setup() {
                received.current = useDialogForm(finish)
                return () => h('span')
            },
        })
        const Host = defineComponent({
            setup() {
                provide(DIALOG_FORM_INJECTION_KEY, provider)
                return () => h('div', [h('div', [h(Child)])])
            },
        })
        mount(Host)
        expect(provider.register).toHaveBeenCalledWith(finish)
        expect(received.current?.submit).toBe(provider.submit)
        expect(received.current?.loading).toBe(loading)
    })
})
