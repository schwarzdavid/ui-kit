import type { SheetStage } from '@/components/sheet/types/SheetStage'

export function resolveSheetStages(hasPreview: boolean, expandable: boolean): SheetStage[] {
    const first: SheetStage = hasPreview ? 'preview' : 'content'
    if (expandable) {
        return [first, 'fullscreen']
    }
    return hasPreview ? ['preview', 'content'] : ['content']
}
