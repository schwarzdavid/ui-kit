import type { Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { DialogProps } from '@/composables/dialog/types/DialogProps'
import type { DialogWidth } from '@/composables/dialog/types/DialogWidth'

export type FormDialogAction<T, R> = (value: T) => Promise<R>

export type FormDialogProps<
    R,
    T = R,
    RejectOnEmpty extends boolean = false,
    C extends Component = Component,
> = DialogProps<ComponentProps<C>> & {
    title: string
    translateTitle?: boolean
    width?: DialogWidth
    saveCta?: Partial<DialogCta>
    abortCta?: Partial<DialogCta>
    component: C
    action?: FormDialogAction<T, R>
    rejectOnEmpty?: RejectOnEmpty
}
