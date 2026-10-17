import type { Ref } from 'vue'
import type { CreateToastQueueEntry, ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'

export interface ToastQueue {
    queue: Readonly<Ref<ToastQueueEntry[]>>
    addToQueue(entry: CreateToastQueueEntry): ToastQueueEntry
    removeFromQueue(idOrEntry: ToastQueueEntry | string): void
    close(id: string): void
    trigger(id: string): void
}
