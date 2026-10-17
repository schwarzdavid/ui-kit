import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { VBtn } from 'vuetify/components'
import ConfirmDialog from '@/composables/dialog/components/dialog/presets/ConfirmDialog.vue'
import { ConfirmDialogLevel, type ConfirmDialogProps } from '@/composables/dialog/presets/ConfirmDialogProps'
import { mountDialogPreset, overlayContent, pressEscape } from '@/__tests__/helpers/mountDialogPreset'

function mountConfirm(data: ConfirmDialogProps) {
    const mounted = mountDialogPreset(ConfirmDialog, data)
    const buttons = () => mounted.wrapper.findAllComponents(VBtn).filter(button => button.element.closest('.ui-dialog__footer') !== null)
    const button = (text: string) => {
        const found = buttons().find(candidate => candidate.text() === text)
        if (!found) {
            throw new Error(`no footer button with text ${text}`)
        }
        return found
    }
    return { ...mounted, buttons, button }
}

const Content = defineComponent({
    props: { foo: { type: Number, required: true } },
    setup: props => () => h('p', { class: 'custom' }, `foo=${String(props.foo)}`),
})

describe('ConfirmDialog', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('resolves true after the confirm button', async () => {
        const { button, resolve } = mountConfirm({ title: 'Delete?', content: 'Really?' })
        await flushPromises()
        await button('common.yes').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith(true)
        })
    })

    it('resolves false after the reject button', async () => {
        const { button, resolve } = mountConfirm({ title: 'Delete?', content: 'Really?' })
        await flushPromises()
        await button('common.no').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith(false)
        })
    })

    it('rejects instead of resolving false when throwOnReject is set', async () => {
        const { button, resolve, reject } = mountConfirm({ title: 'Delete?', content: 'Really?', throwOnReject: true })
        await flushPromises()
        await button('common.no').trigger('click')
        await vi.waitFor(() => {
            expect(reject).toHaveBeenCalledTimes(1)
        })
        expect(resolve).not.toHaveBeenCalled()
    })

    it('renders a flat primary confirm and a text reject by default, confirm last', async () => {
        const { button, buttons } = mountConfirm({ title: 'T', content: 'C' })
        await flushPromises()
        expect(button('common.yes').classes()).toEqual(expect.arrayContaining(['v-btn--variant-flat', 'bg-primary']))
        expect(button('common.no').classes()).toContain('v-btn--variant-text')
        expect(buttons().map(candidate => candidate.text())).toEqual(['common.no', 'common.yes'])
    })

    it('orders the highlighted reject button last', async () => {
        const { button, buttons } = mountConfirm({ title: 'T', content: 'C', highlightCta: 'reject' })
        await flushPromises()
        expect(button('common.no').classes()).toEqual(expect.arrayContaining(['v-btn--variant-flat', 'bg-primary']))
        expect(button('common.yes').classes()).toContain('v-btn--variant-text')
        expect(buttons().map(candidate => candidate.text())).toEqual(['common.yes', 'common.no'])
    })

    it('renders both buttons as text when highlightCta is false', async () => {
        const { button } = mountConfirm({ title: 'T', content: 'C', highlightCta: false })
        await flushPromises()
        expect(button('common.no').classes()).toContain('v-btn--variant-text')
        expect(button('common.yes').classes()).toContain('v-btn--variant-text')
    })

    it('colours the confirm button by level and focuses cancel for danger', async () => {
        const { button } = mountConfirm({ title: 'T', content: 'C', level: ConfirmDialogLevel.DANGER })
        await flushPromises()
        expect(button('common.yes').classes()).toContain('bg-error')
        await vi.waitFor(() => {
            expect(document.activeElement).toBe(button('common.no').element)
        })
    })

    it('focuses the confirm button for the default level', async () => {
        const { button } = mountConfirm({ title: 'T', content: 'C' })
        await vi.waitFor(() => {
            expect(document.activeElement).toBe(button('common.yes').element)
        })
    })

    it('uses custom CTA texts', async () => {
        const { buttons } = mountConfirm({
            title: 'T',
            content: 'C',
            confirmCta: { text: 'Delete project', translateText: false },
            rejectCta: { text: 'Keep', translateText: false },
        })
        await flushPromises()
        expect(buttons().map(candidate => candidate.text())).toEqual(['Keep', 'Delete project'])
    })

    it('resolves false on Escape, but not while permanent', async () => {
        const first = mountConfirm({ title: 'T', content: 'C' })
        await flushPromises()
        pressEscape()
        await vi.waitFor(() => {
            expect(first.resolve).toHaveBeenCalledWith(false)
        })
        first.wrapper.unmount()
        document.body.innerHTML = ''

        const second = mountConfirm({ title: 'T', content: 'C', permanent: true })
        await flushPromises()
        pressEscape()
        await flushPromises()
        expect(second.resolve).not.toHaveBeenCalled()
        expect(document.body.querySelector('.ui-dialog')).not.toBeNull()
    })

    it('has no close button and uses the small width by default', async () => {
        mountConfirm({ title: 'T', content: 'C' })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__close')).toBeNull()
        expect(overlayContent().style.maxWidth).toBe('440px')
    })

    it('accepts a width token', async () => {
        mountConfirm({ title: 'T', content: 'C', width: 'md' })
        await flushPromises()
        expect(overlayContent().style.maxWidth).toBe('560px')
    })

    it('renders text content through the translation helper', async () => {
        mountConfirm({ title: 'T', content: 'Really delete this?', translateContent: false })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__text')?.textContent).toBe('Really delete this?')
    })

    it('renders a custom component with its props instead of text', async () => {
        mountConfirm({ title: 'T', component: Content, props: { foo: 5 } })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__body .custom')?.textContent).toBe('foo=5')
        expect(document.body.querySelector('.ui-dialog__text')).toBeNull()
    })
})
