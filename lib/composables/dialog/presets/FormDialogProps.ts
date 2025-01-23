import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { ComponentPublicInstance, EmitFn } from 'vue'
import type { Promisable } from 'type-fest'
import type { ComponentProps } from 'vue-component-type-helpers'
import type { DialogProps } from '@/composables/dialog/types/DialogProps'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type FormDialogComponentEmits = {
    save: []
}

export type FormDialogAction<T, R> = (value: T) => Promise<R>

export interface FormDialogComponentExposed<T> {
    finish(): Promisable<T>
}

export type FormDialogComponent<T> = new() => Omit<ComponentPublicInstance, '$emit'> & FormDialogComponentExposed<T> & {
    $emit: EmitFn<FormDialogComponentEmits>
}

export type FormDialogProps<
    R,
    T = R,
    C extends FormDialogComponent<T> = FormDialogComponent<T>,
    P extends object = ComponentProps<C>,
> = DialogProps<P> & {
    title: string
    translateTitle?: string
    saveCta?: Partial<DialogCta>
    abortCta?: Partial<DialogCta>
    component: C
    action?: FormDialogAction<T, R>
}
