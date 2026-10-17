import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { VBtn } from 'vuetify/components'
import InfoDialog from '@/composables/dialog/components/dialog/presets/InfoDialog.vue'
import type { InfoDialogProps } from '@/composables/dialog/presets/InfoDialogProps'
import { mountDialogPreset, overlayContent } from '@/__tests__/helpers/mountDialogPreset'

function mountInfo(data: InfoDialogProps<unknown>) {
    const mounted = mountDialogPreset(InfoDialog, data)
    const footerButtons = () => mounted.wrapper.findAllComponents(VBtn).filter(button => button.element.closest('.ui-dialog__footer') !== null)
    const footerButton = (text: string) => {
        const found = footerButtons().find(candidate => candidate.text() === text)
        if (!found) {
            throw new Error(`no footer button with text ${text}`)
        }
        return found
    }
    const closeButton = () => mounted.wrapper.findAllComponents(VBtn).find(button => button.classes('ui-dialog__close'))
    return { ...mounted, footerButtons, footerButton, closeButton }
}

const Content = defineComponent({
    props: { foo: { type: Number, required: true } },
    setup: props => () => h('p', { class: 'custom' }, `foo=${String(props.foo)}`),
})

describe('InfoDialog', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('resolves null from the default CTA', async () => {
        const { footerButton, resolve } = mountInfo({ title: 'Info', content: 'Text' })
        await flushPromises()
        expect(footerButton('action.close').classes()).toEqual(expect.arrayContaining(['v-btn--variant-flat', 'bg-primary']))
        await footerButton('action.close').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith(null)
        })
    })

    it('resolves null from the close icon', async () => {
        const { closeButton, resolve } = mountInfo({ title: 'Info', content: 'Text' })
        await flushPromises()
        await closeButton()?.trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith(null)
        })
    })

    it('resolves the value of a value CTA', async () => {
        const { footerButton, resolve } = mountInfo({
            title: 'Pill',
            content: 'Choose',
            defaultCta: false,
            additionalCta: [
                { text: 'Red', translateText: false, value: 'red' },
                { text: 'Blue', translateText: false, value: 'blue' },
            ],
        })
        await flushPromises()
        expect(footerButton('Red').classes()).toContain('v-btn--variant-text')
        await footerButton('Blue').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('blue')
        })
    })

    it('runs an action CTA and keeps the dialog open', async () => {
        const action = vi.fn()
        const { footerButton, resolve } = mountInfo({
            title: 'Info',
            content: 'Text',
            additionalCta: [{ text: 'Run', translateText: false, action }],
        })
        await flushPromises()
        await footerButton('Run').trigger('click')
        await flushPromises()
        expect(action).toHaveBeenCalledTimes(1)
        expect(resolve).not.toHaveBeenCalled()
        expect(document.body.querySelector('.ui-dialog')).not.toBeNull()
    })

    it('omits the footer when no button is left', async () => {
        mountInfo({ title: 'Info', content: 'Text', defaultCta: false })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__footer')).toBeNull()
    })

    it('uses the small width by default and accepts a width token', async () => {
        const first = mountInfo({ title: 'Info', content: 'Text' })
        await flushPromises()
        expect(overlayContent().style.maxWidth).toBe('440px')
        first.wrapper.unmount()
        document.body.innerHTML = ''

        mountInfo({ title: 'Info', content: 'Text', width: 'lg' })
        await flushPromises()
        expect(overlayContent().style.maxWidth).toBe('720px')
    })

    it('renders text content and a custom default CTA label', async () => {
        const { footerButtons } = mountInfo({
            title: 'Info',
            content: 'Plain text',
            translateContent: false,
            defaultCta: { text: 'Got it', translateText: false },
        })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__text')?.textContent).toBe('Plain text')
        expect(footerButtons().map(button => button.text())).toEqual(['Got it'])
    })

    it('renders a component with its props', async () => {
        mountInfo({ title: 'Info', component: Content, props: { foo: 7 } })
        await flushPromises()
        expect(document.body.querySelector('.ui-dialog__body .custom')?.textContent).toBe('foo=7')
    })
})
