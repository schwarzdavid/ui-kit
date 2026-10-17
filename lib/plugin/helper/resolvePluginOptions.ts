import { markRaw } from 'vue'
import { merge } from 'lodash-es'
import type { CreateUIKitOptions, PluginOptions } from '@/plugin/types/PluginOptions'
import { createDefaultPluginOptions } from '@/plugin/helper/createDefaultPluginOptions'

export function resolvePluginOptions(options: CreateUIKitOptions = {}): PluginOptions {
    const { components, ...rest } = options
    const defaults = createDefaultPluginOptions()
    const resolved: PluginOptions = merge(defaults, rest)
    resolved.components = {
        dialog: {
            info: markRaw(components?.dialog?.info ?? defaults.components.dialog.info),
            confirm: markRaw(components?.dialog?.confirm ?? defaults.components.dialog.confirm),
            prompt: markRaw(components?.dialog?.prompt ?? defaults.components.dialog.prompt),
            form: markRaw(components?.dialog?.form ?? defaults.components.dialog.form),
        },
        toast: markRaw(components?.toast ?? defaults.components.toast),
    }
    return resolved
}
