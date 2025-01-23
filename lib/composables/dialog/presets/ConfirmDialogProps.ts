import type { Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { DialogProps } from '@/composables/dialog/types/DialogProps'

export enum ConfirmDialogLevel {
    DEFAULT = 'primary',
    WARNING = 'warning',
    DANGER = 'error',
}

interface ConfirmDialogBaseProps {
    title: string
    translateTitle?: boolean
    confirmCta?: Partial<DialogCta>
    rejectCta?: Partial<DialogCta>
    throwOnReject?: boolean
    permanent?: boolean
    maxWidth?: number | string
    highlightCta?: 'confirm' | 'reject' | false
    level?: ConfirmDialogLevel
}

export interface ConfirmDialogTextContent extends ConfirmDialogBaseProps {
    content: string
    translateContent?: boolean
}

export type ConfirmDialogComponentContent<C extends Component = Component> = DialogProps<ComponentProps<C>> & ConfirmDialogBaseProps & {
    component: C
}

export type ConfirmDialogProps<C extends Component = Component> = ConfirmDialogComponentContent<C> | ConfirmDialogTextContent
