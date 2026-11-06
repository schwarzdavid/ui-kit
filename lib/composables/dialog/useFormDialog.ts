import { getCurrentScope, hasInjectionContext, inject, onScopeDispose } from 'vue'
import { FORM_DIALOG_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
import type { FormDialogContext, FormDialogFinishHandler } from '@/composables/dialog/types/FormDialogContext'
import { Errors } from '@/plugin/constants/errors'

export function useFormDialog(): FormDialogContext {
    const provider = hasInjectionContext() ? inject(FORM_DIALOG_INJECTION_KEY, null) : null
    if (!provider) {
        throw new Error(Errors.FORM_DIALOG_CONTEXT_MISSING)
    }
    const context = provider

    function onFinish(handler: FormDialogFinishHandler): () => void {
        const remove = context.addFinishHandler(handler)
        if (getCurrentScope()) {
            onScopeDispose(remove)
        }
        return remove
    }

    return { submit: context.submit, close: context.close, onFinish, loading: context.loading }
}
