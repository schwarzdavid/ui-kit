<template>
    <VDialog v-model="dialogModel" max-width="1200" scrollable @after-leave="resolveDialog">
        <VCard>
            <VToolbar color="primary">
                <VToolbarTitle>
                    <MaybeTranslation :content="data.title" :translate="data.translateTitle" />
                </VToolbarTitle>
                <VSpacer />
                <VBtn icon="$close" :aria-label="closeLabel" @click="closeDialog" />
            </VToolbar>
            <VDefaultsProvider :defaults="componentDefaults">
                <component :is="data.component" ref="formComponent" v-bind="createComponentProps()" @save="finish" />
            </VDefaultsProvider>
            <VDivider />
            <VCardActions>
                <VSpacer />
                <VBtn color="primary" @click="closeDialog">
                    <MaybeTranslation :content="abortCta.text" :translate="abortCta.translateText" />
                </VBtn>
                <VBtn variant="elevated" color="primary" @click="finish">
                    <MaybeTranslation :translate="saveCta.translateText" :content="saveCta.text" />
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup lang="ts" generic="R, T = R, C extends FormDialogComponent<T> = FormDialogComponent<T>">
    import { VBtn, VCard, VCardActions, VDialog, VDivider, VSpacer, VToolbar, VToolbarTitle, VDefaultsProvider } from 'vuetify/components'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { FormDialogComponent, FormDialogProps } from '@/composables/dialog/presets/FormDialogProps'
    import { computed, ref, useTemplateRef } from 'vue'
    import type { DialogComponentEmits } from '@/composables/dialog/types/DialogComponent'
    import useVuelidate from '@vuelidate/core'
    import { useLoading } from '@/composables/loading/useLoading'
    import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
    import { useMaybeTranslation } from '@/composables/internal/useMaybeTranslation'

    const props = defineProps<{ data: FormDialogProps<R, T, boolean, C> }>()
    const emit = defineEmits<DialogComponentEmits<R | null>>()

    const saveCta = useDialogCta(props.data.saveCta, 'save')
    const abortCta = useDialogCta(props.data.abortCta, 'cancel')
    const translate = useMaybeTranslation()
    const closeCta = useDialogCta(undefined, 'close')
    const closeLabel = computed(() => translate(closeCta.text, closeCta.translateText))

    const formComponent = useTemplateRef<InstanceType<FormDialogComponent<T>>>('formComponent')
    const dialogModel = ref(true)
    const v = useVuelidate()
    const { loading, action } = useLoading(performAction)
    const componentDefaults = computed(() => ({
        global: {
            disabled: loading.value,
        },
    }))

    let resolveValue: R | null = null

    function createComponentProps(): object {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (props.data as any).props ?? {}
    }

    async function finish() {
        if (!await v.value.$validate()) {
            return
        }
        await action()
    }

    async function performAction() {
        if (!formComponent.value) {
            throw new Error('Form component not mounted')
        }
        const result: T = await formComponent.value.finish()
        if (typeof props.data.action === 'function') {
            resolveValue = await props.data.action(result)
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            resolveValue = result as unknown as R
        }
        resolveDialog()
    }

    function closeDialog(): void {
        dialogModel.value = false
    }

    function resolveDialog() {
        if (props.data.rejectOnEmpty && resolveValue === null) {
            emit('reject')
            return
        }
        emit('resolve', resolveValue)
    }
</script>
