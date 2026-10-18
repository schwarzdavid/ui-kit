import type { DeepReadonly, Ref } from 'vue'
import type { DialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'
import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import type { ToastTimer } from '@/composables/toast/types/ToastTimer'
import type { PluginComponentOptions, PluginOptions } from '@/plugin/types/PluginOptions'

export type PluginContextOptions = DeepReadonly<Omit<PluginOptions, 'components'>> & {
    readonly components: PluginComponentOptions
}

export interface PluginContext {
    dialogQueue: Ref<DialogQueueEntry[]>
    toastQueue: Ref<ToastQueueEntry[]>
    toastTimers: Map<string, ToastTimer>
    loadingOverlay: Ref<boolean>
    options: PluginContextOptions
}
