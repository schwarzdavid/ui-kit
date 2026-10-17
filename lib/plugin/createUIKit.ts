import type { FunctionPlugin } from 'vue'
import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'
import { resolvePluginOptions } from '@/plugin/helper/resolvePluginOptions'
import { createPluginContext } from '@/plugin/helper/createPluginContext'
import { UI_KIT_INJECTION_KEY } from '@/plugin/constants/injectionKey'

export function createUIKit(options?: CreateUIKitOptions): FunctionPlugin<undefined[]> {
    return (app) => {
        app.provide(UI_KIT_INJECTION_KEY, createPluginContext(resolvePluginOptions(options)))
    }
}
