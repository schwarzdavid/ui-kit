import { type MaybeRefOrGetter, readonly, type Ref, ref, toValue } from 'vue'
import { useLoadingOverlay } from '@/composables/loading-overlay/useLoadingOverlay'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LoadingAction = (...args: any) => any | Promise<any>

export interface LoadingComposable<A extends LoadingAction> {
    loading: Readonly<Ref<boolean>>
    action(...args: Parameters<A>): Promise<Awaited<ReturnType<A>>>
}

export interface LoadingOptions {
    overlay: MaybeRefOrGetter<boolean>
}

export function useLoading<A extends LoadingAction>(actionCallback: A, { overlay }: Partial<LoadingOptions> = {}): LoadingComposable<A> {
    const loading = ref(false)
    const isOverlayActive = useLoadingOverlay()

    async function action(...args: Parameters<A>): Promise<Awaited<ReturnType<A>>> {
        const showOverlay = toValue(overlay)
        loading.value = true

        if (showOverlay) {
            isOverlayActive.value = true
        }

        try {
            return await actionCallback(...args)
        }
        catch (err) {
            throw err
        }
        finally {
            loading.value = false
            if (showOverlay) {
                isOverlayActive.value = false
            }
        }
    }

    return { loading: readonly(loading), action }
}
