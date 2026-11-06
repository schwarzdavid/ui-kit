import type { InjectionKey } from 'vue'
import type { DialogEntryContext } from '@/composables/dialog/types/DialogEntryContext'
import type { FormDialogProvider } from '@/composables/dialog/types/FormDialogContext'

export const DIALOG_ENTRY_INJECTION_KEY: InjectionKey<DialogEntryContext> = Symbol('@schwarzdavid/ui-kit:dialog-entry')

export const FORM_DIALOG_INJECTION_KEY: InjectionKey<FormDialogProvider> = Symbol('@schwarzdavid/ui-kit:form-dialog')
