import { vi } from 'vitest'
import { type Component, defineComponent, h, provide } from 'vue'
import { DIALOG_ENTRY_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
import type { DialogEntryContext } from '@/composables/dialog/types/DialogEntryContext'
import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'
import { mountWithUiKit } from '@/__tests__/helpers/mountWithUiKit'

export function mountDialogPreset(preset: Component, data: unknown, uiKit?: CreateUIKitOptions) {
    const resolve = vi.fn<(value: unknown) => void>()
    const reject = vi.fn<(reason?: unknown) => void>()
    const context: DialogEntryContext = { id: 'test-entry', data, resolve, reject }
    const Host = defineComponent({
        setup() {
            provide<DialogEntryContext>(DIALOG_ENTRY_INJECTION_KEY, context)
            return () => h(preset)
        },
    })
    const wrapper = mountWithUiKit(Host, { uiKit })
    return { wrapper, resolve, reject }
}

export function overlayContent(): HTMLElement {
    const content = document.body.querySelector<HTMLElement>('.v-overlay__content')
    if (!content) {
        throw new Error('overlay content not rendered')
    }
    return content
}

export function pressEscape(): void {
    overlayContent().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}
