import type { InjectionKey } from 'vue'
import type { ToastEntryContext } from '@/composables/toast/types/ToastEntryContext'

export const TOAST_ENTRY_INJECTION_KEY: InjectionKey<ToastEntryContext> = Symbol('@schwarzdavid/ui-kit:toast-entry')
