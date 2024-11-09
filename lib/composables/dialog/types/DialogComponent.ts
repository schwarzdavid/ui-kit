import type { ComponentOptionsMixin, ComponentPublicInstance, ComputedOptions, MethodOptions } from 'vue'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DialogComponentEmits<T> {
    (name: 'resolve', value: T): unknown
    (name: 'reject', reason?: Error | string): unknown
}

export type DialogComponent<T> = ComponentPublicInstance<
    object,
    any,
    any,
    ComputedOptions,
    MethodOptions,
    ComponentOptionsMixin,
    ComponentOptionsMixin,
    DialogComponentEmits<T>
>
