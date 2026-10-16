import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLoading } from '@/composables/loading/useLoading'
import { useLoadingOverlay } from '@/composables/loading-overlay/useLoadingOverlay'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('useLoading', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns the callback result and toggles loading', async () => {
        const app = createTestApp({ loading: { delay: false } })
        const { loading, action } = app.runWithContext(() => useLoading((value: number) => Promise.resolve(value * 2)))
        const pending = action(21)
        expect(loading.value).toBe(true)
        await expect(pending).resolves.toBe(42)
        expect(loading.value).toBe(false)
    })

    it('waits at least the configured delay', async () => {
        const app = createTestApp({ loading: { delay: 500 } })
        const { loading, action } = app.runWithContext(() => useLoading(() => Promise.resolve('done')))
        const pending = action()
        await vi.advanceTimersByTimeAsync(499)
        expect(loading.value).toBe(true)
        await vi.advanceTimersByTimeAsync(1)
        await expect(pending).resolves.toBe('done')
        expect(loading.value).toBe(false)
    })

    it('per-call options override the plugin defaults', async () => {
        const app = createTestApp({ loading: { delay: 500, overlay: false } })
        const overlay = app.runWithContext(() => useLoadingOverlay())
        const { action } = app.runWithContext(() => useLoading(() => Promise.resolve(), { delay: false, overlay: true }))
        const pending = action()
        expect(overlay.value).toBe(true)
        await pending
        expect(overlay.value).toBe(false)
    })

    it('does not touch the overlay when overlay is disabled', async () => {
        const app = createTestApp({ loading: { delay: false } })
        const overlay = app.runWithContext(() => useLoadingOverlay())
        const { action } = app.runWithContext(() => useLoading(() => Promise.resolve()))
        const pending = action()
        expect(overlay.value).toBe(false)
        await pending
    })

    it('resets loading and the overlay when the callback rejects', async () => {
        const app = createTestApp({ loading: { delay: false, overlay: true } })
        const overlay = app.runWithContext(() => useLoadingOverlay())
        const { loading, action } = app.runWithContext(() => useLoading(() => Promise.reject(new Error('boom'))))
        await expect(action()).rejects.toThrow('boom')
        expect(loading.value).toBe(false)
        expect(overlay.value).toBe(false)
    })
})
