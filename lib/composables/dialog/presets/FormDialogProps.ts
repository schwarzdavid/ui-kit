import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { ComponentPublicInstance, EmitFn, ShortEmitsToObject } from 'vue'

export interface FormDialogComponentProps {
    loading: boolean
}

export type InternalFormDialogComponentEmits = Record<string, unknown[]> & {
    'update:loading': [boolean]
}

export type FormDialogAction<T, R> = (value: T) => Promise<R>

export interface FormDialogComponentExposed<R, T = R> {
    finish(): Promise<T>
}

export type FormDialogComponent<T> = new() => ComponentPublicInstance<FormDialogComponentProps> & FormDialogComponentExposed<T> & { $emit: EmitFn<ShortEmitsToObject<InternalFormDialogComponentEmits>> }

export interface FormDialogProps<R, T = R> {
    title: string
    translateTitle?: string
    saveCta?: Partial<DialogCta>
    abortCta?: Partial<DialogCta>
    component: FormDialogComponent<R>
    action?: FormDialogAction<R, T>
}
