import type { Ref } from 'vue'
import type { CreateToastQueueEntry, ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import type { ToastPauseReason } from '@/composables/toast/types/ToastTimer'

export interface ToastQueue {
    queue: Readonly<Ref<ToastQueueEntry[]>>
    addToQueue(entry: CreateToastQueueEntry): ToastQueueEntry
    removeFromQueue(idOrEntry: ToastQueueEntry | string): void
    close(id: string): void
    trigger(id: string): void
    pause(id: string, reason: ToastPauseReason): void
    resume(id: string, reason: ToastPauseReason): void
}
