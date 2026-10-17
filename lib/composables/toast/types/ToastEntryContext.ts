import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'

export type ToastEntryData = Omit<ToastQueueEntry, 'resolve'>

export interface ToastEntryContext {
    readonly entry: ToastEntryData
    close(): void
    trigger(): void
}
