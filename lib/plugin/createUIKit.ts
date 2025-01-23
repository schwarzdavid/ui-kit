import type { FunctionPlugin } from 'vue'
import type { PluginOptions } from '@/plugin/types/PluginOptions'
import type { PartialDeep } from 'type-fest'
import { createDefaultPluginOptions } from '@/plugin/helper/createDefaultPluginOptions'
import { merge } from 'lodash'
import { createPluginContext } from '@/plugin/helper/createPluginContext'

export function createUIKit(options?: PartialDeep<PluginOptions>): FunctionPlugin<void> {
    return (app) => {
        const defaultOptions = createDefaultPluginOptions()
        const mergedOptions = merge(defaultOptions, options)
        const context = createPluginContext(mergedOptions)

        app.__SCHWARZDAVID_UIKIT_SYMBOL__ = Symbol('@schwarzdavid/ui-kit')
        app.provide(app.__SCHWARZDAVID_UIKIT_SYMBOL__, context)
    }
}
