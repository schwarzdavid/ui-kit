import type { DialogWidth } from '@/composables/dialog/types/DialogWidth'

export const DIALOG_WIDTHS = {
    sm: 440,
    md: 560,
    lg: 720,
} as const

export function resolveDialogWidth(width: DialogWidth): number {
    return typeof width === 'number' ? width : DIALOG_WIDTHS[width]
}
