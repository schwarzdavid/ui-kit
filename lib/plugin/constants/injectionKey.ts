import type { InjectionKey } from 'vue'
import type { PluginContext } from '@/plugin/types/PluginContext'

export const UI_KIT_INJECTION_KEY: InjectionKey<PluginContext> = Symbol('@schwarzdavid/ui-kit')
