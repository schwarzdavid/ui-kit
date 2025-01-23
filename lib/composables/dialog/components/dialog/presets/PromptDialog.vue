<template>
    <VDialog
        v-model="dialogModel"
        :max-width="maxWidth"
        :fullscreen="fullscreen"
        :scrollable="data.size === PromptDialogSize.LARGE"
        @after-leave="resolveDialog">
        <VCard class="prompt-dialog-card">
            <VToolbar color="primary">
                <VToolbarTitle>
                    <MaybeTranslation :translate="data.translateTitle" :content="data.title" />
                </VToolbarTitle>
                <VSpacer />
                <div ref="toolbar" class="prompt-dialog-toolbar-slot" />
                <VBtn icon="mdi-close" @click="closeDialog" />
            </VToolbar>
            <component
                :is="data.component"
                v-bind="createComponentProps()"
                v-if="toolbar"
                v-model="resolveValue"
                :toolbar="toolbar" />
            <VDivider />
            <VCardActions>
                <VSpacer />
                <VBtn :color="ctaColor" @click="closeDialog">
                    <MaybeTranslation :translate="abortCta.translateText" :content="abortCta.text" />
                </VBtn>
                <VBtn variant="elevated" :color="ctaColor" :disabled="isSaveDisabled" @click="saveDialog">
                    <MaybeTranslation :translate="saveCta.translateText" :content="saveCta.text" />
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script lang="ts" setup generic="T, R extends boolean, C extends PromptDialogComponent<T> = PromptDialogComponent<T>">
    import { VBtn, VCard, VCardActions, VDialog, VDivider, VSpacer, VToolbar, VToolbarTitle } from 'vuetify/components'
    import type { UnwrapRef } from 'vue'
    import { computed, ref, toValue } from 'vue'
    import { useDisplay } from 'vuetify'
    import { merge } from 'lodash'
    import type { PromptDialogComponent, PromptDialogProps } from '../../../presets/PromptDialogProps'
    import { PromptDialogSize } from '../../../presets/PromptDialogProps'
    import MaybeTranslation from '../../../../../components/internal/MaybeTranslation.vue'
    import type { DialogComponentEmits } from '../../../types/DialogComponent'
    import { usePluginContext } from '@/plugin/composables/usePluginContext'
    import type { DialogCta } from '@/composables/dialog/types/DialogCta'

    const props = defineProps<{ data: PromptDialogProps<T, R> }>()
    const emit = defineEmits<DialogComponentEmits<R extends true ? T : T | null>>()

    const { options: { i18n: { messages: { cancel, save } } } } = usePluginContext()

    const MAX_WIDTH_MAP: Record<PromptDialogSize, number> = {
        [PromptDialogSize.SMALL]: 650,
        [PromptDialogSize.LARGE]: 1200,
    }
    const DEFAULT_ABORT_CTA: DialogCta = {
        text: cancel,
        translateText: true,
    }
    const DEFAULT_SAVE_CTA: DialogCta = {
        text: save,
        translateText: true,
    }

    const dialogModel = ref(true)
    const resolveValue = ref<T | null>(toValue(props.data.initialValue) ?? null)
    const toolbar = ref<HTMLDivElement | null>(null)
    const { mobile } = useDisplay()
    const isSaveDisabled = computed(() => props.data.required && !resolveValue.value)
    const maxWidth = computed(() => MAX_WIDTH_MAP[props.data.size ?? PromptDialogSize.SMALL])
    const fullscreen = computed(() => props.data.size === PromptDialogSize.LARGE ? mobile.value : false)
    const abortCta = computed(() => merge({}, DEFAULT_ABORT_CTA, props.data.abortCta))
    const saveCta = computed(() => merge({}, DEFAULT_SAVE_CTA, props.data.saveCta))
    const ctaColor = computed(() => props.data.size === PromptDialogSize.LARGE ? 'secondary' : 'primary')

    function createComponentProps(): object {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (props.data as any).props ?? {}
    }

    function closeDialog(): void {
        resolveValue.value = (toValue(props.data.initialValue) ?? null) as UnwrapRef<T> | null
        dialogModel.value = false
    }

    function saveDialog(): void {
        dialogModel.value = false
    }

    function resolveDialog(): void {
        if (props.data.required && !resolveValue.value) {
            // TODO: pass error object
            emit('reject')
            return
        }

        emit('resolve', resolveValue.value)
    }
</script>

<style lang="scss" scoped>
@use "vuetify/settings";

.prompt-dialog-card {
    > :deep(.v-card-item) {
        padding-left: settings.$spacer * 4 !important;
        padding-right: settings.$spacer * 4 !important;
    }
}

.prompt-dialog-toolbar-slot {
    display: contents;
}
</style>
