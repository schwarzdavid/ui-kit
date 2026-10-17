import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, provide } from 'vue'
import { VBtn } from 'vuetify/components'
import { mdiAlertCircleOutline, mdiCheckCircleOutline } from '@mdi/js'
import ToastEntry from '@/composables/toast/components/ToastEntry.vue'
import { TOAST_ENTRY_INJECTION_KEY } from '@/composables/toast/constants/injectionKey'
import type { ToastEntryContext, ToastEntryData } from '@/composables/toast/types/ToastEntryContext'
import { ToastType } from '@/composables/toast/types/ToastType'
import { mountWithUiKit } from '@/__tests__/helpers/mountWithUiKit'

function mountToast(entry: Partial<ToastEntryData> = {}) {
    const close = vi.fn()
    const trigger = vi.fn()
    const context: ToastEntryContext = {
        entry: { id: 'id', message: 'hello', translateMessage: false, timeout: 1000, type: ToastType.SUCCESS, ...entry },
        close,
        trigger,
    }
    const Host = defineComponent({
        setup() {
            provide(TOAST_ENTRY_INJECTION_KEY, context)
            return () => h(ToastEntry)
        },
    })
    const wrapper = mountWithUiKit(Host)
    const buttons = () => wrapper.findAllComponents(VBtn)
    return { wrapper, close, trigger, buttons }
}

describe('ToastEntry', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('renders the message without a live-region role and with the success outline icon', () => {
        const { wrapper } = mountToast()
        expect(wrapper.find('.ui-toast').attributes('role')).toBeUndefined()
        expect(wrapper.find('.ui-toast__message').text()).toBe('hello')
        expect(wrapper.find('.ui-toast__icon svg path').attributes('d')).toBe(mdiCheckCircleOutline)
    })

    it('uses the alert role and the error outline icon for errors', () => {
        const { wrapper } = mountToast({ type: ToastType.ERROR })
        expect(wrapper.find('.ui-toast').attributes('role')).toBe('alert')
        expect(wrapper.find('.ui-toast__icon svg path').attributes('d')).toBe(mdiAlertCircleOutline)
    })

    it('closes through the close button, which carries the close label', async () => {
        const { buttons, close, trigger } = mountToast()
        const closeButton = buttons().find(button => button.classes('ui-toast__close'))
        expect(closeButton?.attributes('aria-label')).toBe('action.close')
        expect(closeButton?.classes()).toContain('v-btn--variant-text')
        await closeButton?.trigger('click')
        expect(close).toHaveBeenCalledTimes(1)
        expect(trigger).not.toHaveBeenCalled()
    })

    it('renders no action button without an action', () => {
        const { wrapper } = mountToast()
        expect(wrapper.find('.ui-toast__action').exists()).toBe(false)
    })

    it('renders the action button and triggers through it', async () => {
        const { buttons, close, trigger } = mountToast({ action: { text: 'Undo', translateText: false } })
        const action = buttons().find(button => button.classes('ui-toast__action'))
        expect(action?.text()).toBe('Undo')
        await action?.trigger('click')
        expect(trigger).toHaveBeenCalledTimes(1)
        expect(close).not.toHaveBeenCalled()
    })
})
