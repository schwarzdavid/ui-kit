import type { IfEmptyObject } from 'type-fest'

export type DialogProps<T extends object> = IfEmptyObject<T, object, { props: T }>
