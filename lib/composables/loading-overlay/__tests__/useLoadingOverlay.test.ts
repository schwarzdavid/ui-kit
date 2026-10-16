import { describe, expect, it } from 'vitest'
import { useLoadingOverlay } from '@/composables/loading-overlay/useLoadingOverlay'
import { createTestApp } from '@/__tests__/helpers/createTestApp'

describe('useLoadingOverlay', () => {
    it('is scoped to the app instance', () => {
        const first = createTestApp().runWithContext(() => useLoadingOverlay())
        const second = createTestApp().runWithContext(() => useLoadingOverlay())
        first.value = true
        expect(second.value).toBe(false)
    })

    it('returns the same ref within one app', () => {
        const app = createTestApp()
        const first = app.runWithContext(() => useLoadingOverlay())
        const second = app.runWithContext(() => useLoadingOverlay())
        expect(first).toBe(second)
    })
})
