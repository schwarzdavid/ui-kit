import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, onMounted, type PropType, ref, Teleport } from 'vue'
import { enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { VBtn } from 'vuetify/components'
import useVuelidate from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import FormDialog from '@/composables/dialog/components/dialog/presets/FormDialog.vue'
import type { FormDialogProps } from '@/composables/dialog/presets/FormDialogProps'
import { useFormDialog } from '@/composables/dialog/useFormDialog'
import { onDialogFinish } from '@/composables/dialog/onDialogFinish'
import type { FormDialogFinishHandler } from '@/composables/dialog/types/FormDialogContext'
import { mountDialogPreset, overlayContent, pressEscape } from '@/__tests__/helpers/mountDialogPreset'
import { withViewportWidth } from '@/__tests__/helpers/withViewportWidth'

function deferred<T>() {
    let resolve!: (value: T) => void
    const promise = new Promise<T>((done) => {
        resolve = done
    })
    return { promise, resolve }
}

function createContent(handler?: FormDialogFinishHandler) {
    return defineComponent({
        props: {
            modelValue: { type: String as PropType<string | null>, default: null },
        },
        setup() {
            const { submit, loading, onFinish } = useFormDialog()
            if (handler) {
                onFinish(handler)
            }
            return () => h('div', [
                h('input', { class: 'content-input' }),
                h('button', { type: 'button', class: 'content-submit', onClick: () => { void submit() } }, loading.value ? 'busy' : 'go'),
            ])
        },
    })
}

function createNestedHandlerContent(handler: FormDialogFinishHandler) {
    const Inner = defineComponent({
        setup() {
            onDialogFinish(handler)
            return () => h('span')
        },
    })
    return defineComponent({
        props: {
            modelValue: { type: String as PropType<string | null>, default: null },
        },
        setup: () => () => h('section', [h(Inner)]),
    })
}

const ValidatedContent = defineComponent({
    props: {
        modelValue: { type: String as PropType<string | null>, default: null },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const name = computed({
            get: () => props.modelValue ?? '',
            set: (value: string) => {
                emit('update:modelValue', value)
            },
        })
        const v = useVuelidate({ name: { required } }, { name })
        return () => h('input', {
            'class': 'content-input',
            'value': name.value,
            'data-invalid': String(v.value.$error),
            'onInput': (event: Event) => {
                name.value = (event.target as HTMLInputElement).value
            },
        })
    },
})

type Data = FormDialogProps<unknown, unknown, boolean>

function mountForm(data: Partial<Data> & Pick<Data, 'component'>) {
    const mounted = mountDialogPreset(FormDialog, { title: 'Create', ...data }, { loading: { delay: false } })
    const button = (text: string) => {
        const found = mounted.wrapper.findAllComponents(VBtn).find(candidate => candidate.text() === text)
        if (!found) {
            throw new Error(`no button with text ${text}`)
        }
        return found
    }
    const closeButton = () => mounted.wrapper.findAllComponents(VBtn).find(candidate => candidate.classes('ui-dialog__close'))
    const form = () => {
        const element = document.body.querySelector<HTMLFormElement>('form.ui-dialog__layout')
        if (!element) {
            throw new Error('form not rendered')
        }
        return element
    }
    return { ...mounted, button, closeButton, form }
}

enableAutoUnmount(afterEach)

describe('FormDialog', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('resolves the model value after the save button', async () => {
        const { button, resolve } = mountForm({ component: createContent(), initialValue: 'Ada' })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Ada')
        })
    })

    it('submits through the form element, so Enter submits', async () => {
        const { form, resolve } = mountForm({ component: createContent(), initialValue: 'Ada' })
        await flushPromises()
        form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Ada')
        })
    })

    it('submits through the submit function returned by useFormDialog', async () => {
        const { resolve } = mountForm({ component: createContent(), initialValue: 'Ada' })
        await flushPromises()
        document.body.querySelector<HTMLButtonElement>('.content-submit')?.click()
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Ada')
        })
    })

    it('runs onDialogFinish handlers registered in a nested child component', async () => {
        const handler = vi.fn(() => true)
        const { button, resolve } = mountForm({ component: createNestedHandlerContent(handler), initialValue: 'nested' })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('nested')
        })
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('runs onFinish and onDialogFinish handlers in order before action', async () => {
        const calls: string[] = []
        const action = vi.fn((value: unknown) => {
            calls.push('action')
            return Promise.resolve(value)
        })
        const Content = defineComponent({
            props: {
                modelValue: { type: String as PropType<string | null>, default: null },
            },
            setup() {
                const { onFinish } = useFormDialog()
                onFinish(async () => {
                    await Promise.resolve()
                    calls.push('first')
                })
                onDialogFinish(() => {
                    calls.push('second')
                    return true
                })
                return () => h('input', { class: 'content-input' })
            },
        })
        const { button, resolve } = mountForm({ component: Content, initialValue: 'Ada', action })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Ada')
        })
        expect(calls).toEqual(['first', 'second', 'action'])
    })

    it('keeps the dialog open and skips the save when an onFinish handler returns false', async () => {
        let allow = false
        const action = vi.fn((value: unknown) => Promise.resolve(value))
        const { button, resolve } = mountForm({ component: createContent(() => Promise.resolve(allow)), initialValue: 'Ada', action })
        await flushPromises()
        await button('action.save').trigger('click')
        await flushPromises()
        expect(action).not.toHaveBeenCalled()
        expect(resolve).not.toHaveBeenCalled()
        expect(document.body.querySelector('.ui-dialog')).not.toBeNull()
        expect(document.body.querySelector('.v-alert')).toBeNull()
        allow = true
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Ada')
        })
    })

    it('shows the error when an onFinish handler throws', async () => {
        const content = createContent(() => {
            throw new Error('Not yet')
        })
        const { button, resolve } = mountForm({ component: content, initialValue: 'Ada' })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(document.body.querySelector('.v-alert')?.textContent).toContain('Not yet')
        })
        expect(resolve).not.toHaveBeenCalled()
    })

    it('closes like cancel through the close function returned by useFormDialog', async () => {
        const Content = defineComponent({
            setup() {
                const { close } = useFormDialog()
                return () => h('button', { type: 'button', class: 'content-close', onClick: close }, 'close')
            },
        })
        const { resolve } = mountForm({ component: Content, initialValue: 'initial' })
        await flushPromises()
        document.body.querySelector<HTMLButtonElement>('.content-close')?.click()
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith(null)
        })
    })

    it('passes the model value through action and resolves with its result', async () => {
        const action = vi.fn((value: unknown) => Promise.resolve(`${String(value)}!`))
        const { button, resolve } = mountForm({ component: createContent(), initialValue: 'Ada', action })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Ada!')
        })
        expect(action).toHaveBeenCalledWith('Ada')
    })

    it('keeps the dialog open and shows the error when action throws', async () => {
        const action = vi.fn(async () => {
            await Promise.resolve()
            throw new Error('Server said no')
        })
        const { button, resolve } = mountForm({ component: createContent(), initialValue: 'Ada', action })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(document.body.querySelector('.v-alert')?.textContent).toContain('Server said no')
        })
        expect(document.body.querySelector('.v-alert')?.textContent).toContain('dialog.saveFailed')
        expect(resolve).not.toHaveBeenCalled()
        expect(document.body.querySelector('.ui-dialog')).not.toBeNull()
    })

    it('shows the translatable unknown-error message when action rejects with a value that has no message', async () => {
        const reason: unknown = 42
        const action = vi.fn(async () => {
            await Promise.resolve()
            throw reason
        })
        const { button, resolve } = mountForm({ component: createContent(), initialValue: 'Ada', action })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(document.body.querySelector('.v-alert')?.textContent).toContain('error.unknown')
        })
        expect(document.body.querySelector('.v-alert')?.textContent).not.toContain('Unknown error')
        expect(resolve).not.toHaveBeenCalled()
    })

    it('ignores submit while loading', async () => {
        const pending = deferred<boolean>()
        const handler = vi.fn(() => pending.promise)
        const { button, resolve } = mountForm({ component: createContent(handler), initialValue: 'late' })
        await flushPromises()
        await button('action.save').trigger('click')
        await button('action.save').trigger('click')
        document.body.querySelector<HTMLButtonElement>('.content-submit')?.click()
        await flushPromises()
        expect(handler).toHaveBeenCalledTimes(1)
        pending.resolve(true)
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('late')
        })
    })

    it('disables cancel and the close icon while loading and ignores Escape', async () => {
        const pending = deferred<boolean>()
        const { button, closeButton, resolve } = mountForm({ component: createContent(() => pending.promise), initialValue: 'done' })
        await flushPromises()
        await button('action.save').trigger('click')
        await flushPromises()
        expect(button('action.cancel').attributes('disabled')).toBeDefined()
        expect(closeButton()?.attributes('disabled')).toBeDefined()
        expect(document.body.querySelector('.content-submit')?.textContent).toBe('busy')
        pressEscape()
        await button('action.cancel').trigger('click')
        await flushPromises()
        expect(resolve).not.toHaveBeenCalled()
        pending.resolve(true)
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('done')
        })
    })

    it('ignores cancel while validation is still running and never saves after a close', async () => {
        const validator = deferred<boolean>()
        const finish = vi.fn(() => true)
        const AsyncContent = defineComponent({
            props: {
                modelValue: { type: String as PropType<string | null>, default: null },
            },
            setup() {
                const state = ref({ name: 'Ada' })
                useVuelidate({ name: { pending: helpers.withAsync(() => validator.promise) } }, state)
                onDialogFinish(finish)
                return () => h('input', { class: 'content-input' })
            },
        })
        const { button, closeButton, resolve, reject } = mountForm({ component: AsyncContent, initialValue: 'saved' })
        await flushPromises()
        await button('action.save').trigger('click')
        await flushPromises()
        await button('action.cancel').trigger('click')
        pressEscape()
        await flushPromises()
        expect(resolve).not.toHaveBeenCalled()
        expect(reject).not.toHaveBeenCalled()
        expect(closeButton()?.attributes('disabled')).toBeDefined()
        expect(finish).not.toHaveBeenCalled()
        validator.resolve(true)
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('saved')
        })
        expect(finish).toHaveBeenCalledTimes(1)
    })

    it('does not submit while the form is invalid', async () => {
        const { button, resolve } = mountForm({ component: ValidatedContent })
        await flushPromises()
        await button('action.save').trigger('click')
        await flushPromises()
        expect(resolve).not.toHaveBeenCalled()
        expect(document.body.querySelector<HTMLInputElement>('.content-input')?.dataset.invalid).toBe('true')
        const input = document.body.querySelector<HTMLInputElement>('.content-input')
        if (input) {
            input.value = 'Grace'
            input.dispatchEvent(new Event('input', { bubbles: true }))
        }
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Grace')
        })
    })

    it('resolves null on cancel, or rejects when required', async () => {
        const first = mountForm({ component: createContent(), initialValue: 'x' })
        await flushPromises()
        await first.button('action.cancel').trigger('click')
        await vi.waitFor(() => {
            expect(first.resolve).toHaveBeenCalledWith(null)
        })
        first.wrapper.unmount()
        document.body.innerHTML = ''

        const second = mountForm({ component: createContent(), initialValue: 'x', required: true })
        await flushPromises()
        await second.closeButton()?.trigger('click')
        await vi.waitFor(() => {
            expect(second.reject).toHaveBeenCalledTimes(1)
        })
        expect(second.resolve).not.toHaveBeenCalled()
    })

    it('focuses the first input after opening', async () => {
        mountForm({ component: createContent(), initialValue: 'x' })
        await vi.waitFor(() => {
            expect(document.activeElement?.classList.contains('content-input')).toBe(true)
        })
    })

    it('keeps local state of registered content when the viewport crosses the breakpoint', async () => {
        let mounts = 0
        const LocalContent = defineComponent({
            setup() {
                const name = ref('')
                useFormDialog()
                onMounted(() => {
                    mounts++
                })
                return () => h('input', {
                    class: 'content-input',
                    value: name.value,
                    onInput: (event: Event) => {
                        name.value = (event.target as HTMLInputElement).value
                    },
                })
            },
        })
        const input = () => {
            const element = document.body.querySelector<HTMLInputElement>('.content-input')
            if (!element) {
                throw new Error('content input not rendered')
            }
            return element
        }
        await withViewportWidth(1024, async () => {
            const { resolve, reject } = mountForm({ component: LocalContent })
            await flushPromises()
            input().value = 'abc'
            input().dispatchEvent(new Event('input', { bubbles: true }))
            await flushPromises()
            await withViewportWidth(360, async () => {
                await flushPromises()
                expect(document.body.querySelector('.ui-sheet')).not.toBeNull()
                expect(input().value).toBe('abc')
                expect(mounts).toBe(1)
                expect(resolve).not.toHaveBeenCalled()
                expect(reject).not.toHaveBeenCalled()
            })
            await flushPromises()
            expect(document.body.querySelector('.ui-dialog')).not.toBeNull()
            expect(input().value).toBe('abc')
            expect(mounts).toBe(1)
        })
    })
})

