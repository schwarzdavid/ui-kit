export interface SheetReleaseInput {
    heights: number[]
    current: number
    delta: number
    velocity: number
    dismissible: boolean
}

export type SheetReleaseResult = { type: 'stage', index: number } | { type: 'dismiss' }
