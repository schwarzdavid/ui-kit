import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { ComponentPublicInstance, EmitFn } from 'vue'

export interface FormDialogComponentProps {
    loading: boolean
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type FormDialogComponentEmits = {
    'update:loading': [boolean]
}

export type FormDialogAction<T, R> = (value: T) => Promise<R>

export interface FormDialogComponentExposed<R, T = R> {
    finish(): Promise<T>
}

export type FormDialogComponent<T> = new() => Omit<ComponentPublicInstance<FormDialogComponentProps>, '$emit'> & FormDialogComponentExposed<T> & {
    $emit: EmitFn<FormDialogComponentEmits>
}

export interface FormDialogProps<R, T = R> {
    title: string
    translateTitle?: string
    saveCta?: Partial<DialogCta>
    abortCta?: Partial<DialogCta>
    component: FormDialogComponent<R>
    action?: FormDialogAction<R, T>
}
