import type { Ref } from 'vue'
import type { CreateDialogQueueEntry, DialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'

export interface DialogQueue {
    queue: Readonly<Ref<DialogQueueEntry[]>>
    addToQueue(entry: CreateDialogQueueEntry): DialogQueueEntry
    removeFromQueue(idOrEntry: DialogQueueEntry | string): void
}
