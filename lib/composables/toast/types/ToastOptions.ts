import type { ToastAction } from '@/composables/toast/types/ToastAction'

export interface ToastOptions {
    timeout: number | false
    translateMessage: boolean
    action?: ToastAction
}
