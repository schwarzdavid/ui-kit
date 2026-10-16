import { describe, expect, it, vi } from 'vitest'
import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'
import type { CreateToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import { runWithUiKit } from '@/__tests__/helpers/createTestApp'

function createEntry(resolve = vi.fn()): CreateToastQueueEntry {
    return { message: 'hello', resolve, timeout: 100, translateMessage: false, type: ToastType.INFO }
}

describe('useToastQueue', () => {
    it('prepends new entries and assigns unique ids', () => {
        const queue = runWithUiKit(() => useToastQueue())
        const first = queue.addToQueue(createEntry())
        const second = queue.addToQueue(createEntry())
        expect(queue.queue.value.map(entry => entry.id)).toEqual([second.id, first.id])
        expect(first.id).not.toBe(second.id)
    })

    it('resolving an entry removes it and calls the original resolve', () => {
        const resolve = vi.fn()
        const queue = runWithUiKit(() => useToastQueue())
        const entry = queue.addToQueue(createEntry(resolve))
        entry.resolve()
        expect(queue.queue.value).toHaveLength(0)
        expect(resolve).toHaveBeenCalledTimes(1)
    })

    it('removeFromQueue accepts an id or an entry and ignores unknown ids', () => {
        const queue = runWithUiKit(() => useToastQueue())
        const first = queue.addToQueue(createEntry())
        const second = queue.addToQueue(createEntry())
        queue.removeFromQueue(first.id)
        queue.removeFromQueue(second)
        queue.removeFromQueue('unknown')
        expect(queue.queue.value).toHaveLength(0)
    })
})
