import { markRaw, shallowReadonly } from 'vue'
import type { ToastQueue } from '@/composables/toast/types/ToastQueue'
import type { CreateToastQueueEntry, ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import { createId } from '@/internal/createId'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export function useToastQueue(): ToastQueue {
    const { toastQueue, toastTimers } = usePluginContext()

    function findEntry(id: string): ToastQueueEntry | undefined {
        return toastQueue.value.find(entry => entry.id === id)
    }

    function clearTimer(id: string): void {
        const timer = toastTimers.get(id)
        if (timer !== undefined) {
            clearTimeout(timer)
            toastTimers.delete(id)
        }
    }

    function removeFromQueue(idOrEntry: ToastQueueEntry | string): void {
        const id = typeof idOrEntry === 'string' ? idOrEntry : idOrEntry.id
        clearTimer(id)
        const entryIndex = toastQueue.value.findIndex(entry => entry.id === id)

        if (entryIndex >= 0) {
            toastQueue.value.splice(entryIndex, 1)
        }
    }

    function close(id: string): void {
        const entry = findEntry(id)
        if (!entry) {
            return
        }
        removeFromQueue(id)
        entry.resolve(false)
    }

    function trigger(id: string): void {
        const entry = findEntry(id)
        if (!entry) {
            return
        }
        removeFromQueue(id)
        entry.resolve(true)
        entry.action?.handler?.()
    }

    function addToQueue(entry: CreateToastQueueEntry): ToastQueueEntry {
        const id = createId()
        const fullEntry: ToastQueueEntry = markRaw({ ...entry, id })
        toastQueue.value.push(fullEntry)
        if (typeof entry.timeout === 'number' && entry.timeout > 0) {
            toastTimers.set(id, setTimeout(() => {
                close(id)
            }, entry.timeout))
        }
        return fullEntry
    }

    return {
        queue: shallowReadonly(toastQueue),
        addToQueue,
        removeFromQueue,
        close,
        trigger,
    }
}
