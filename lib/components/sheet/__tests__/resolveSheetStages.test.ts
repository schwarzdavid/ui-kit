import { describe, expect, it } from 'vitest'
import { resolveSheetStages } from '@/components/sheet/internal/resolveSheetStages'

describe('resolveSheetStages', () => {
    it('returns preview and fullscreen for a preview that is expandable', () => {
        expect(resolveSheetStages(true, true)).toEqual(['preview', 'fullscreen'])
    })

    it('returns content and fullscreen without a preview that is expandable', () => {
        expect(resolveSheetStages(false, true)).toEqual(['content', 'fullscreen'])
    })

    it('returns preview and content for a preview that is not expandable', () => {
        expect(resolveSheetStages(true, false)).toEqual(['preview', 'content'])
    })

    it('returns only content without a preview that is not expandable', () => {
        expect(resolveSheetStages(false, false)).toEqual(['content'])
    })
})
