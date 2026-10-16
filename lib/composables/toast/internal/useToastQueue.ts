import type { ToastQueue } from '@/composables/toast/types/ToastQueue'
import { markRaw, readonly } from 'vue'
import type { CreateToastQueueEntry, ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import { createId } from '@/internal/createId'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export function useToastQueue(): ToastQueue {
    const { toastQueue } = usePluginContext()

    function addToQueue(entry: CreateToastQueueEntry): ToastQueueEntry {
        const id = createId()

        const resolve = () => {
            removeFromQueue(id)
            entry.resolve()
        }

        const fullEntry: ToastQueueEntry = markRaw({ ...entry, id, resolve })
        toastQueue.value.unshift(fullEntry)
        return fullEntry
    }

    function removeFromQueue(idOrEntry: ToastQueueEntry | string): void {
        const id = typeof idOrEntry === 'string' ? idOrEntry : idOrEntry.id
        const entryIndex = toastQueue.value.findIndex(entry => entry.id === id)

        if (entryIndex >= 0) {
            toastQueue.value.splice(entryIndex, 1)
        }
    }

    return {
        queue: readonly(toastQueue),
        addToQueue,
        removeFromQueue,
    }
}
