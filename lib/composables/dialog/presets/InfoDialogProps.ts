import type { Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'

export interface InfoDialogBaseCta {
    text: string
    translateText?: boolean
}

export interface InfoDialogActionCta extends InfoDialogBaseCta {
    action(): unknown
}

export interface InfoDialogValueCta<T> extends InfoDialogBaseCta {
    value: T
}

export type InfoDialogCta<T> = InfoDialogActionCta | InfoDialogValueCta<T>

interface InfoDialogBaseProps<T> {
    title: string
    translateTitle?: boolean
    additionalCta?: InfoDialogCta<T>[]
    defaultCta?: Partial<InfoDialogCta<T>> | false
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
