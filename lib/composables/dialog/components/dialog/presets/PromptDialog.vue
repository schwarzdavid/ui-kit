<template>
    <DialogFrame
        :model-value="open"
        :title="data.title"
        :translate-title="data.translateTitle"
        :width="data.width ?? 'md'"
        fullscreen-on-mobile
        @close="closeDialog"
        @opened="focusFirstInput"
        @closed="settle">
        <template #header>
            <div ref="toolbar" class="ui-dialog__toolbar" />
        </template>
        <div ref="content" class="ui-dialog__content">
            <component
                :is="data.component"
                v-if="toolbar"
                v-bind="componentProps"
                v-model="value"
                :toolbar="toolbar" />
        </div>
        <template #actions>
            <VBtn variant="text" @click="closeDialog">
                <MaybeTranslation :content="abortCta.text" :translate="abortCta.translateText" />
            </VBtn>
            <VBtn variant="flat" color="primary" :disabled="isSaveDisabled" @click="saveDialog">
                <MaybeTranslation :content="saveCta.text" :translate="saveCta.translateText" />
            </VBtn>
        </template>
    </DialogFrame>
</template>

<script lang="ts" setup generic="T, R extends boolean, C extends PromptDialogComponent<T> = PromptDialogComponent<T>">
    import { computed, ref, toValue, useTemplateRef } from 'vue'
    import { VBtn } from 'vuetify/components'
    import DialogFrame from '@/composables/dialog/components/dialog/internal/DialogFrame.vue'
    import MaybeTranslation from '@/components/internal/MaybeTranslation.vue'
    import type { PromptDialogComponent, PromptDialogProps } from '@/composables/dialog/presets/PromptDialogProps'
    import { useDialogCta } from '@/composables/dialog/internal/useDialogCta'
    import { useDialogEntry } from '@/composables/dialog/useDialogEntry'
    import { isEmptyValue } from '@/composables/dialog/internal/isEmptyValue'

    const { data, resolve, reject } = useDialogEntry<PromptDialogProps<T, R>>()

    const saveCta = useDialogCta(data.saveCta, 'save')
    const abortCta = useDialogCta(data.abortCta, 'cancel')
    const open = ref(true)
    const value = ref<T | null>(toValue(data.initialValue) ?? null)
    const toolbar = useTemplateRef<HTMLDivElement>('toolbar')
    const content = useTemplateRef<HTMLDivElement>('content')
    const isSaveDisabled = computed(() => !!data.required && isEmptyValue(value.value))
    const componentProps = computed(() => ('props' in data ? data.props : {}) as Record<string, unknown>)

    let saved = false

    function closeDialog(): void {
        if (!open.value) {
            return
        }
        saved = false
        open.value = false
    }

    function saveDialog(): void {
        if (!open.value) {
            return
        }
        saved = true
        open.value = false
    }

    function focusFirstInput(): void {
        content.value?.querySelector<HTMLElement>('input:not([type=hidden]), textarea, select')?.focus()
    }

    function settle(): void {
        const result = saved ? value.value : (toValue(data.initialValue) ?? null)
        if (data.required && isEmptyValue(result)) {
            reject()
            return
        }
        resolve(result)
    }
</script>

<style lang="scss">
.ui-dialog__toolbar {
    display: contents;
}
</style>
