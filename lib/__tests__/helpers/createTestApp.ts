import { type App, createApp } from 'vue'
import { createUIKit } from '@/plugin/createUIKit'
import type { CreateUIKitOptions } from '@/plugin/types/PluginOptions'

export function createTestApp(options?: CreateUIKitOptions): App {
    const app = createApp({ render: () => null })
    app.use(createUIKit(options))
    return app
}

export function runWithUiKit<T>(callback: () => T, options?: CreateUIKitOptions): T {
    return createTestApp(options).runWithContext(callback)
}
