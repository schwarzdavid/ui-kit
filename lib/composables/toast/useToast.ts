import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'
import type { ToastOptions } from '@/composables/toast/types/ToastOptions'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export interface ToastComposable {
    info(message: string, options?: Partial<ToastOptions>): Promise<void>
    warn(message: string, options?: Partial<ToastOptions>): Promise<void>
    error(message: string, options?: Partial<ToastOptions>): Promise<void>
    success(message: string, options?: Partial<ToastOptions>): Promise<void>
}

export function useToast(): ToastComposable {
    const toastQueue = useToastQueue()
    const { options: { toast: { timeout } } } = usePluginContext()

    function info(message: string, options?: Partial<ToastOptions>): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: options?.timeout ?? timeout,
                translateMessage: options?.translateMessage ?? true,
                type: ToastType.INFO,
            })
        })
    }

    function warn(message: string, options?: Partial<ToastOptions>): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: options?.timeout ?? timeout,
                translateMessage: options?.translateMessage ?? true,
                type: ToastType.WARNING,
            })
        })
    }

    function error(message: string, options?: Partial<ToastOptions>): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: options?.timeout ?? timeout,
                translateMessage: options?.translateMessage ?? true,
                type: ToastType.ERROR,
            })
        })
    }

    function success(message: string, options?: Partial<ToastOptions>): Promise<void> {
        return new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: options?.timeout ?? timeout,
                translateMessage: options?.translateMessage ?? true,
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
