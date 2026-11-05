import type { SheetReleaseInput, SheetReleaseResult } from '@/components/sheet/types/SheetRelease'

const FLICK_VELOCITY = 0.5
const FAST_DISMISS_VELOCITY = 1.5
const DISMISS_RATIO = 0.6

export function resolveSheetRelease(input: SheetReleaseInput): SheetReleaseResult {
    const { heights, current, delta, velocity, dismissible } = input
    const last = heights.length - 1
    const projected = heights[current] - delta

    if (dismissible && (velocity > FAST_DISMISS_VELOCITY || projected < heights[0] * DISMISS_RATIO)) {
        return { type: 'dismiss' }
    }

    if (velocity > FLICK_VELOCITY) {
        if (current === 0) {
            return dismissible ? { type: 'dismiss' } : { type: 'stage', index: 0 }
        }
        return { type: 'stage', index: current - 1 }
    }

    if (velocity < -FLICK_VELOCITY) {
        return { type: 'stage', index: Math.min(current + 1, last) }
    }

    let index = 0
    for (let i = 1; i <= last; i++) {
        if (Math.abs(heights[i] - projected) < Math.abs(heights[index] - projected)) {
            index = i
        }
    }
    return { type: 'stage', index }
}
