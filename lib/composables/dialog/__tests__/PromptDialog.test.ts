import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type PropType } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { VBtn } from 'vuetify/components'
import PromptDialog from '@/composables/dialog/components/dialog/presets/PromptDialog.vue'
import type { PromptDialogComponent, PromptDialogProps } from '@/composables/dialog/presets/PromptDialogProps'
import { mountDialogPreset, overlayContent } from '@/__tests__/helpers/mountDialogPreset'

const Content = defineComponent({
    props: {
        modelValue: { type: String as PropType<string | null>, default: null },
        toolbar: { type: Object as PropType<HTMLElement>, required: true },
        label: { type: String, required: true },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        return () => h('input', {
            'class': 'content-input',
            'value': props.modelValue ?? '',
            'data-label': props.label,
            'data-toolbar': props.toolbar.className,
            'onInput': (event: Event) => {
                emit('update:modelValue', (event.target as HTMLInputElement).value)
            },
        })
    },
})

type Data = PromptDialogProps<string, boolean>

function mountPrompt(overrides: Partial<Data> = {}) {
    const data = {
        title: 'Rename',
        component: Content as PromptDialogComponent<string>,
        props: { label: 'Name' },
        initialValue: 'initial',
        ...overrides,
    } as Data
    const mounted = mountDialogPreset(PromptDialog, data)
    const button = (text: string) => {
        const found = mounted.wrapper.findAllComponents(VBtn).find(candidate => candidate.text() === text)
        if (!found) {
            throw new Error(`no button with text ${text}`)
        }
        return found
    }
    const input = () => {
        const element = document.body.querySelector<HTMLInputElement>('.content-input')
        if (!element) {
            throw new Error('content input not rendered')
        }
        return element
    }
    const type = (value: string) => {
        input().value = value
        input().dispatchEvent(new Event('input', { bubbles: true }))
    }
    return { ...mounted, button, input, type }
}

describe('PromptDialog', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('passes props, the initial value and the toolbar element to the content component', async () => {
        const { input } = mountPrompt()
        await flushPromises()
        expect(input().value).toBe('initial')
        expect(input().dataset.label).toBe('Name')
        expect(input().dataset.toolbar).toBe('ui-dialog__toolbar')
    })

    it('resolves the edited value after save', async () => {
        const { button, type, resolve } = mountPrompt()
        await flushPromises()
        type('renamed')
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('renamed')
        })
    })

    it('resolves the initial value after cancel', async () => {
        const { button, type, resolve } = mountPrompt()
        await flushPromises()
        type('renamed')
        await flushPromises()
        await button('action.cancel').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('initial')
        })
    })

    it('disables save while a required value is empty and rejects on cancel', async () => {
        const { button, resolve, reject } = mountPrompt({ initialValue: undefined, required: true })
        await flushPromises()
        expect(button('action.save').attributes('disabled')).toBeDefined()
        await button('action.cancel').trigger('click')
        await vi.waitFor(() => {
            expect(reject).toHaveBeenCalledTimes(1)
        })
        expect(resolve).not.toHaveBeenCalled()
    })

    it('enables save once a required value is set', async () => {
        const { button, type, resolve } = mountPrompt({ initialValue: undefined, required: true })
        await flushPromises()
        type('value')
        await flushPromises()
        expect(button('action.save').attributes('disabled')).toBeUndefined()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('value')
        })
    })

    it('uses the md width by default and goes fullscreen on phones', async () => {
        const first = mountPrompt()
        await flushPromises()
        expect(overlayContent().style.maxWidth).toBe('560px')
        first.wrapper.unmount()
        document.body.innerHTML = ''

        const originalWidth = window.innerWidth
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 })
        try {
            mountPrompt()
            await flushPromises()
            expect(document.body.querySelector('.ui-dialog--fullscreen')).not.toBeNull()
        } finally {
            Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
        }
    })

    it('closes with the initial value from the close icon', async () => {
        const { wrapper, resolve } = mountPrompt()
        await flushPromises()
        const close = wrapper.findAllComponents(VBtn).find(button => button.classes('ui-dialog__close'))
        await close?.trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('initial')
        })
    })

    it('focuses the first input after opening', async () => {
        const { input } = mountPrompt()
        await vi.waitFor(() => {
            expect(document.activeElement).toBe(input())
        })
    })
})