const ModelContent = defineComponent({
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

describe('FormDialog with a v-model component', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    function mountModel(overrides: Partial<Data> = {}) {
        const mounted = mountForm({ component: ModelContent, props: { label: 'Name' }, initialValue: 'initial', ...overrides })
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
        return { ...mounted, input, type }
    }

    it('passes props, the initial value and the toolbar element to the component', async () => {
        const { input } = mountModel()
        await flushPromises()
        expect(input().value).toBe('initial')
        expect(input().dataset.label).toBe('Name')
        expect(input().dataset.toolbar).toBe('ui-dialog__toolbar')
    })

    it('resolves the edited value after save', async () => {
        const { button, type, resolve } = mountModel()
        await flushPromises()
        type('renamed')
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('renamed')
        })
    })

    it('passes the model value through action', async () => {
        const action = vi.fn((value: unknown) => Promise.resolve(`${String(value)}!`))
        const { button, resolve } = mountModel({ action })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('initial!')
        })
        expect(action).toHaveBeenCalledWith('initial')
    })

    it('resolves null after cancel instead of the initial value', async () => {
        const { button, type, resolve } = mountModel()
        await flushPromises()
        type('renamed')
        await flushPromises()
        await button('action.cancel').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith(null)
        })
    })

    it('disables save while a required value is empty, ignores Enter and rejects on cancel', async () => {
        const { button, form, resolve, reject } = mountModel({ initialValue: undefined, required: true })
        await flushPromises()
        expect(button('action.save').attributes('disabled')).toBeDefined()
        form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        await flushPromises()
        expect(resolve).not.toHaveBeenCalled()
        await button('action.cancel').trigger('click')
        await vi.waitFor(() => {
            expect(reject).toHaveBeenCalledTimes(1)
        })
        expect(resolve).not.toHaveBeenCalled()
    })

    it('enables save once a required value is set', async () => {
        const { button, type, resolve } = mountModel({ initialValue: undefined, required: true })
        await flushPromises()
        type('value')
        await flushPromises()
        expect(button('action.save').attributes('disabled')).toBeUndefined()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('value')
        })
    })

    it('does not pass modelValue and toolbar to components that do not declare them', async () => {
        const PlainContent = defineComponent({
            setup: () => () => h('div', [h('input', { class: 'content-input' })]),
        })
        mountForm({ component: PlainContent, initialValue: 'initial' })
        await flushPromises()
        const root = document.body.querySelector('.ui-dialog__content > div')
        expect(root?.hasAttribute('modelvalue')).toBe(false)
        expect(root?.hasAttribute('toolbar')).toBe(false)
    })

    it('uses the md width by default and opens as a bottom sheet on phones', async () => {
        const first = mountModel()
        await flushPromises()
        expect(overlayContent().style.maxWidth).toBe('560px')
        first.wrapper.unmount()
        document.body.innerHTML = ''

        await withViewportWidth(360, async () => {
            mountModel()
            await flushPromises()
            expect(document.body.querySelector('.ui-sheet--content')).not.toBeNull()
            expect(document.body.querySelector('.ui-sheet--fullscreen')).toBeNull()
        })
    })

    it('moves the toolbar teleport into the new header when the viewport crosses the breakpoint', async () => {
        let mounts = 0
        const ToolbarContent = defineComponent({
            props: {
                toolbar: { type: Object as PropType<HTMLElement>, required: true },
            },
            setup(props) {
                onMounted(() => {
                    mounts++
                })
                return () => h('div', [
                    h(Teleport, { to: props.toolbar }, [h('button', { type: 'button', class: 'tool' }, 'Tool')]),
                    h('input', { class: 'content-input' }),
                ])
            },
        })
        await withViewportWidth(1024, async () => {
            mountForm({ component: ToolbarContent })
            await flushPromises()
            expect(document.body.querySelector('.ui-dialog__header .ui-dialog__toolbar .tool')).not.toBeNull()
            await withViewportWidth(360, async () => {
                await flushPromises()
                expect(document.body.querySelector('.ui-sheet__header .ui-dialog__toolbar .tool')).not.toBeNull()
                expect(mounts).toBe(1)
            })
        })
    })

    it('keeps the typed value when the viewport crosses the breakpoint', async () => {
        await withViewportWidth(1024, async () => {
            const { type, input, resolve, reject } = mountModel()
            await flushPromises()
            type('abc')
            await flushPromises()
            await withViewportWidth(360, async () => {
                await flushPromises()
                expect(document.body.querySelector('.ui-sheet')).not.toBeNull()
                expect(input().value).toBe('abc')
                expect(resolve).not.toHaveBeenCalled()
                expect(reject).not.toHaveBeenCalled()
            })
        })
    })
})
