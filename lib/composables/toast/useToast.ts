import { useToastQueue } from '@/composables/toast/internal/useToastQueue'
import { ToastType } from '@/composables/toast/types/ToastType'
import type { ToastOptions } from '@/composables/toast/types/ToastOptions'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export type ToastFunction = (message: string, options?: Partial<ToastOptions>) => Promise<boolean>

export interface ToastComposable {
    info: ToastFunction
    warn: ToastFunction
    error: ToastFunction
    success: ToastFunction
}

export function useToast(): ToastComposable {
    const toastQueue = useToastQueue()
    const { options: { toast: defaultOptions } } = usePluginContext()

    function defaultTimeout(type: ToastType): number | false {
        return type === ToastType.ERROR ? defaultOptions.errorTimeout : defaultOptions.timeout
    }

    function createToastFunction(type: ToastType): ToastFunction {
        return (message, options) => new Promise((resolve) => {
            toastQueue.addToQueue({
                message,
                resolve,
                timeout: options?.timeout ?? defaultTimeout(type),
                translateMessage: options?.translateMessage ?? true,
                action: options?.action,
                type,
            })
        })
    }

    return {
        info: createToastFunction(ToastType.INFO),
        warn: createToastFunction(ToastType.WARNING),
        error: createToastFunction(ToastType.ERROR),
        success: createToastFunction(ToastType.SUCCESS),
    }
}
