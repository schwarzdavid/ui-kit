import { markRaw, readonly, ref } from 'vue'
import { v4 } from 'uuid'
import type { DialogQueue } from '../types/DialogQueue'
import type { CreateDialogQueueEntry, DialogQueueEntry } from '../types/DialogQueueEntry'

const dialogQueue = ref<DialogQueueEntry[]>([])

export function useDialogQueue(): DialogQueue {
    function generateId(): string {
        let uuid: string
        while (true) {
            uuid = v4()

            if (!dialogQueue.value.some(entry => entry.id === uuid)) {
                return uuid
            }
        }
    }

    function addToQueue(entry: CreateDialogQueueEntry): DialogQueueEntry {
        const id = generateId()
        const resolve = (value: unknown): void => {
            removeFromQueue(id)
            entry.resolve(value)
        }

        const reject = (reason?: string): void => {
            removeFromQueue(id)
            entry.reject(reason)
        }

        const fullEntry: DialogQueueEntry = markRaw({ ...entry, id, resolve, reject })
        dialogQueue.value.push(fullEntry)
        return fullEntry
    }

    function removeFromQueue(idOrEntry: DialogQueueEntry | string): void {
        const id = typeof idOrEntry === 'string' ? idOrEntry : idOrEntry.id
        const entryIndex = dialogQueue.value.findIndex(entry => entry.id === id)

        if (entryIndex >= 0) {
            dialogQueue.value.splice(entryIndex, 1)
        }
    }

    return {
        queue: readonly(dialogQueue),
        addToQueue,
        removeFromQueue,
    }
}
