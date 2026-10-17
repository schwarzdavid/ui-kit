import UiKitOutlet from '@/components/UiKitOutlet.vue'

export { UiKitOutlet }
export * from '@/composables/dialog/useDialog'
export * from '@/composables/dialog/useDialogEntry'
export * from '@/composables/dialog/useDialogForm'
export * from '@/composables/dialog/presets/ConfirmDialogProps'
export * from '@/composables/dialog/presets/InfoDialogProps'
export * from '@/composables/dialog/presets/PromptDialogProps'
export * from '@/composables/dialog/presets/FormDialogProps'
export type { DialogCta, DialogValueCta, DialogActionCta, InteractiveDialogCta } from '@/composables/dialog/types/DialogCta'
export type { DialogEntryContext } from '@/composables/dialog/types/DialogEntryContext'
export type { DialogFormContext, DialogFormFinish } from '@/composables/dialog/types/DialogFormContext'
export type { DialogWidth } from '@/composables/dialog/types/DialogWidth'
export * from '@/composables/toast/useToast'
export * from '@/composables/toast/useToastEntry'
export type { ToastOptions } from '@/composables/toast/types/ToastOptions'
export type { ToastAction } from '@/composables/toast/types/ToastAction'
export type { ToastQueueEntry } from '@/composables/toast/types/ToastQueueEntry'
export type { ToastEntryContext, ToastEntryData } from '@/composables/toast/types/ToastEntryContext'
export { ToastType } from '@/composables/toast/types/ToastType'
export * from '@/composables/loading/useLoading'
export * from '@/composables/loading-overlay/useLoadingOverlay'
export * from '@/plugin/createUIKit'
export type {
    PluginOptions,
    PluginI18nOptions,
    PluginI18nMessageKey,
    PluginLoadingOptions,
    PluginToastOptions,
    PluginComponentOptions,
    PluginDialogComponentOptions,
    CreateUIKitOptions,
} from '@/plugin/types/PluginOptions'
