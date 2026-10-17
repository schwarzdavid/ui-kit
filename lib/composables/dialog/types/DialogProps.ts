import type { HasRequiredKeys } from 'type-fest'
import type { AllowedComponentProps, ComponentCustomProps, VNodeProps } from 'vue'

type OwnProps<T extends object> = Omit<T, keyof VNodeProps | keyof AllowedComponentProps | keyof ComponentCustomProps>

type PropsRequired<P extends object> = string extends keyof P ? false : HasRequiredKeys<P>

export type DialogProps<T extends object> = PropsRequired<OwnProps<T>> extends true
    ? { props: OwnProps<T> }
    : { props?: OwnProps<T> }
