import { ref } from 'vue'
import type { DialogQueueEntry } from '@/composables/dialog/types/DialogQueueEntry'
import type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
import type { PluginContext } from '@/plugin/types/PluginContext'
import type { PluginOptions } from '@/plugin/types/PluginOptions'

export function createPluginContext(options: PluginOptions): PluginContext {
    return {
        dialogQueue: ref<DialogQueueEntry[]>([]),
        toastQueue: ref<ToastQueueEntry[]>([]),
        toastTimers: new Map(),
        loadingOverlay: ref(false),
        options,
    }
}
