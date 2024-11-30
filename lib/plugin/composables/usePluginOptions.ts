import type { PluginOptions } from '@/plugin/types/PluginOptions'
import type { App } from 'vue'
import type { PartialDeep } from 'type-fest'
import { merge } from 'lodash'
import { createDefaultPluginOptions } from '@/plugin/helper/createDefaultPluginOptions'
import { PLUGIN_INJECTION_KEY } from '@/plugin/constants/PLUGIN_INJECTION_KEY'
import { inject } from 'vue'

export function injectPluginOptions(app: App, options?: PartialDeep<PluginOptions>) {
    const mergedOptions = merge(createDefaultPluginOptions(), options)

    app.provide(PLUGIN_INJECTION_KEY, mergedOptions)
}

export function usePluginOptions(customizedOptions?: PartialDeep<PluginOptions>): PluginOptions {
    const options = inject<PluginOptions>(PLUGIN_INJECTION_KEY)
    if (!options) {
        throw new Error('UIKit Plugin not installed')
    }
    return merge({}, options, customizedOptions)
}
