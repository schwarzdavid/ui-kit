export type ToastPauseReason = 'hover' | 'focus' | 'hidden'

export interface ToastTimer {
    remaining: number
    startedAt: number
    handle: ReturnType<typeof setTimeout> | undefined
    holds: Set<ToastPauseReason>
}
