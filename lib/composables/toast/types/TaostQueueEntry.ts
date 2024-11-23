import type { ToastType } from '@/composables/toast/types/ToastType'

export interface ToastQueueEntry extends CreateToastQueueEntry {
    id: string
}

export interface CreateToastQueueEntry {
    resolve(): void
    timeout: number
    type: ToastType
    message: string
}
