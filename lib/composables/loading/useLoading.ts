import { readonly, type Ref, ref } from 'vue'
import { useLoadingOverlay } from '@/composables/loading-overlay/useLoadingOverlay'
import type { PluginLoadingOptions } from '@/plugin/types/PluginOptions'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export type LoadingAction = (...args: never[]) => unknown

export interface LoadingComposable<A extends LoadingAction> {
    loading: Readonly<Ref<boolean>>
    action(...args: Parameters<A>): Promise<Awaited<ReturnType<A>>>
}

function minimumDuration(millis: number | false): Promise<void> {
    if (!millis) {
        return Promise.resolve()
    }
    return new Promise((resolve) => {
        setTimeout(resolve, millis)
    })
}

export function useLoading<A extends LoadingAction>(actionCallback: A, options: Partial<PluginLoadingOptions> = {}): LoadingComposable<A> {
    const { options: { loading: defaultOptions } } = usePluginContext()
    const delay = options.delay ?? defaultOptions.delay
    const overlay = options.overlay ?? defaultOptions.overlay
    const loading = ref(false)
    const isOverlayActive = useLoadingOverlay()
    const callback = actionCallback as (...args: Parameters<A>) => ReturnType<A>

    async function action(...args: Parameters<A>): Promise<Awaited<ReturnType<A>>> {
        loading.value = true
        if (overlay) {
            isOverlayActive.value = true
        }
        try {
            const [result] = await Promise.all([
                callback(...args),
                minimumDuration(delay),
            ])
            return result
        } finally {
            loading.value = false
            if (overlay) {
                isOverlayActive.value = false
            }
        }
    }

    return { loading: readonly(loading), action }
}
