import type { ToastType } from '@/composables/toast/types/ToastType'
import type { ToastAction } from '@/composables/toast/types/ToastAction'

export interface CreateToastQueueEntry {
    type: ToastType
    message: string
    translateMessage: boolean
    timeout: number | false
    action?: ToastAction
    resolve(triggered: boolean): void
}

export interface ToastQueueEntry extends CreateToastQueueEntry {
    id: string
}
