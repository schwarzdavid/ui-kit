import { type DeepReadonly, type Ref, shallowRef } from 'vue'
import type { DialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'
import type { ToastQueueEntry } from '@/composables/toast/types/TaostQueueEntry'
import type { PluginOptions } from '@/plugin/types/PluginOptions'

export interface PluginContext {
    dialogQueue: Ref<DialogQueueEntry[]>
    toastQueue: Ref<ToastQueueEntry[]>
    options: DeepReadonly<PluginOptions>
}

export function createPluginContext(options: PluginOptions): PluginContext {
    const dialogQueue = shallowRef<DialogQueueEntry[]>([])
    const toastQueue = shallowRef<ToastQueueEntry[]>([])

    return {
        dialogQueue,
        toastQueue,
        options,
    }
}
