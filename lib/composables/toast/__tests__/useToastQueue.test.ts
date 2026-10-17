import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'
import type { CreateToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import { usePluginContext } from '@/plugin/composables/usePluginContext'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

function createEntry(overrides: Partial<CreateToastQueueEntry> = {}): CreateToastQueueEntry {
    return { message: 'hello', resolve: vi.fn(), timeout: 100, translateMessage: false, type: ToastType.INFO, ...overrides }
}

function setup() {
    const app = createTestApp()
    return {
        queue: app.runWithContext(() => useToastQueue()),
        context: app.runWithContext(() => usePluginContext()),
    }
}

describe('useToastQueue', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('appends entries so the newest is last and assigns unique ids', () => {
        const { queue } = setup()
        const first = queue.addToQueue(createEntry())
        const second = queue.addToQueue(createEntry())
        expect(queue.queue.value.map(entry => entry.id)).toEqual([first.id, second.id])
        expect(first.id).not.toBe(second.id)
    })

    it('closes an entry when its timeout elapses and resolves with false', () => {
        const resolve = vi.fn()
        const { queue, context } = setup()
        const entry = queue.addToQueue(createEntry({ resolve }))
        expect(context.toastTimers.has(entry.id)).toBe(true)
        vi.advanceTimersByTime(99)
        expect(resolve).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1)
        expect(resolve).toHaveBeenCalledWith(false)
        expect(queue.queue.value).toHaveLength(0)
        expect(context.toastTimers.has(entry.id)).toBe(false)
    })

    it('does not start a timer for timeout false', () => {
        const resolve = vi.fn()
        const { queue, context } = setup()
        queue.addToQueue(createEntry({ resolve, timeout: false }))
        vi.advanceTimersByTime(60000)
        expect(resolve).not.toHaveBeenCalled()
        expect(queue.queue.value).toHaveLength(1)
        expect(context.toastTimers.size).toBe(0)
    })

    it('does not start a timer for a non-positive timeout', () => {
        const { queue, context } = setup()
        queue.addToQueue(createEntry({ timeout: 0 }))
        queue.addToQueue(createEntry({ timeout: -5 }))
        vi.advanceTimersByTime(60000)
        expect(queue.queue.value).toHaveLength(2)
        expect(context.toastTimers.size).toBe(0)
    })

    it('close() removes the entry, resolves false once and clears the timer', () => {
        const resolve = vi.fn()
        const { queue, context } = setup()
        const entry = queue.addToQueue(createEntry({ resolve }))
        queue.close(entry.id)
        vi.advanceTimersByTime(1000)
        expect(resolve).toHaveBeenCalledTimes(1)
        expect(resolve).toHaveBeenCalledWith(false)
        expect(queue.queue.value).toHaveLength(0)
        expect(context.toastTimers.size).toBe(0)
    })

    it('trigger() resolves true and runs the action handler after the entry is gone', () => {
        const resolve = vi.fn()
        const { queue } = setup()
        const handler = vi.fn(() => {
            expect(resolve).toHaveBeenCalledWith(true)
            expect(queue.queue.value).toHaveLength(0)
        })
        const entry = queue.addToQueue(createEntry({ resolve, action: { text: 'Undo', handler } }))
        queue.trigger(entry.id)
        expect(handler).toHaveBeenCalledTimes(1)
        vi.advanceTimersByTime(1000)
        expect(resolve).toHaveBeenCalledTimes(1)
    })

    it('trigger() without an action still resolves true', () => {
        const resolve = vi.fn()
        const { queue } = setup()
        const entry = queue.addToQueue(createEntry({ resolve }))
        queue.trigger(entry.id)
        expect(resolve).toHaveBeenCalledWith(true)
    })

    it('ignores close() and trigger() for unknown ids', () => {
        const { queue } = setup()
        queue.addToQueue(createEntry())
        queue.close('unknown')
        queue.trigger('unknown')
        expect(queue.queue.value).toHaveLength(1)
    })

    it('removeFromQueue accepts an id or an entry, clears the timer and does not resolve', () => {
        const resolve = vi.fn()
        const { queue, context } = setup()
        const first = queue.addToQueue(createEntry({ resolve }))
        const second = queue.addToQueue(createEntry({ resolve }))
        queue.removeFromQueue(first.id)
        queue.removeFromQueue(second)
        queue.removeFromQueue('unknown')
        vi.advanceTimersByTime(1000)
        expect(queue.queue.value).toHaveLength(0)
        expect(context.toastTimers.size).toBe(0)
        expect(resolve).not.toHaveBeenCalled()
    })
})
