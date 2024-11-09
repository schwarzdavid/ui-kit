import type { Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'

export interface ConfirmDialogCta {
    text: string
    translateText?: boolean
}

export enum ConfirmDialogLevel {
    DEFAULT = 'primary',
    WARNING = 'warning',
    DANGER = 'error',
}

interface ConfirmDialogBaseProps {
    title: string
    translateTitle?: boolean
    confirmCta?: Partial<ConfirmDialogCta>
    rejectCta?: Partial<ConfirmDialogCta>
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

export interface ConfirmDialogComponentContent<C extends Component = Component> extends ConfirmDialogBaseProps {
    component: C
    props: ComponentProps<C>
}

export type ConfirmDialogProps<C extends Component = Component> = ConfirmDialogComponentContent<C> | ConfirmDialogTextContent
