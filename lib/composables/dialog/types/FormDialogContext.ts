import type { Ref } from 'vue'
import type { Promisable } from 'type-fest'

export type FormDialogFinishHandler = () => Promisable<boolean | undefined>

export interface FormDialogContext {
    submit(): Promise<void>
    close(): void
    onFinish(handler: FormDialogFinishHandler): () => void
    loading: Readonly<Ref<boolean>>
}

export interface FormDialogProvider {
    addFinishHandler(handler: FormDialogFinishHandler): () => void
    submit(): Promise<void>
    close(): void
    loading: Readonly<Ref<boolean>>
}
