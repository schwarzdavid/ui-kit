import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, onMounted, ref } from 'vue'
import { VBtn } from 'vuetify/components'
import UiResponsiveDialog from '@/components/sheet/UiResponsiveDialog.vue'
import { mountWithUiKit } from '@/__tests__/helpers/mountWithUiKit'
import { withViewportWidth } from '@/__tests__/helpers/withViewportWidth'

function mountFrame(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    return mountWithUiKit(UiResponsiveDialog, {
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

async function clickOverlay(): Promise<void> {
    const scrim = document.body.querySelector<HTMLElement>('.v-overlay__scrim')
    if (!scrim) {
        throw new Error('overlay scrim not rendered')
    }
    scrim.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    scrim.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 0))
}

describe('UiResponsiveDialog', () => {
    enableAutoUnmount(afterEach)

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

    it('emits close on an overlay click unless persistent', async () => {
        const wrapper = mountFrame()
        await flushPromises()
        await clickOverlay()
        expect(wrapper.emitted('close')).toHaveLength(1)
        await wrapper.setProps({ persistent: true })
        await clickOverlay()
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('ignores overlay clicks when closeOnOverlayClick is disabled', async () => {
        const wrapper = mountWithUiKit(UiResponsiveDialog, {
            props: { modelValue: true, title: 'Frame title' },
            uiKit: { dialog: { closeOnOverlayClick: false } },
        })
        await flushPromises()
        await clickOverlay()
        pressEscape()
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('does not emit close for clicks inside the dialog', async () => {
        const wrapper = mountFrame()
        await flushPromises()
        const body = document.body.querySelector<HTMLElement>('.ui-dialog__body')
        body?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        body?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(wrapper.emitted('close')).toBeUndefined()
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
        mountWithUiKit(UiResponsiveDialog, { props: { modelValue: true, title: 'T' }, slots: { default: 'Body' } })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__footer')).toBeNull()
    })

    it('renders a bottom sheet below the mobile breakpoint', async () => {
        await withViewportWidth(360, async () => {
            mountFrame()
            await flushPromises()
            expect(document.body.querySelector('.ui-sheet')).not.toBeNull()
            expect(document.body.querySelector('.ui-dialog')).toBeNull()
        })
    })

    it('pads the default and preview slots inside the sheet on mobile', async () => {
        await withViewportWidth(360, async () => {
            mountFrame({}, { preview: '<p class="teaser">Teaser</p>' })
            await flushPromises()
            expect(document.body.querySelector('.ui-sheet__preview > .ui-responsive-dialog__sheet-section .teaser')).not.toBeNull()
            expect(document.body.querySelector('.ui-sheet__content > .ui-responsive-dialog__sheet-section .body')).not.toBeNull()
        })
    })

    it('renders a dialog at or above the mobile breakpoint', async () => {
        await withViewportWidth(1024, async () => {
            mountFrame()
            await flushPromises()
            expect(document.body.querySelector('.ui-dialog')).not.toBeNull()
            expect(document.body.querySelector('.ui-sheet')).toBeNull()
        })
    })

    it('ignores the preview slot on desktop', async () => {
        mountFrame({}, { preview: '<p class="teaser">Teaser</p>' })
        await flushPromises()
        expect(document.body.querySelector('.teaser')).toBeNull()
        expect(document.body.textContent).not.toContain('Teaser')
        expect(document.body.querySelector('.ui-dialog__body .body')).not.toBeNull()
    })

    it('follows a consumer mobileBreakpoint', async () => {
        await withViewportWidth(1024, async () => {
            mountWithUiKit(UiResponsiveDialog, {
                props: { modelValue: true, title: 'Frame title' },
                slots: { default: '<p class="body">Body</p>' },
                vuetify: { display: { mobileBreakpoint: 'lg' } },
            })
            await flushPromises()
            expect(document.body.querySelector('.ui-sheet')).not.toBeNull()
            expect(document.body.querySelector('.ui-dialog')).toBeNull()
        })
    })

    it('forwards the sheet stage and its events on mobile', async () => {
        await withViewportWidth(360, async () => {
            const wrapper = mountFrame({ stage: 'fullscreen', form: true })
            await flushPromises()
            expect(document.body.querySelector('.ui-sheet--fullscreen')).not.toBeNull()
            expect(document.body.querySelector('.ui-sheet__title')?.textContent).toContain('Frame title')
            expect(document.body.querySelector('.ui-sheet__footer .ok')).not.toBeNull()
            document.body.querySelector('form.ui-sheet__layout')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
            expect(wrapper.emitted('submit')).toHaveLength(1)
            pressEscape()
            expect(wrapper.emitted('close')).toHaveLength(1)
            await wrapper.setProps({ stage: 'content' })
            expect(document.body.querySelector('.ui-sheet--content')).not.toBeNull()
        })
    })

    it('forwards update:stage from the sheet on mobile', async () => {
        await withViewportWidth(360, async () => {
            const wrapper = mountFrame()
            await flushPromises()
            expect(wrapper.emitted('update:stage')).toEqual([['content']])
        })
    })

    it('closes through v-model alone on Escape on desktop and mobile', async () => {
        for (const width of [1024, 360]) {
            await withViewportWidth(width, async () => {
                const open = ref(true)
                const Host = defineComponent({
                    setup: () => () => h(UiResponsiveDialog, {
                        'modelValue': open.value,
                        'title': 'Frame title',
                        'onUpdate:modelValue': (value: boolean) => {
                            open.value = value
                        },
                    }, { default: () => h('p', { class: 'body' }, 'Body') }),
                })
                const wrapper = mountWithUiKit(Host)
                await flushPromises()
                pressEscape()
                await flushPromises()
                expect(open.value).toBe(false)
                expect(wrapper.findComponent(UiResponsiveDialog).emitted('update:modelValue')).toEqual([[false]])
                wrapper.unmount()
                document.body.innerHTML = ''
            })
        }
    })

    it('emits update:modelValue with close from the close button', async () => {
        const wrapper = mountFrame()
        await flushPromises()
        const close = wrapper.findAllComponents(VBtn).find(button => button.classes('ui-dialog__close'))
        await close?.trigger('click')
        expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('keeps the default slot mounted when the viewport crosses the breakpoint', async () => {
        let mounts = 0
        const Body = defineComponent({
            setup() {
                const value = ref('')
                onMounted(() => {
                    mounts++
                })
                return () => h('input', {
                    class: 'field',
                    value: value.value,
                    onInput: (event: Event) => {
                        value.value = (event.target as HTMLInputElement).value
                    },
                })
            },
        })
        const field = () => document.body.querySelector<HTMLInputElement>('.field')
        await withViewportWidth(1024, async () => {
            const wrapper = mountWithUiKit(UiResponsiveDialog, {
                props: { modelValue: true, title: 'Frame title' },
                slots: { default: () => h(Body) },
            })
            await vi.waitFor(() => {
                expect(wrapper.emitted('opened')).toHaveLength(1)
            })
            const input = field()
            if (input) {
                input.value = 'kept'
                input.dispatchEvent(new Event('input', { bubbles: true }))
            }
            await flushPromises()
            expect(document.body.querySelector('.ui-dialog__body .field')).not.toBeNull()
            await withViewportWidth(360, async () => {
                await flushPromises()
                expect(document.body.querySelector('.ui-sheet__content .field')).not.toBeNull()
                expect(field()?.value).toBe('kept')
                await vi.waitFor(() => {
                    expect(wrapper.emitted('opened')).toHaveLength(2)
                })
            })
            await flushPromises()
            expect(document.body.querySelector('.ui-dialog__body .field')).not.toBeNull()
            expect(field()?.value).toBe('kept')
            expect(mounts).toBe(1)
            expect(wrapper.emitted('close')).toBeUndefined()
        })
    })

    it('renders the default slot fresh after closing and reopening', async () => {
        let mounts = 0
        const Body = defineComponent({
            setup() {
                onMounted(() => {
                    mounts++
                })
                return () => h('p', { class: 'body' }, 'Body')
            },
        })
        const wrapper = mountWithUiKit(UiResponsiveDialog, {
            props: { modelValue: true, title: 'Frame title' },
            slots: { default: () => h(Body) },
        })
        await flushPromises()
        expect(mounts).toBe(1)
        await wrapper.setProps({ modelValue: false })
        await vi.waitFor(() => {
            expect(wrapper.emitted('closed')).toHaveLength(1)
        })
        await flushPromises()
        expect(document.body.querySelector('.body')).toBeNull()
        await wrapper.setProps({ modelValue: true })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__body .body')).not.toBeNull()
        expect(mounts).toBe(2)
    })

    it('emits closed when the viewport crosses the breakpoint during the leave transition', async () => {
        await withViewportWidth(1024, async () => {
            const wrapper = mountFrame()
            await vi.waitFor(() => {
                expect(wrapper.emitted('opened')).toHaveLength(1)
            })
            await wrapper.setProps({ modelValue: false })
            await withViewportWidth(360, async () => {
                await vi.waitFor(() => {
                    expect(wrapper.emitted('closed')).toHaveLength(1)
                })
                await new Promise(resolve => setTimeout(resolve, 50))
                expect(wrapper.emitted('closed')).toHaveLength(1)
            })
        })
    })

    it('does not emit closed for a breakpoint swap while it was never opened', async () => {
        await withViewportWidth(1024, async () => {
            const wrapper = mountFrame({ modelValue: false })
            await flushPromises()
            await withViewportWidth(360, async () => {
                await flushPromises()
            })
            await flushPromises()
            expect(wrapper.emitted('closed')).toBeUndefined()
        })
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
