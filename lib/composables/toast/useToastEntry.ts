import { hasInjectionContext, inject } from 'vue'
import { TOAST_ENTRY_INJECTION_KEY } from '@/composables/toast/constants/injectionKey'
import type { ToastEntryContext } from '@/composables/toast/types/ToastEntryContext'
import { Errors } from '@/plugin/constants/errors'

export function useToastEntry(): ToastEntryContext {
    const context = hasInjectionContext() ? inject(TOAST_ENTRY_INJECTION_KEY, null) : null
    if (!context) {
        throw new Error(Errors.TOAST_ENTRY_CONTEXT_MISSING)
    }
    return context
}
