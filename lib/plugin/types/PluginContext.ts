import type { DeepReadonly, Ref } from 'vue'
import type { DialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'
import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import type { PluginOptions } from '@/plugin/types/PluginOptions'

export interface PluginContext {
    dialogQueue: Ref<DialogQueueEntry[]>
    toastQueue: Ref<ToastQueueEntry[]>
    loadingOverlay: Ref<boolean>
    options: DeepReadonly<PluginOptions>
}
