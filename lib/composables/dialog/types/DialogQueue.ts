import type { DeepReadonly, Ref } from 'vue'
import type { CreateDialogQueueEntry, DialogQueueEntry } from './DialogQueueEntry'

export interface DialogQueue {
    queue: DeepReadonly<Ref<DialogQueueEntry[]>>
    addToQueue(entry: CreateDialogQueueEntry): DialogQueueEntry
    removeFromQueue(idOrEntry: DialogQueueEntry | string): void
}
