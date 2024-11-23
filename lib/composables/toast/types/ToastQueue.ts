import type { DeepReadonly, Ref } from 'vue'
import type { CreateToastQueueEntry, ToastQueueEntry } from '@/composables/toast/types/TaostQueueEntry'

export interface ToastQueue {
    queue: DeepReadonly<Ref<ToastQueueEntry[]>>
    addToQueue(entry: CreateToastQueueEntry): ToastQueueEntry
    removeFromQueue(idOrEntry: ToastQueueEntry | string): void
}
