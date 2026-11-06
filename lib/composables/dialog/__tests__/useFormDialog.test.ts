import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, provide, readonly, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useFormDialog } from '@/composables/dialog/useFormDialog'
import { onDialogFinish } from '@/composables/dialog/onDialogFinish'
import { FORM_DIALOG_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
import type { FormDialogContext, FormDialogProvider } from '@/composables/dialog/types/FormDialogContext'
import { Errors } from '@/plugin/constants/errors'

function createProvider() {
    const remove = vi.fn()
    const provider: FormDialogProvider = {
        addFinishHandler: vi.fn(() => remove),
        submit: vi.fn(() => Promise.resolve()),
        close: vi.fn(),
        loading: readonly(ref(false)),
    }
    return { provider, remove }
}

function mountWith(provider: FormDialogProvider, setup: () => void) {
    const Child = defineComponent({
        setup() {
            setup()
            return () => h('span')
        },
    })
    const Host = defineComponent({
        setup() {
            provide(FORM_DIALOG_INJECTION_KEY, provider)
            return () => h('div', [h('div', [h(Child)])])
        },
    })
    return mount(Host)
}

describe('useFormDialog', () => {
    it('throws outside of a form dialog', () => {
        expect(() => useFormDialog()).toThrow(Errors.FORM_DIALOG_CONTEXT_MISSING)
    })

    it('returns submit, close and loading from the provider', () => {
        const { provider } = createProvider()
        const received: { current: FormDialogContext | null } = { current: null }
        mountWith(provider, () => {
            received.current = useFormDialog()
        })
        expect(received.current?.submit).toBe(provider.submit)
        expect(received.current?.close).toBe(provider.close)
        expect(received.current?.loading).toBe(provider.loading)
    })

    it('adds onFinish handlers and removes them when the component unmounts', () => {
        const { provider, remove } = createProvider()
        const handler = () => true
        const wrapper = mountWith(provider, () => {
            useFormDialog().onFinish(handler)
        })
        expect(provider.addFinishHandler).toHaveBeenCalledWith(handler)
        expect(remove).not.toHaveBeenCalled()
        wrapper.unmount()
        expect(remove).toHaveBeenCalledTimes(1)
    })
})

describe('onDialogFinish', () => {
    it('throws outside of a form dialog', () => {
        expect(() => onDialogFinish(() => true)).toThrow(Errors.FORM_DIALOG_CONTEXT_MISSING)
    })

    it('adds the handler, returns its remover and removes it when the component unmounts', () => {
        const { provider, remove } = createProvider()
        const handler = () => true
        const received: { current: (() => void) | null } = { current: null }
        const wrapper = mountWith(provider, () => {
            received.current = onDialogFinish(handler)
        })
        expect(provider.addFinishHandler).toHaveBeenCalledWith(handler)
        expect(received.current).toBe(remove)
        wrapper.unmount()
        expect(remove).toHaveBeenCalledTimes(1)
    })
})
