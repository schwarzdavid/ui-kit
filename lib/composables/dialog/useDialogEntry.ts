import { hasInjectionContext, inject } from 'vue'
import { DIALOG_ENTRY_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
import type { DialogEntryContext } from '@/composables/dialog/types/DialogEntryContext'
import { Errors } from '@/plugin/constants/errors'

export function useDialogEntry<Data, Value = unknown>(): DialogEntryContext<Data, Value> {
    const context = hasInjectionContext() ? inject(DIALOG_ENTRY_INJECTION_KEY, null) : null
    if (!context) {
        throw new Error(Errors.DIALOG_ENTRY_CONTEXT_MISSING)
    }
    return context as DialogEntryContext<Data, Value>
}
