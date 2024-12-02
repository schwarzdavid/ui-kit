import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'

export interface ToastOptions {
    timeout: number
    translateMessage: boolean
}

export interface ToastComposable {
    info(message: string, options?: Partial<ToastOptions>): Promise<void>
    warn(message: string, options?: Partial<ToastOptions>): Promise<void>
    error(message: string, options?: Partial<ToastOptions>): Promise<void>
    success(message: string, options?: Partial<ToastOptions>): Promise<void>
}

export function useToast(): ToastComposable {
    const toastQueue = useToastQueue()

    function info(message: string, options?: Partial<ToastOptions>): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: 4000,
                type: ToastType.INFO,
            })
        })
    }

    function warn(message: string, options?: Partial<ToastOptions>): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: 4000,
                type: ToastType.WARNING,
            })
        })
    }

    function error(message: string, options?: Partial<ToastOptions>): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: 4000,
                type: ToastType.ERROR,
            })
        })
    }

    function success(message: string, options?: Partial<ToastOptions>): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: 4000,
                type: ToastType.SUCCESS,
            })
        })
    }

    return {
        info,
        warn,
        error,
        success,
    }
}
