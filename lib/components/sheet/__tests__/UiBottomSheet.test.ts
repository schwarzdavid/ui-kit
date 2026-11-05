import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createVuetify } from 'vuetify'
import { createI18n } from 'vue-i18n'
import { createUIKit } from '@/plugin/createUIKit'
import UiBottomSheet from '@/components/sheet/UiBottomSheet.vue'
import { mountWithUiKit } from '@/__tests__/helpers/mountWithUiKit'
import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'
import type { SheetStage } from '@/components/sheet/types/SheetStage'

let now = 0

function mountSheet(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}, uiKit?: CreateUIKitOptions) {
    return mountWithUiKit(UiBottomSheet, {
        props: { modelValue: true, title: 'Sheet title', ...props },
        slots: {
            default: '<p class="body">Body</p>',
            actions: '<button type="button" class="ok">OK</button>',
            ...slots,
        },
        uiKit,
    })
}

function query(selector: string): HTMLElement {
    const element = document.body.querySelector<HTMLElement>(selector)
    if (!element) {
        throw new Error(`${selector} not rendered`)
    }
    return element
}

function overlayContent(): HTMLElement {
    return query('.v-overlay__content')
}

function pressEscape(): void {
    overlayContent().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

async function clickOverlay(): Promise<void> {
    const scrim = query('.v-overlay__scrim')
    scrim.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    scrim.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 0))
}

function pointer(type: string, clientY: number, target: EventTarget, pointerType = 'mouse') {
    const event = new MouseEvent(type, { clientY, bubbles: true })
    Object.defineProperty(event, 'pointerId', { value: 1 })
    Object.defineProperty(event, 'pointerType', { value: pointerType })
    target.dispatchEvent(event)
}

