import type { IsEmptyObject } from 'type-fest'

export type DialogProps<T extends object> = IsEmptyObject<T> extends true ? object : { props: T }
