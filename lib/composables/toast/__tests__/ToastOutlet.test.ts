import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import ToastOutlet from '@/composables/toast/components/ToastOutlet.vue'
import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { useToastEntry } from '@/composables/toast/useToastEntry'
import { ToastType } from '@/composables/toast/types/ToastType'
import { mountWithUiKit } from '@/__tests__/helpers/mountWithUiKit'
import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'

const CustomToast = defineComponent({
    setup() {
        const { entry, close } = useToastEntry()
        return () => h('button', { class: 'custom-toast', onClick: close }, `custom:${entry.message}`)
    },
})

function setup(uiKit?: CreateUIKitOptions) {
    const wrapper = mountWithUiKit(ToastOutlet, { uiKit })
    const queue = wrapper.vm.$.appContext.app.runWithContext(() => useToastQueue())
    const add = (message: string) => queue.addToQueue({ message, translateMessage: false, timeout: false, type: ToastType.INFO, resolve: vi.fn() })
    return { wrapper, queue, add }
}

describe('ToastOutlet', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('renders queued entries with the default toast component, newest last', async () => {
        const { wrapper, add } = setup()
        add('first')
        add('second')
        await nextTick()
        expect(wrapper.findAll('.ui-toast .ui-toast__message').map(node => node.text())).toEqual(['first', 'second'])
    })

    it('renders the toast component from the plugin options', async () => {
        const { wrapper, add, queue } = setup({ components: { toast: CustomToast } })
        const entry = add('hello')
        await nextTick()
        expect(wrapper.find('.custom-toast').text()).toBe('custom:hello')
        await wrapper.find('.custom-toast').trigger('click')
        expect(queue.queue.value).toHaveLength(0)
        expect(entry.resolve).toHaveBeenCalledWith(false)
    })

    it('carries no live-region attributes on the stack itself', () => {
        const { wrapper } = setup()
        expect(wrapper.find('.ui-toast-outlet').attributes('role')).toBeUndefined()
        expect(wrapper.find('.ui-toast-outlet').attributes('aria-live')).toBeUndefined()
    })

    it('announces non-error toasts through a persistent polite live region', async () => {
        const { wrapper, add } = setup()
        const announcer = wrapper.find('.ui-toast-outlet__announcer')
        expect(announcer.attributes('aria-live')).toBe('polite')
        expect(announcer.attributes('aria-atomic')).toBe('true')
        expect(announcer.text()).toBe('')
        add('Project saved')
        await flushPromises()
        expect(wrapper.find('.ui-toast-outlet__announcer').text()).toBe('Project saved')
    })

    it('does not mirror error toasts into the live region', async () => {
        const { wrapper, queue } = setup()
        queue.addToQueue({ message: 'Failed', translateMessage: false, timeout: false, type: ToastType.ERROR, resolve: vi.fn() })
        await flushPromises()
        expect(wrapper.find('.ui-toast-outlet__announcer').text()).toBe('')
        expect(wrapper.find('.ui-toast').attributes('role')).toBe('alert')
    })

    it('announces the same message again when it is queued a second time', async () => {
        const { wrapper, add } = setup()
        add('Saved')
        await flushPromises()
        const announcer = wrapper.find('.ui-toast-outlet__announcer').element
        const changes: string[] = []
        const observer = new MutationObserver(() => {
            changes.push(announcer.textContent)
        })
        observer.observe(announcer, { childList: true, characterData: true, subtree: true })
        add('Saved')
        await flushPromises()
        observer.disconnect()
        expect(changes).toContain('')
        expect(wrapper.find('.ui-toast-outlet__announcer').text()).toBe('Saved')
    })

    it('switches to the mobile layout on phones', () => {
        const originalWidth = window.innerWidth
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 })
        try {
            const { wrapper } = setup()
            expect(wrapper.find('.ui-toast-outlet').classes()).toContain('ui-toast-outlet--mobile')
        } finally {
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
        }
    })
})
