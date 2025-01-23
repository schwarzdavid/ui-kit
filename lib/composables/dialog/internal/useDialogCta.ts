import type { DialogCta } from '@/composables/dialog/types/DialogCta'
import type { PluginI18nMessageKey } from '@/plugin/types/PluginOptions'
import { usePluginContext } from '@/plugin/composables/usePluginContext'
import { merge } from 'lodash'

export function useDialogCta(options: Partial<DialogCta> | undefined, messageKey: PluginI18nMessageKey) {
    const context = usePluginContext()

    const defaultValue: DialogCta = {
        text: context.options.i18n.messages[messageKey],
        translateText: true,
    }

    return merge(defaultValue, options)
}
