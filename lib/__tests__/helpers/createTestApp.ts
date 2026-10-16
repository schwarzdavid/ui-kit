import { type App, createApp } from 'vue'
import type { PartialDeep } from 'type-fest'
import { createUIKit } from '@/plugin/createUIKit'
import type { PluginOptions } from '@/plugin/types/PluginOptions'

export function createTestApp(options?: PartialDeep<PluginOptions>): App {
    const app = createApp({ render: () => null })
    app.use(createUIKit(options))
    return app
}

export function runWithUiKit<T>(callback: () => T, options?: PartialDeep<PluginOptions>): T {
    return createTestApp(options).runWithContext(callback)
}
