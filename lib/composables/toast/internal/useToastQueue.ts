import type { ToastQueue } from '@/composables/toast/types/ToastQueue'
import { v4 } from 'uuid'
import { markRaw, readonly } from 'vue'
import type { CreateToastQueueEntry, ToastQueueEntry } from '@/composables/toast/types/TaostQueueEntry'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export function useToastQueue(): ToastQueue {
    const { toastQueue } = usePluginContext()

    function generateId(): string {
        let uuid: string
        while (true) {
            uuid = v4()
            if (!toastQueue.value.some(entry => entry.id === uuid)) {
                return uuid
            }
        }
    }

    function addToQueue(entry: CreateToastQueueEntry): ToastQueueEntry {
        const id = generateId()

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
