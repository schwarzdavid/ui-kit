import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { VBtn } from 'vuetify/components'
import DialogFrame from '@/composables/dialog/components/dialog/internal/DialogFrame.vue'
import { mountWithUiKit } from '@/__tests__/helpers/mountWithUiKit'

function mountFrame(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    return mountWithUiKit(DialogFrame, {
        props: { modelValue: true, title: 'Frame title', ...props },
        slots: {
            default: '<p class="body">Body</p>',
            actions: '<button type="button" class="ok">OK</button>',
            ...slots,
        },
    })
}

function overlayContent(): HTMLElement {
    const content = document.body.querySelector<HTMLElement>('.v-overlay__content')
    if (!content) {
        throw new Error('overlay content not rendered')
    }
    return content
}

function pressEscape(): void {
    overlayContent().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

describe('DialogFrame', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('renders title, body and actions and emits close from the close button', async () => {
        const wrapper = mountFrame()
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__title')?.textContent).toContain('Frame title')
        expect(document.body.querySelector('.ui-dialog__body .body')?.textContent).toBe('Body')
        expect(document.body.querySelector('.ui-dialog__footer .ok')).not.toBeNull()
        const close = wrapper.findAllComponents(VBtn).find(button => button.classes('ui-dialog__close'))
        expect(close?.attributes('aria-label')).toBe('action.close')
        await close?.trigger('click')
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('hides the close button when not closable', async () => {
        mountFrame({ closable: false })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__close')).toBeNull()
    })

    it('emits close on Escape unless persistent', async () => {
        const wrapper = mountFrame()
        await flushPromises()
        pressEscape()
        expect(wrapper.emitted('close')).toHaveLength(1)
        await wrapper.setProps({ persistent: true })
        pressEscape()
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('disables the close button while persistent', async () => {
        const wrapper = mountFrame({ persistent: true })
        await flushPromises()
        const close = wrapper.findAllComponents(VBtn).find(button => button.classes('ui-dialog__close'))
        expect(close?.attributes('disabled')).toBeDefined()
    })

    it('renders a form and emits submit when form is set', async () => {
        const wrapper = mountFrame({ form: true })
        await flushPromises()
        const form = document.body.querySelector<HTMLFormElement>('form.ui-dialog__layout')
        expect(form).not.toBeNull()
        expect(form?.hasAttribute('novalidate')).toBe(true)
        form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        expect(wrapper.emitted('submit')).toHaveLength(1)
    })

    it('renders a div when form is not set', async () => {
        mountFrame()
        await flushPromises()
        expect(document.body.querySelector('div.ui-dialog__layout')).not.toBeNull()
        expect(document.body.querySelector('form')).toBeNull()
    })

    it('maps width tokens to pixels', async () => {
        mountFrame({ width: 'lg' })
        await flushPromises()
        expect(overlayContent().style.maxWidth).toBe('720px')
    })

    it('applies a numeric width', async () => {
        mountFrame({ width: 900 })
        await flushPromises()
        expect(overlayContent().style.maxWidth).toBe('900px')
    })

    it('omits the footer without an actions slot', async () => {
        mountWithUiKit(DialogFrame, { props: { modelValue: true, title: 'T' }, slots: { default: 'Body' } })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__footer')).toBeNull()
    })

    it('goes fullscreen on phones when fullscreenOnMobile is set', async () => {
        const originalWidth = window.innerWidth
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 })
        try {
            mountFrame({ fullscreenOnMobile: true })
            await flushPromises()
            expect(document.body.querySelector('.ui-dialog')?.classList.contains('ui-dialog--fullscreen')).toBe(true)
            expect(document.body.querySelector('.ui-dialog__header')?.firstElementChild?.classList.contains('ui-dialog__close')).toBe(true)
        } finally {
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
        }
    })

    it('stays centred on phones without fullscreenOnMobile', async () => {
        const originalWidth = window.innerWidth
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 })
        try {
            mountFrame()
            await flushPromises()
            expect(document.body.querySelector('.ui-dialog--fullscreen')).toBeNull()
        } finally {
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
        }
    })

    it('emits opened after entering and closed after leaving', async () => {
        const wrapper = mountFrame()
        await vi.waitFor(() => {
            expect(wrapper.emitted('opened')).toHaveLength(1)
        })
        await wrapper.setProps({ modelValue: false })
        await vi.waitFor(() => {
            expect(wrapper.emitted('closed')).toHaveLength(1)
        })
    })
})
