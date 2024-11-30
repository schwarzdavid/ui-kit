import type { FunctionPlugin } from 'vue'
import type { PluginOptions } from '@/plugin/types/PluginOptions'
import type { PartialDeep } from 'type-fest'
import { injectPluginOptions } from '@/plugin/composables/usePluginOptions'

export function createUIKit(options?: PartialDeep<PluginOptions>): FunctionPlugin<void> {
    return (app) => {
        injectPluginOptions(app, options)
    }
}
