import type { InjectionKey } from 'vue'
import type { DialogEntryContext } from '@/composables/dialog/types/DialogEntryContext'
import type { DialogFormProvider } from '@/composables/dialog/types/DialogFormContext'

export const DIALOG_ENTRY_INJECTION_KEY: InjectionKey<DialogEntryContext> = Symbol('@schwarzdavid/ui-kit:dialog-entry')

export const DIALOG_FORM_INJECTION_KEY: InjectionKey<DialogFormProvider> = Symbol('@schwarzdavid/ui-kit:dialog-form')
