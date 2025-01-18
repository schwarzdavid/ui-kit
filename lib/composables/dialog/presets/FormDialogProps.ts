import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { ComponentPublicInstance } from 'vue'

/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line
export interface FormDialogComponentProps<T> {
}

export type FormDialogComponent<T> = ComponentPublicInstance<FormDialogComponentProps<T>, any, any, any, any, any, any, any>

export interface FormDialogProps<T> {
    title: string
    translateTitle: string
    saveCta?: Partial<DialogCta>
    abortCta?: Partial<DialogCta>
    component: FormDialogComponent<T>
}
