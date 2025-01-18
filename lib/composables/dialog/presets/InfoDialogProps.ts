import type { Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import type { InteractiveDialogCta } from '@/composables/dialog/types/DialogCta'

interface InfoDialogBaseProps<T> {
    title: string
    translateTitle?: boolean
    additionalCta?: InteractiveDialogCta<T>[]
    defaultCta?: Partial<InteractiveDialogCta<T>> | false
    width?: number | string
}

export interface InfoDialogTextContent<T> extends InfoDialogBaseProps<T> {
    content: string
    translateContent?: boolean
}

export interface InfoDialogComponentContent<T = void, C extends Component = Component> extends InfoDialogBaseProps<T> {
    component: C
    props: ComponentProps<C>
}

export type InfoDialogProps<T = void, C extends Component = Component> = InfoDialogComponentContent<T, C> | InfoDialogTextContent<T>
