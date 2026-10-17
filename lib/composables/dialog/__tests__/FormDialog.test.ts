import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { VBtn } from 'vuetify/components'
import useVuelidate from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import FormDialog from '@/composables/dialog/components/dialog/presets/FormDialog.vue'
import type { FormDialogProps } from '@/composables/dialog/presets/FormDialogProps'
import { useDialogForm } from '@/composables/dialog/useDialogForm'
import { mountDialogPreset, pressEscape } from '@/__tests__/helpers/mountDialogPreset'

function deferred<T>() {
    let resolve!: (value: T) => void
    const promise = new Promise<T>((done) => {
        resolve = done
    })
    return { promise, resolve }
}

function createContent(finish: () => unknown) {
    return defineComponent({
        setup() {
            const { submit, loading } = useDialogForm(finish)
            return () => h('div', [
                h('input', { class: 'content-input' }),
                h('button', { type: 'button', class: 'content-submit', onClick: () => { void submit() } }, loading.value ? 'busy' : 'go'),
            ])
        },
    })
}

function createNestedContent(finish: () => unknown) {
    const Inner = createContent(finish)
    return defineComponent({
        setup: () => () => h('section', [h(Inner)]),
    })
}

const ValidatedContent = defineComponent({
    setup() {
        const state = ref({ name: '' })
        const v = useVuelidate({ name: { required } }, state)
        useDialogForm(() => state.value.name)
        return () => h('input', {
            'class': 'content-input',
            'value': state.value.name,
            'data-invalid': String(v.value.$error),
            'onInput': (event: Event) => {
                state.value.name = (event.target as HTMLInputElement).value
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

describe('FormDialog', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('resolves the finish result after the save button', async () => {
        const { button, resolve } = mountForm({ component: createContent(() => 'Ada') })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Ada')
        })
    })

    it('submits through the form element, so Enter submits', async () => {
        const { form, resolve } = mountForm({ component: createContent(() => 'Ada') })
        await flushPromises()
        form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Ada')
        })
    })

    it('submits through the submit function returned by useDialogForm', async () => {
        const { resolve } = mountForm({ component: createContent(() => 'Ada') })
        await flushPromises()
        document.body.querySelector<HTMLButtonElement>('.content-submit')?.click()
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('Ada')
        })
    })

    it('registers finish from a nested child component', async () => {
        const { button, resolve } = mountForm({ component: createNestedContent(() => 'nested') })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('nested')
        })
    })

    it('passes the finish result through action and resolves with its result', async () => {
        const action = vi.fn((value: unknown) => Promise.resolve(`${String(value)}!`))
        const { button, resolve } = mountForm({ component: createContent(() => 'Ada'), action })
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
        const { button, resolve } = mountForm({ component: createContent(() => 'Ada'), action })
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
        const { button, resolve } = mountForm({ component: createContent(() => 'Ada'), action })
        await flushPromises()
        await button('action.save').trigger('click')
        await vi.waitFor(() => {
            expect(document.body.querySelector('.v-alert')?.textContent).toContain('error.unknown')
        })
        expect(document.body.querySelector('.v-alert')?.textContent).not.toContain('Unknown error')
        expect(resolve).not.toHaveBeenCalled()
    })

    it('ignores submit while loading', async () => {
        const pending = deferred<string>()
        const finish = vi.fn(() => pending.promise)
        const { button, resolve } = mountForm({ component: createContent(finish) })
        await flushPromises()
        await button('action.save').trigger('click')
        await button('action.save').trigger('click')
        document.body.querySelector<HTMLButtonElement>('.content-submit')?.click()
        await flushPromises()
        expect(finish).toHaveBeenCalledTimes(1)
        pending.resolve('late')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('late')
        })
    })

    it('disables cancel and the close icon while loading and ignores Escape', async () => {
        const pending = deferred<string>()
        const { button, closeButton, resolve } = mountForm({ component: createContent(() => pending.promise) })
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
        pending.resolve('done')
        await vi.waitFor(() => {
            expect(resolve).toHaveBeenCalledWith('done')
        })
    })

    it('ignores cancel while validation is still running and never saves after a close', async () => {
        const validator = deferred<boolean>()
        const finish = vi.fn(() => 'saved')
        const AsyncContent = defineComponent({
            setup() {
                const state = ref({ name: 'Ada' })
                useVuelidate({ name: { pending: helpers.withAsync(() => validator.promise) } }, state)
                useDialogForm(finish)
                return () => h('input', { class: 'content-input' })
            },
        })
        const { button, closeButton, resolve, reject } = mountForm({ component: AsyncContent })
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

    it('resolves null on cancel, or rejects with rejectOnEmpty', async () => {
        const first = mountForm({ component: createContent(() => 'x') })
        await flushPromises()
        await first.button('action.cancel').trigger('click')
        await vi.waitFor(() => {
            expect(first.resolve).toHaveBeenCalledWith(null)
        })
        first.wrapper.unmount()
        document.body.innerHTML = ''

        const second = mountForm({ component: createContent(() => 'x'), rejectOnEmpty: true })
        await flushPromises()
        await second.closeButton()?.trigger('click')
        await vi.waitFor(() => {
            expect(second.reject).toHaveBeenCalledTimes(1)
        })
        expect(second.resolve).not.toHaveBeenCalled()
    })

    it('focuses the first input after opening', async () => {
        mountForm({ component: createContent(() => 'x') })
        await vi.waitFor(() => {
            expect(document.activeElement?.classList.contains('content-input')).toBe(true)
        })
    })
})
