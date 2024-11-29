import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'

export interface ToastComposable {
    info(message: string): Promise<void>
    warn(message: string): Promise<void>
    error(message: string): Promise<void>
    success(message: string): Promise<void>
}

export function useToast(): ToastComposable {
    const toastQueue = useToastQueue()

    function info(message: string): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: 4000,
                type: ToastType.INFO,
            })
        })
    }

    function warn(message: string): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: 4000,
                type: ToastType.WARNING,
            })
        })
    }

    function error(message: string): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: 4000,
                type: ToastType.ERROR,
            })
        })
    }

    function success(message: string): Promise<void> {
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
