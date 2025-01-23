import type {
    ComponentOptionsMixin,
    ComponentPublicInstance,
    ComputedOptions,
    MaybeRefOrGetter,
    MethodOptions,
} from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { DialogProps } from '@/composables/dialog/types/DialogProps'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PromptDialogComponentProps<T> {
    modelValue: T | null
    toolbar: HTMLElement
}

export type PromptDialogComponentEmits<T> = (name: 'update:modelValue', value: T | null) => unknown

export type PromptDialogComponent<T> = ComponentPublicInstance<
    PromptDialogComponentProps<T>,
    any,
    any,
    ComputedOptions,
    MethodOptions,
    ComponentOptionsMixin,
    ComponentOptionsMixin,
    PromptDialogComponentEmits<T>
>

export enum PromptDialogSize {
    SMALL = 'sm',
    LARGE = 'lg',
}

export type PromptDialogProps<
    T,
    R extends boolean = false,
    C extends PromptDialogComponent<T> = PromptDialogComponent<T>,
> = DialogProps<Omit<ComponentProps<C>, keyof PromptDialogComponentProps<T>>> & {
    title: string
    translateTitle?: boolean
    saveCta?: Partial<DialogCta>
    abortCta?: Partial<DialogCta>
    initialValue?: MaybeRefOrGetter<T>
    size?: PromptDialogSize
    required?: R
    component: C
}
