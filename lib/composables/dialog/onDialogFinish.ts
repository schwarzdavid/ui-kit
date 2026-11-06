import type { FormDialogFinishHandler } from '@/composables/dialog/types/FormDialogContext'
import { useFormDialog } from '@/composables/dialog/useFormDialog'

export function onDialogFinish(handler: FormDialogFinishHandler): () => void {
    return useFormDialog().onFinish(handler)
}
