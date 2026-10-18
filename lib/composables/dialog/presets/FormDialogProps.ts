import type { Component, MaybeRefOrGetter } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { DialogProps } from '@/composables/dialog/types/DialogProps'
import type { DialogWidth } from '@/composables/dialog/types/DialogWidth'

export type FormDialogAction<T, R> = (value: T) => Promise<R>

export type FormDialogInjectedProp = 'modelValue' | 'onUpdate:modelValue' | 'toolbar'

export interface FormDialogBaseProps<
    T,
    R = T,
    Required extends boolean = false,
    C extends Component = Component,
> {
    title: string
    translateTitle?: boolean
    width?: DialogWidth
    saveCta?: Partial<DialogCta>
    abortCta?: Partial<DialogCta>
    component: C
    initialValue?: MaybeRefOrGetter<T>
    action?: FormDialogAction<T, R>
    required?: Required
}

type FormDialogModelCheck<T, C extends Component> = unknown extends T
    ? unknown
    : 'modelValue' extends keyof ComponentProps<C>
        ? [T] extends [NonNullable<ComponentProps<C>['modelValue']>] ? unknown : { component: never }
        : unknown

export type FormDialogProps<
    T,
    R = T,
    Required extends boolean = false,
    C extends Component = Component,
> = DialogProps<Omit<ComponentProps<C>, FormDialogInjectedProp>> & FormDialogModelCheck<T, C> & FormDialogBaseProps<T, R, Required, C>
