import { hasInjectionContext, inject } from 'vue'
import { Errors } from '@/plugin/constants/errors'
import { UI_KIT_INJECTION_KEY } from '@/plugin/constants/injectionKey'
import type { PluginContext } from '@/plugin/types/PluginContext'

export function usePluginContext(): PluginContext {
    const context = hasInjectionContext() ? inject(UI_KIT_INJECTION_KEY, null) : null
    if (!context) {
        throw new Error(Errors.NOT_INSTALLED)
    }
    return context
}
