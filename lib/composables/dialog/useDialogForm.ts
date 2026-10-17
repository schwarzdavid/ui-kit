import { hasInjectionContext, inject } from 'vue'
import { DIALOG_FORM_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
import type { DialogFormContext, DialogFormFinish } from '@/composables/dialog/types/DialogFormContext'
import { Errors } from '@/plugin/constants/errors'

export function useDialogForm<T>(finish: DialogFormFinish<T>): DialogFormContext {
    const provider = hasInjectionContext() ? inject(DIALOG_FORM_INJECTION_KEY, null) : null
    if (!provider) {
        throw new Error(Errors.DIALOG_FORM_CONTEXT_MISSING)
    }
    provider.register(finish)
    return { submit: provider.submit, loading: provider.loading }
}
