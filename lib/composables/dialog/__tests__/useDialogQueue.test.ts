import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { useDialogQueue } from '@/composables/dialog/internal/useDialogQueue'
import type { CreateDialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'
import { runWithUiKit } from '@/__tests__/helpers/createTestApp'

const Dummy = defineComponent({ render: () => null })

function createEntry(resolve = vi.fn(), reject = vi.fn()): CreateDialogQueueEntry {
    return { component: Dummy, props: {}, resolve, reject }
}

describe('useDialogQueue', () => {
    it('appends entries in order with unique ids', () => {
        const queue = runWithUiKit(() => useDialogQueue())
        const first = queue.addToQueue(createEntry())
        const second = queue.addToQueue(createEntry())
        expect(queue.queue.value.map(entry => entry.id)).toEqual([first.id, second.id])
        expect(first.id).not.toBe(second.id)
    })

    it('resolve removes the entry and forwards the value', () => {
        const resolve = vi.fn()
        const queue = runWithUiKit(() => useDialogQueue())
        const entry = queue.addToQueue(createEntry(resolve))
        entry.resolve('value')
        expect(queue.queue.value).toHaveLength(0)
        expect(resolve).toHaveBeenCalledWith('value')
    })

    it('reject removes the entry and forwards the reason', () => {
        const reject = vi.fn()
        const queue = runWithUiKit(() => useDialogQueue())
        const entry = queue.addToQueue(createEntry(vi.fn(), reject))
        entry.reject('reason')
        expect(queue.queue.value).toHaveLength(0)
        expect(reject).toHaveBeenCalledWith('reason')
    })

    it('removeFromQueue accepts an id or an entry and ignores unknown ids', () => {
        const queue = runWithUiKit(() => useDialogQueue())
        const first = queue.addToQueue(createEntry())
        const second = queue.addToQueue(createEntry())
        queue.removeFromQueue(first.id)
        queue.removeFromQueue(second)
        queue.removeFromQueue('unknown')
        expect(queue.queue.value).toHaveLength(0)
    })
})
