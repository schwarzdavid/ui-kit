import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { VAlert } from 'vuetify/components'
import { createI18n } from 'vue-i18n'
import ToastEntry from '@/composables/toast/components/ToastEntry.vue'
import { ToastType } from '@/composables/toast/types/ToastType'

function mountEntry() {
    const resolve = vi.fn()
    const entry = { id: 'id', message: 'hello', resolve, timeout: 1000, translateMessage: false, type: ToastType.SUCCESS }
    const wrapper = mount(ToastEntry, {
        props: { entry },
        global: {
            plugins: [createVuetify(), createI18n({ legacy: false, locale: 'en', messages: { en: {} } })],
        },
    })
    return { wrapper, resolve }
}

describe('ToastEntry', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders the message', () => {
        const { wrapper } = mountEntry()
        expect(wrapper.text()).toContain('hello')
    })

    it('resolves the entry when the timeout elapses', () => {
        const { resolve } = mountEntry()
        vi.advanceTimersByTime(999)
        expect(resolve).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1)
        expect(resolve).toHaveBeenCalledTimes(1)
    })

    it('resolves exactly once when closed manually before the timeout', async () => {
        const { wrapper, resolve } = mountEntry()
        wrapper.findComponent(VAlert).vm.$emit('click:close')
        await nextTick()
        vi.advanceTimersByTime(1000)
        expect(resolve).toHaveBeenCalledTimes(1)
    })

    it('does not resolve after being unmounted', () => {
        const { wrapper, resolve } = mountEntry()
        wrapper.unmount()
        vi.advanceTimersByTime(1000)
        expect(resolve).not.toHaveBeenCalled()
    })
})
