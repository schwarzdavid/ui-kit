<template>
    <UiResponsiveDialog
        :model-value="open"
        :title="data.title"
        :translate-title="data.translateTitle"
        :width="data.width ?? 'md'"
        :persistent="loading || submitting"
        form
        @close="closeDialog"
        @submit="submit"
        @opened="focusFirstInput"
        @closed="settle">
        <template #header>
            <div :ref="setToolbar" class="ui-dialog__toolbar" />
        </template>
        <VAlert
            v-if="error !== null"
            type="error"
            variant="tonal"
            density="compact"
            :icon="Icons.error"
            :title="saveFailedTitle"
            :text="error" />
        <div ref="content" class="ui-dialog__content">
            <component :is="data.component" v-if="toolbar" v-bind="componentProps" />
        </div>
        <template #actions>
            <VBtn variant="text" :disabled="loading" @click="closeDialog">
                <MaybeTranslation :content="abortCta.text" :translate="abortCta.translateText" />
            </VBtn>
            <VBtn variant="flat" color="primary" type="submit" :disabled="isSaveDisabled" :loading="loading">
                <MaybeTranslation :content="saveCta.text" :translate="saveCta.translateText" />
            </VBtn>
        </template>
    </UiResponsiveDialog>
</template>

<script lang="ts" setup generic="T, R = T, C extends Component = Component">
    import { type Component, type ComponentPublicInstance, computed, provide, ref, shallowRef, toValue, useTemplateRef } from 'vue'
    import { VAlert, VBtn } from 'vuetify/components'
    import useVuelidate from '@vuelidate/core'
    import UiResponsiveDialog from '@/components/sheet/UiResponsiveDialog.vue'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { FormDialogBaseProps } from '@/composables/dialog/presets/FormDialogProps'
    import type { DialogFormFinish } from '@/composables/dialog/types/DialogFormContext'
    import { DIALOG_FORM_INJECTION_KEY } from '@/composables/dialog/constants/injectionKeys'
    import { declaresProp } from '@/composables/dialog/internal/declaresProp'
    import { isEmptyValue } from '@/composables/dialog/internal/isEmptyValue'
    import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
    import { useDialogEntry } from '@/composables/dialog/useDialogEntry'
    import { useLoading } from '@/composables/loading/useLoading'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'
    import { usePluginContext } from '@/plugin/composables/usePluginContext'
    import { Icons } from '@/internal/icons'
    import { toErrorMessage } from '@/internal/toErrorMessage'

    const { data, resolve, reject } = useDialogEntry<FormDialogBaseProps<T, R, boolean> & { props?: Record<string, unknown> }>()
    const { options } = usePluginContext()
    const translate = useMaybeTranslation()
    const saveCta = useDialogCta(data.saveCta, 'save')
    const abortCta = useDialogCta(data.abortCta, 'cancel')
    const saveFailedTitle = computed(() => translate(options.i18n.messages.saveFailed, true))
    const unknownErrorText = computed(() => translate(options.i18n.messages.unknownError, true))
    const open = ref(true)
    const error = ref<string | null>(null)
    const value = ref<T | null>(toValue(data.initialValue) ?? null)
    const finish = shallowRef<DialogFormFinish<T> | null>(null)
    const toolbar = shallowRef<HTMLDivElement | null>(null)
    const content = useTemplateRef<HTMLDivElement>('content')
    const v = useVuelidate()
    const { loading, action } = useLoading(performAction)
    const submitting = ref<boolean>(false)
    const isSaveDisabled = computed(() => !!data.required && finish.value === null && isEmptyValue(value.value))
    const componentProps = computed(() => {
        const props: Record<string, unknown> = { ...data.props }
        if (declaresProp(data.component, 'modelValue')) {
            props.modelValue = value.value
            props['onUpdate:modelValue'] = (updated: T | null) => {
                value.value = updated
            }
        }
        if (declaresProp(data.component, 'toolbar')) {
            props.toolbar = toolbar.value
        }
        return props
    })

    let resolveValue: unknown = null

    function setToolbar(element: Element | ComponentPublicInstance | null): void {
        if (element instanceof HTMLDivElement) {
            toolbar.value = element
        }
    }

    provide(DIALOG_FORM_INJECTION_KEY, {
        register(handler: DialogFormFinish<T>) {
            finish.value = handler
        },
        submit,
        loading,
    })

    async function submit(): Promise<void> {
        if (loading.value || submitting.value || isSaveDisabled.value) {
            return
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
        const result = finish.value ? await finish.value() : value.value
        resolveValue = data.action ? await data.action(result) : result
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
        if (data.required && resolveValue === null) {
            reject()
            return
        }
        resolve(resolveValue)
    }
</script>

<style lang="scss">
.ui-dialog__toolbar {
    display: contents;
}
</style>
