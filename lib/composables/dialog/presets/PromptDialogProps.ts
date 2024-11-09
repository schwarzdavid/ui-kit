import type {
    ComponentOptionsMixin,
    ComponentPublicInstance,
    ComputedOptions,
    MaybeRefOrGetter,
    MethodOptions,
} from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PromptDialogCta {
    text: string
    translateText?: boolean
}

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

export interface PromptDialogProps<
    T,
    R extends boolean = false,
    C extends PromptDialogComponent<T> = PromptDialogComponent<T>,
> {
    title: string
    translateTitle?: boolean
    saveCta?: Partial<PromptDialogCta>
    abortCta?: Partial<PromptDialogCta>
    initialValue?: MaybeRefOrGetter<T>
    size?: PromptDialogSize
    required?: R
    component: C
    props: Omit<ComponentProps<C>, keyof PromptDialogComponentProps<T>>
}
