import { describe, expect, it } from 'vitest'
import { resolveDialogWidth } from '@/composables/dialog/internal/dialogWidths'

describe('resolveDialogWidth', () => {
    it.each([
        ['sm', 440],
        ['md', 560],
        ['lg', 720],
    ] as const)('maps %s to %d', (token, pixels) => {
        expect(resolveDialogWidth(token)).toBe(pixels)
    })

    it('passes numbers through', () => {
        expect(resolveDialogWidth(900)).toBe(900)
    })
})
