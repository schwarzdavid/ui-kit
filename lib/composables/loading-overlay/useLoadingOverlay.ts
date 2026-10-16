import type { Ref } from 'vue'
import { usePluginContext } from '@/plugin/composables/usePluginContext'

export function useLoadingOverlay(): Ref<boolean> {
    return usePluginContext().loadingOverlay
}
