import { describe, expect, it } from 'vitest'
import { resolveSheetRelease } from '@/components/sheet/internal/resolveSheetRelease'
import type { SheetReleaseInput } from '@/components/sheet/types/SheetRelease'

function release(overrides: Partial<SheetReleaseInput>) {
    return resolveSheetRelease({
        heights: [400, 800],
        current: 0,
        delta: 0,
        velocity: 0,
        dismissible: true,
        ...overrides,
    })
}

describe('resolveSheetRelease', () => {
    it('stays on the current stage for a small slow drag', () => {
        expect(release({ current: 0, delta: 40, velocity: 0.1 })).toEqual({ type: 'stage', index: 0 })
    })

    it('dismisses when dragged below 60 % of the lowest stage', () => {
        expect(release({ current: 0, delta: 170, velocity: 0.1 })).toEqual({ type: 'dismiss' })
    })

    it('dismisses on a downward flick from the lowest stage', () => {
        expect(release({ current: 0, delta: 20, velocity: 0.6 })).toEqual({ type: 'dismiss' })
    })

    it('springs back instead of dismissing when not dismissible', () => {
        expect(release({ current: 0, delta: 20, velocity: 0.6, dismissible: false })).toEqual({ type: 'stage', index: 0 })
    })

    it('expands on an upward flick', () => {
        expect(release({ current: 0, delta: -20, velocity: -0.6 })).toEqual({ type: 'stage', index: 1 })
    })

    it('snaps to the nearest stage height on a slow release', () => {
        expect(release({ current: 0, delta: -250, velocity: -0.1 })).toEqual({ type: 'stage', index: 1 })
    })

    it('collapses one stage on a downward flick from fullscreen', () => {
        expect(release({ current: 1, delta: 30, velocity: 0.6 })).toEqual({ type: 'stage', index: 0 })
    })

    it('dismisses directly from fullscreen on a very fast flick', () => {
        expect(release({ current: 1, delta: 60, velocity: 1.6 })).toEqual({ type: 'dismiss' })
    })

    it('dismisses directly from fullscreen when dragged far enough', () => {
        expect(release({ current: 1, delta: 600, velocity: 0.2 })).toEqual({ type: 'dismiss' })
    })

    it('never goes above the highest stage', () => {
        expect(release({ heights: [400], current: 0, delta: -300, velocity: -1 })).toEqual({ type: 'stage', index: 0 })
    })
})
