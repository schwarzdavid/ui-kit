import type { FunctionPlugin } from 'vue'
import type { PartialDeep } from 'type-fest'
import { merge } from 'lodash-es'
import type { PluginOptions } from '@/plugin/types/PluginOptions'
import { createDefaultPluginOptions } from '@/plugin/helper/createDefaultPluginOptions'
import { createPluginContext } from '@/plugin/helper/createPluginContext'
import { UI_KIT_INJECTION_KEY } from '@/plugin/constants/injectionKey'

export function createUIKit(options?: PartialDeep<PluginOptions>): FunctionPlugin<undefined[]> {
    return (app) => {
        const mergedOptions = merge(createDefaultPluginOptions(), options)
        app.provide(UI_KIT_INJECTION_KEY, createPluginContext(mergedOptions))
    }
}