describe('UiBottomSheet', () => {
    beforeEach(() => {
        now = 0
        vi.spyOn(performance, 'now').mockImplementation(() => now)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        document.body.innerHTML = ''
    })

    it('opens in the preview stage when a preview slot is given', async () => {
        mountSheet({}, { preview: '<p class="teaser">Teaser</p>' })
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--preview')).toBe(true)
        expect(query('.ui-sheet__preview').style.display).not.toBe('none')
        expect(query('.ui-sheet__preview .teaser').textContent).toBe('Teaser')
        expect(query('.ui-sheet__content').style.display).toBe('none')
        expect(document.body.querySelector('.ui-sheet__close')).toBeNull()
    })

    it('opens in the content stage without a preview slot', async () => {
        mountSheet()
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--content')).toBe(true)
        expect(document.body.querySelector('.ui-sheet__preview')).toBeNull()
        expect(query('.ui-sheet__content .body').textContent).toBe('Body')
    })

    it('renders the title through the translation helper', async () => {
        mountSheet({ title: 'action.save' })
        await flushPromises()
        expect(query('.ui-sheet__title').textContent).toContain('action.save')
    })

    it('keeps the default slot mounted in the preview stage', async () => {
        const Host = defineComponent({
            setup() {
                const value = ref('typed value')
                return () => h(UiBottomSheet, { modelValue: true }, {
                    preview: () => h('p', 'Teaser'),
                    default: () => h('input', {
                        class: 'field',
                        value: value.value,
                        onInput: (event: Event) => {
                            value.value = (event.target as HTMLInputElement).value
                        },
                    }),
                })
            },
        })
        mountWithUiKit(Host)
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--preview')).toBe(true)
        expect((query('.ui-sheet__content .field') as HTMLInputElement).value).toBe('typed value')
    })

    it('renders the actions in every stage', async () => {
        mountSheet({}, { preview: '<p>Teaser</p>' })
        await flushPromises()
        expect(query('.ui-sheet--preview .ui-sheet__footer .ok')).not.toBeNull()
        document.body.innerHTML = ''
        mountSheet({ stage: 'content' })
        await flushPromises()
        expect(query('.ui-sheet--content .ui-sheet__footer .ok')).not.toBeNull()
        document.body.innerHTML = ''
        mountSheet({ stage: 'fullscreen' })
        await flushPromises()
        expect(query('.ui-sheet--fullscreen .ui-sheet__footer .ok')).not.toBeNull()
    })

    it('follows the stage prop', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        await wrapper.setProps({ stage: 'fullscreen' })
        expect(query('.ui-sheet').classList.contains('ui-sheet--fullscreen')).toBe(true)
        await wrapper.setProps({ stage: 'content' })
        expect(query('.ui-sheet').classList.contains('ui-sheet--content')).toBe(true)
    })

    it('toggles to fullscreen from the handle', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        const handle = query('.ui-sheet__handle')
        expect(handle.tagName).toBe('BUTTON')
        expect(handle.getAttribute('aria-label')).toBe('action.expand')
        expect(handle.hasAttribute('aria-expanded')).toBe(false)
        handle.click()
        await flushPromises()
        expect(wrapper.emitted('update:stage')?.at(-1)).toEqual(['fullscreen'])
        expect(query('.ui-sheet').classList.contains('ui-sheet--fullscreen')).toBe(true)
        expect(handle.getAttribute('aria-label')).toBe('action.collapse')
        expect(handle.hasAttribute('aria-expanded')).toBe(false)
        handle.click()
        await flushPromises()
        expect(wrapper.emitted('update:stage')?.at(-1)).toEqual(['content'])
    })

    it('expands to content instead of fullscreen when not expandable but a preview exists', async () => {
        const wrapper = mountSheet({ expandable: false }, { preview: '<p>Teaser</p>' })
        await flushPromises()
        query('.ui-sheet__handle').click()
        await flushPromises()
        expect(wrapper.emitted('update:stage')?.at(-1)).toEqual(['content'])
        expect(query('.ui-sheet__content').style.display).not.toBe('none')
        expect(query('.ui-sheet__preview').style.display).toBe('none')
    })

    it('renders a decorative handle when there is only one stage', async () => {
        const wrapper = mountSheet({ expandable: false })
        await flushPromises()
        const handle = query('.ui-sheet__handle')
        expect(handle.tagName).not.toBe('BUTTON')
        expect(handle.getAttribute('aria-hidden')).toBe('true')
        expect(handle.hasAttribute('aria-label')).toBe(false)
        handle.click()
        await flushPromises()
        expect(wrapper.emitted('update:stage')).toEqual([['content']])
    })

    it('shows the close button in the content and fullscreen stages', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        expect(query('.ui-sheet--content .ui-sheet__close')).not.toBeNull()
        await wrapper.setProps({ stage: 'fullscreen' })
        const close = query('.ui-sheet__close')
        expect(close.getAttribute('aria-label')).toBe('action.close')
        close.click()
        expect(wrapper.emitted('close')).toHaveLength(1)
        expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
        await wrapper.setProps({ persistent: true })
        expect(query('.ui-sheet__close').hasAttribute('disabled')).toBe(true)
        await wrapper.setProps({ persistent: false, closable: false })
        expect(document.body.querySelector('.ui-sheet__close')).toBeNull()
    })

    it('emits close on Escape and on a scrim click unless persistent', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        pressEscape()
        expect(wrapper.emitted('close')).toHaveLength(1)
        await clickOverlay()
        expect(wrapper.emitted('close')).toHaveLength(2)
        expect(wrapper.emitted('update:modelValue')).toEqual([[false], [false]])
        await wrapper.setProps({ persistent: true })
        pressEscape()
        await clickOverlay()
        expect(wrapper.emitted('close')).toHaveLength(2)
        expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
    })

    it('ignores scrim clicks when closeOnOverlayClick is disabled', async () => {
        const wrapper = mountSheet({}, {}, { dialog: { closeOnOverlayClick: false } })
        await flushPromises()
        await clickOverlay()
        expect(wrapper.emitted('close')).toBeUndefined()
        pressEscape()
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('does not emit close for clicks inside the sheet', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        const body = query('.ui-sheet__body')
        body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(wrapper.emitted('close')).toBeUndefined()
    })

    it('emits close on a swipe down', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        pointer('pointerdown', 100, query('.ui-sheet__handle'))
        now = 100
        pointer('pointermove', 400, window)
        pointer('pointerup', 400, window)
        expect(wrapper.emitted('close')).toHaveLength(1)
        expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    })

    it('springs back instead of closing on a swipe down while persistent', async () => {
        const wrapper = mountSheet({ persistent: true })
        await flushPromises()
        pointer('pointerdown', 100, query('.ui-sheet__handle'))
        now = 100
        pointer('pointermove', 400, window)
        await flushPromises()
        expect(query('.ui-sheet').style.transform).toBe('translateY(300px)')
        pointer('pointerup', 400, window)
        await flushPromises()
        expect(wrapper.emitted('close')).toBeUndefined()
        expect(wrapper.emitted('update:stage')).toEqual([['content']])
        expect(query('.ui-sheet').classList.contains('ui-sheet--content')).toBe(true)
        expect(query('.ui-sheet').style.transform).toBe('')
    })

    it('marks the sheet as dragging while a drag is active', async () => {
        mountSheet()
        await flushPromises()
        pointer('pointerdown', 500, query('.ui-sheet__header'))
        now = 100
        pointer('pointermove', 450, window)
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--dragging')).toBe(true)
        expect(query('.ui-sheet').style.height).toBe('50px')
        pointer('pointerup', 450, window)
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--dragging')).toBe(false)
    })

    it('damps an upward drag above the top stage', async () => {
        mountSheet({ stage: 'fullscreen' })
        await flushPromises()
        pointer('pointerdown', 500, query('.ui-sheet__handle'))
        now = 100
        pointer('pointermove', 400, window)
        await flushPromises()
        expect(query('.ui-sheet').style.height).toBe(`${String(window.innerHeight + 20)}px`)
        pointer('pointerup', 400, window)
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--fullscreen')).toBe(true)
    })

    it('emits submit from the form layout', async () => {
        const wrapper = mountSheet({ form: true })
        await flushPromises()
        const form = query('form.ui-sheet__layout')
        expect(form.hasAttribute('novalidate')).toBe(true)
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        expect(wrapper.emitted('submit')).toHaveLength(1)
    })

    it('renders a div layout when form is not set', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        expect(document.body.querySelector('div.ui-sheet__layout')).not.toBeNull()
        expect(document.body.querySelector('form')).toBeNull()
        query('.ui-sheet__layout').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        expect(wrapper.emitted('submit')).toBeUndefined()
    })

    it('keeps the actions outside the scrolling body', async () => {
        mountSheet()
        await flushPromises()
        const body = query('.ui-sheet__body')
        const footer = query('.ui-sheet__footer')
        expect(body.nextElementSibling).toBe(footer)
        expect(body.contains(footer)).toBe(false)
    })

    it('omits the footer without an actions slot', async () => {
        mountWithUiKit(UiBottomSheet, { props: { modelValue: true }, slots: { default: 'Body' } })
        await flushPromises()
        expect(document.body.querySelector('.ui-sheet__footer')).toBeNull()
        expect(document.body.querySelector('.ui-sheet__title')).toBeNull()
    })

    it('emits opened after entering and closed after leaving', async () => {
        const wrapper = mountSheet()
        await vi.waitFor(() => {
            expect(wrapper.emitted('opened')).toHaveLength(1)
        })
        await wrapper.setProps({ modelValue: false })
        await vi.waitFor(() => {
            expect(wrapper.emitted('closed')).toHaveLength(1)
        })
    })

    it('falls back to the content stage when the preview slot is removed in the preview stage', async () => {
        const { show } = mountTogglingPreview()
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--preview')).toBe(true)
        show.value = false
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--content')).toBe(true)
        expect(document.body.querySelector('.ui-sheet__preview')).toBeNull()
        expect(query('.ui-sheet__content').style.display).not.toBe('none')
    })

    it('stays in fullscreen when the preview slot is removed', async () => {
        const { show, stages } = mountTogglingPreview('fullscreen')
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--fullscreen')).toBe(true)
        show.value = false
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--fullscreen')).toBe(true)
        expect(stages).toEqual([])
    })

    it('emits the initial stage on mount', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        expect(wrapper.emitted('update:stage')).toEqual([['content']])
    })

    it('emits the actual stage when the stage prop is not available', async () => {
        const wrapper = mountSheet({ stage: 'content' }, { preview: '<p>Teaser</p>' })
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--preview')).toBe(true)
        expect(wrapper.emitted('update:stage')).toEqual([['preview']])
        await wrapper.setProps({ stage: 'fullscreen' })
        await wrapper.setProps({ stage: 'content' })
        expect(query('.ui-sheet').classList.contains('ui-sheet--fullscreen')).toBe(true)
        expect(wrapper.emitted('update:stage')?.at(-1)).toEqual(['fullscreen'])
    })

    it('reopens in the stage prop or the initial stage', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        query('.ui-sheet__handle').click()
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--fullscreen')).toBe(true)
        await wrapper.setProps({ modelValue: false })
        await vi.waitFor(() => {
            expect(wrapper.emitted('closed')).toHaveLength(1)
        })
        await wrapper.setProps({ modelValue: true })
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--content')).toBe(true)
        expect(wrapper.emitted('update:stage')?.at(-1)).toEqual(['content'])
        await wrapper.setProps({ modelValue: false })
        await vi.waitFor(() => {
            expect(wrapper.emitted('closed')).toHaveLength(2)
        })
        await wrapper.setProps({ stage: 'fullscreen', modelValue: true })
        await flushPromises()
        expect(query('.ui-sheet').classList.contains('ui-sheet--fullscreen')).toBe(true)
    })

    it('keeps the drag position while closing after a swipe dismiss', async () => {
        const wrapper = mountSheet({
            onClose: () => {
                void wrapper.setProps({ modelValue: false })
            },
        })
        await flushPromises()
        pointer('pointerdown', 100, query('.ui-sheet__handle'))
        now = 100
        pointer('pointermove', 400, window)
        pointer('pointerup', 400, window)
        await flushPromises()
        expect(wrapper.emitted('close')).toHaveLength(1)
        const sheet = query('.ui-sheet')
        expect(sheet.style.transform).toBe('translateY(300px)')
        expect(sheet.classList.contains('ui-sheet--dismissing')).toBe(true)
        await vi.waitFor(() => {
            expect(wrapper.emitted('closed')).toHaveLength(1)
        })
    })

    it('springs back when the parent keeps the sheet open after a swipe dismiss', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        pointer('pointerdown', 100, query('.ui-sheet__handle'))
        now = 100
        pointer('pointermove', 400, window)
        pointer('pointerup', 400, window)
        await flushPromises()
        expect(wrapper.emitted('close')).toHaveLength(1)
        expect(query('.ui-sheet').style.transform).toBe('')
        expect(query('.ui-sheet').classList.contains('ui-sheet--dismissing')).toBe(false)
    })

    it('applies the drag frame when the parent closes later after a swipe dismiss', async () => {
        const wrapper = mountSheet()
        await flushPromises()
        pointer('pointerdown', 100, query('.ui-sheet__handle'))
        now = 100
        pointer('pointermove', 400, window)
        pointer('pointerup', 400, window)
        await flushPromises()
        await new Promise(resolve => setTimeout(resolve, 20))
        expect(query('.ui-sheet').style.transform).toBe('')
        await wrapper.setProps({ modelValue: false })
        expect(query('.ui-sheet').style.transform).toBe('translateY(300px)')
        expect(query('.ui-sheet').classList.contains('ui-sheet--dismissing')).toBe(true)
    })

    it('closes through v-model alone on Escape', async () => {
        const open = ref(true)
        const Host = defineComponent({
            setup: () => () => h(UiBottomSheet, {
                'modelValue': open.value,
                'onUpdate:modelValue': (value: boolean) => {
                    open.value = value
                },
            }, { default: () => h('p', 'Body') }),
        })
        const wrapper = mountWithUiKit(Host)
        await flushPromises()
        pressEscape()
        await flushPromises()
        expect(open.value).toBe(false)
        await vi.waitFor(() => {
            expect(wrapper.findComponent(UiBottomSheet).emitted('closed')).toHaveLength(1)
        })
    })

    it('registers no window listener while rendering on the server', async () => {
        const spy = vi.spyOn(window, 'addEventListener')
        const app = createSSRApp({ render: () => h(UiBottomSheet, { modelValue: true, title: 'Sheet title' }, { default: () => h('p', 'Body') }) })
        app.use(createVuetify({ display: { mobileBreakpoint: 'sm' } }))
        app.use(createI18n({ legacy: false, locale: 'en', messages: { en: {} } }))
        app.use(createUIKit())
        await renderToString(app)
        const listeners = spy.mock.calls.filter(([type]) => type === 'resize').map(([, listener]) => (listener as { name?: string }).name)
        expect(listeners).not.toContain('measure')
    })
})

function mountTogglingPreview(stage?: SheetStage) {
    const show = ref(true)
    const stages: SheetStage[] = []
    const Host = defineComponent({
        setup() {
            return () => h(UiBottomSheet, {
                'modelValue': true,
                stage,
                'onUpdate:stage': (value: SheetStage) => {
                    stages.push(value)
                },
            }, show.value
                ? { preview: () => h('p', 'Teaser'), default: () => h('p', 'Body') }
                : { default: () => h('p', 'Body') })
        },
    })
    mountWithUiKit(Host)
    return { show, stages }
}
