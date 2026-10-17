<template>
    <DialogFrame
        :model-value="open"
        :title="data.title"
        :translate-title="data.translateTitle"
        :width="data.width ?? 'md'"
        :persistent="loading || submitting"
        fullscreen-on-mobile
        form
        @close="closeDialog"
        @submit="submit"
        @opened="focusFirstInput"
        @closed="settle">
        <VAlert
            v-if="error !== null"
            type="error"
            variant="tonal"
            density="compact"
            :icon="Icons.error"
            :title="saveFailedTitle"
            :text="error" />
        <div ref="content" class="ui-dialog__content">
            <component :is="data.component" v-bind="componentProps" />
        </div>
        <template #actions>
            <VBtn variant="text" :disabled="loading" @click="closeDialog">
                <MaybeTranslation :content="abortCta.text" :translate="abortCta.translateText" />
            </VBtn>
            <VBtn variant="flat" color="primary" type="submit" :loading="loading">
                <MaybeTranslation :content="saveCta.text" :translate="saveCta.translateText" />
            </VBtn>
        </template>
    </DialogFrame>
</template>

<script lang="ts" setup generic="R, T = R, C extends Component = Component">
    import { type Component, computed, provide, ref, useTemplateRef } from 'vue'
    import { VAlert, VBtn } from 'vuetify/components'
    import useVuelidate from '@vuelidate/core'
    import DialogFrame from '@/composables/dialog/components/dialog/internal/DialogFrame.vue'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { FormDialogProps } from '@/composables/dialog/presets/FormDialogProps'
    import type { DialogFormFinish } from '@/composables/dialog/types/DialogFormContext'
    import { DIALOG_FORM_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
    import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
    import { useDialogEntry } from '@/composables/dialog/useDialogEntry'
    import { useLoading } from '@/composables/loading/useLoading'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'
    import { usePluginContext } from '@/plugin/composables/usePluginContext'
    import { Errors } from '@/plugin/constants/errors'
    import { Icons } from '@/internal/icons'
    import { toErrorMessage } from '@/internal/toErrorMessage'

    const { data, resolve, reject } = useDialogEntry<FormDialogProps<R, T, boolean>>()
    const { options } = usePluginContext()
    const translate = useMaybeTranslation()
    const saveCta = useDialogCta(data.saveCta, 'save')
    const abortCta = useDialogCta(data.abortCta, 'cancel')
    const saveFailedTitle = computed(() => translate(options.i18n.messages.saveFailed, true))
    const unknownErrorText = computed(() => translate(options.i18n.messages.unknownError, true))
    const open = ref(true)
    const error = ref<string | null>(null)
    const content = useTemplateRef<HTMLDivElement>('content')
    const v = useVuelidate()
    const { loading, action } = useLoading(performAction)
    const componentProps = computed(() => ('props' in data ? data.props : {}) as Record<string, unknown>)

    let finish: DialogFormFinish<T> | null = null
    let resolveValue: unknown = null
    const submitting = ref<boolean>(false)

    provide(DIALOG_FORM_INJECTION_KEY, {
        register(handler: DialogFormFinish<T>) {
            finish = handler
        },
        submit,
        loading,
    })

    async function submit(): Promise<void> {
        if (loading.value || submitting.value) {
            return
        }
        if (!finish) {
            throw new Error(Errors.DIALOG_FORM_NOT_REGISTERED)
        }
        submitting.value = true
        try {
            if (!await v.value.$validate() || !open.value) {
                return
            }
            error.value = null
            await action()
        } catch (caught) {
            error.value = toErrorMessage(caught, unknownErrorText.value)
        } finally {
            submitting.value = false
        }
    }

    async function performAction(): Promise<void> {
        if (!finish) {
            throw new Error(Errors.DIALOG_FORM_NOT_REGISTERED)
        }
        const result = await finish()
        const value: unknown = data.action ? await data.action(result) : result
        resolveValue = value
        open.value = false
    }

    function closeDialog(): void {
        if (loading.value || submitting.value) {
            return
        }
        open.value = false
    }

    function focusFirstInput(): void {
        content.value?.querySelector<HTMLElement>('input:not([type=hidden]), textarea, select')?.focus()
    }

    function settle(): void {
        if (data.rejectOnEmpty && resolveValue === null) {
            reject()
            return
        }
        resolve(resolveValue)
    }
</script>
