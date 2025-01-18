import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { ComponentPublicInstance } from 'vue'

export interface FormDialogComponentProps {
    loading: boolean
}

export interface FormDialogComponentExposed<T> {
    finish(): Promise<T>
}

export type FormDialogComponent<T> = new() => ComponentPublicInstance<FormDialogComponentProps> & FormDialogComponentExposed<T>

export interface FormDialogProps<T, C extends FormDialogComponent<T> = FormDialogComponent<T>> {
    title: string
    translateTitle?: string
    saveCta?: Partial<DialogCta>
    abortCta?: Partial<DialogCta>
    component: C
}
