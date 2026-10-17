import type { Ref } from 'vue'
import type { Promisable } from 'type-fest'

export type DialogFormFinish<T> = () => Promisable<T>

export interface DialogFormContext {
    submit(): Promise<void>
    loading: Readonly<Ref<boolean>>
}

export interface DialogFormProvider extends DialogFormContext {
    register(finish: DialogFormFinish<unknown>): void
}
