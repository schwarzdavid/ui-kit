import { readonly, type Ref, ref } from 'vue'
import { useLoadingOverlay } from '@/composables/loading-overlay/useLoadingOverlay'
import type { PluginLoadingOptions } from '@/plugin/types/PluginOptions'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LoadingAction = (...args: any) => any | Promise<any>

export interface LoadingComposable<A extends LoadingAction> {
    loading: Readonly<Ref<boolean>>
    action(...args: Parameters<A>): Promise<Awaited<ReturnType<A>>>
}

function timeout(millis?: number | false): Promise<void> {
    if (!millis) {
        return Promise.resolve()
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, millis)
    })
}

export function useLoading<A extends LoadingAction>(actionCallback: A, options: Partial<PluginLoadingOptions> = {}): LoadingComposable<A> {
    const { options: { loading: { delay, overlay } } } = usePluginContext()
    const loading = ref(false)
    const isOverlayActive = useLoadingOverlay()

    async function action(...args: Parameters<A>): Promise<Awaited<ReturnType<A>>> {
        loading.value = true

        if (overlay) {
            isOverlayActive.value = true
        }

        try {
            const [result] = await Promise.all([
                actionCallback(...args),
                timeout(delay),
            ])
            return result
        }
        catch (err) {
            throw err
        }
        finally {
            loading.value = false
            if (overlay) {
                isOverlayActive.value = false
            }
        }
    }

    return { loading: readonly(loading), action }
}
