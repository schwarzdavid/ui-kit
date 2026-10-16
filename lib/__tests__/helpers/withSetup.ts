import { defineComponent, type Plugin } from 'vue'
import { mount } from '@vue/test-utils'

export function withSetup<T>(composable: () => T, plugins: Plugin[] = []): T {
    let result!: T
    const Host = defineComponent({
        setup() {
            result = composable()
            return () => null
        },
    })
    mount(Host, { global: { plugins } })
    return result
}
