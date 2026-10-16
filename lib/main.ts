import UiKitOutlet from '@/components/UiKitOutlet.vue'

export { UiKitOutlet }
export * from '@/composables/dialog/useDialog'
export * from '@/composables/dialog/presets/ConfirmDialogProps'
export * from '@/composables/dialog/presets/InfoDialogProps'
export * from '@/composables/dialog/presets/PromptDialogProps'
export * from '@/composables/dialog/presets/FormDialogProps'
export type { DialogCta, DialogValueCta, DialogActionCta, InteractiveDialogCta } from '@/composables/dialog/types/DialogCta'
export type { DialogComponentEmits } from '@/composables/dialog/types/DialogComponent'
export * from '@/composables/toast/useToast'
export type { ToastOptions } from '@/composables/toast/types/ToastOptions'
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
} from '@/plugin/types/PluginOptions'
