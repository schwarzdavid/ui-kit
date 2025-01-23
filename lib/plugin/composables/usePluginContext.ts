import { getCurrentInstance, inject } from 'vue'
import { Errors } from '@/plugin/constants/errors'
import type { PluginContext } from '@/plugin/helper/createPluginContext'

export function usePluginContext(): PluginContext {
    const instance = getCurrentInstance()
    if (!instance?.appContext.__SCHWARZDAVID_UIKIT_SYMBOL__) {
        throw new Error(Errors.NOT_INSTALLED)
    }
    const injectionKey = instance.appContext.__SCHWARZDAVID_UIKIT_SYMBOL__
    const context = inject<PluginContext>(injectionKey)
    if (!context) {
        throw new Error(Errors.UNEXPECTED_ERROR)
    }
    return context
}
